import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";

const PLANS = {
    weekly: { amount: 599, credits: 5000, validity: 7 },
    monthly: { amount: 2499, credits: 25000, validity: 30 },
    yearly: { amount: 26999, credits: 300000, validity: 365 },
};

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(rawBody)
            .digest("hex");

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(rawBody);

        if (event.event === "payment.captured" || event.event === "order.paid") {
            const paymentData = event.payload.payment.entity;
            const orderId = paymentData.order_id;

            // Note: we can't use SSR auth client here because this is a webhook called by Razorpay, no user session.
            // We need to use the service role key to bypass RLS.
            const { createClient: createSupabase } = require('@supabase/supabase-js');
            const supabaseAdmin = createSupabase(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                { auth: { persistSession: false } }
            );

            // Fetch pending payment
            const { data: paymentRecord } = await supabaseAdmin
                .from("payments")
                .select("*, users!inner(id, credits)")
                .eq("razorpay_order_id", orderId)
                .single();

            if (!paymentRecord || paymentRecord.status === "completed") {
                return NextResponse.json({ success: true, message: "Payment already processed or not found." });
            }

            const userId = paymentRecord.user_id;

            let plan_type = "weekly"; // default or derived based on amount/internal logic
            const amountPaid = paymentRecord.amount;

            // Determine plan based on original amount if promo wasn't 100%
            // In a real system, we'd store `plan_type` in the payments table. We will infer it here or we should alter the table.
            // For simplicity, let's infer derived from amount if no promo, or assume monthly.
            if (amountPaid >= 20000) plan_type = "yearly";
            else if (amountPaid >= 2000) plan_type = "monthly";
            else plan_type = "weekly";

            const plan = PLANS[plan_type as keyof typeof PLANS];

            // Mark payment completed
            await supabaseAdmin
                .from("payments")
                .update({ status: "completed", razorpay_payment_id: paymentData.id })
                .eq("id", paymentRecord.id);

            // Mark promo code as used if there was one
            if (paymentRecord.promo_code_id) {
                await supabaseAdmin.from('promo_code_usage').insert({ promo_id: paymentRecord.promo_code_id, user_id: userId }).select();
                await supabaseAdmin.from('promo_codes').update({ is_used: true, is_active: false }).eq('id', paymentRecord.promo_code_id);
            }

            // Handle rollover logic
            const { data: dbUser } = await supabaseAdmin.from('users').select('credits').eq('id', userId).single();
            const currentCredits = dbUser?.credits || 0;

            const { data: prevSub } = await supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId).eq('status', 'active').single();
            let rollover = 0;
            if (prevSub && currentCredits > 0) {
                rollover = Math.floor(currentCredits * 0.5);
            }

            const totalCredits = plan.credits + rollover;
            await supabaseAdmin.from('users').update({ credits: currentCredits > 0 ? totalCredits : plan.credits }).eq('id', userId);

            await supabaseAdmin.from('credit_transactions').insert({
                user_id: userId, amount: plan.credits + rollover, type: "addition", reference: `subscription_${plan_type}`
            });

            // Upsert Subscription
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + plan.validity);

            await supabaseAdmin.from('subscriptions').upsert({
                user_id: userId,
                plan_type: plan_type,
                status: 'active',
                current_period_end: endDate.toISOString(),
            }, { onConflict: 'user_id' });

        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
