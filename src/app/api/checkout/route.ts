import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const PLANS = {
    weekly: { amount: 599, credits: 5000, validity: 7 },
    monthly: { amount: 2499, credits: 25000, validity: 30 },
    yearly: { amount: 26999, credits: 300000, validity: 365 },
};

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { plan_type, promo_code } = await req.json();

        if (!['weekly', 'monthly', 'yearly'].includes(plan_type)) {
            return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
        }

        const plan = PLANS[plan_type as keyof typeof PLANS];
        let finalAmount = plan.amount;
        let promoId = null;

        // Apply Promo Code
        if (promo_code) {
            // Fetch promo code globally
            const { data: promo } = await supabase
                .from("promo_codes")
                .select("*")
                .eq("code", promo_code)
                .eq("is_active", true)
                .single();

            if (!promo) {
                return NextResponse.json({ error: "Invalid or inactive promo code" }, { status: 400 });
            }

            if (promo.is_used) {
                return NextResponse.json({ error: "Promo code has already been used by someone" }, { status: 400 });
            }

            if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
                return NextResponse.json({ error: "Promo code expired" }, { status: 400 });
            }

            // Calculate discount
            promoId = promo.id;
            const discountAmount = Math.floor((finalAmount * promo.discount_percent) / 100);
            finalAmount -= discountAmount;

            // Ensure min 0
            if (finalAmount < 0) finalAmount = 0;
        }

        // 100% Discount Bypass
        if (finalAmount === 0 && promoId) {
            // Mark promo as used (Server-side constraint prevents race condition via unique constraint on promo_code_usage usually, 
            // but here we mark it explicitly used, and let the webhook/process handle it)

            const { error: usageError } = await supabase.from('promo_code_usage').insert({
                promo_id: promoId,
                user_id: user.id
            });

            if (usageError) {
                return NextResponse.json({ error: "Promo code already redeemed" }, { status: 400 });
            }

            await supabase.from('promo_codes').update({ is_used: true, is_active: false }).eq('id', promoId);

            // Create Payment Record
            const { data: paymentRecord } = await supabase.from('payments').insert({
                user_id: user.id,
                amount: 0,
                currency: 'INR',
                status: 'completed',
                promo_code_id: promoId
            }).select().single();

            // Grant credits and subscription
            const { data: dbUser } = await supabase.from('users').select('credits').eq('id', user.id).single();
            const currentCredits = dbUser?.credits || 0;

            // Handle rollover 50%
            const { data: prevSub } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').single();
            let rollover = 0;
            if (prevSub && currentCredits > 0) {
                rollover = Math.floor(currentCredits * 0.5);
            }

            const totalCredits = plan.credits + rollover;

            await supabase.from('users').update({ credits: currentCredits > 0 ? totalCredits : plan.credits }).eq('id', user.id);

            // Upsert Subscription
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + plan.validity);

            await supabase.from('subscriptions').upsert({
                user_id: user.id,
                plan_type: plan_type,
                status: 'active',
                current_period_end: endDate.toISOString(),
            }, { onConflict: 'user_id' }); // Ensures 1 active sub per user

            return NextResponse.json({ success: true, is_free: true, message: "Subscription activated successfully via promo code." });
        }

        // Create Razorpay Order
        const options = {
            amount: finalAmount * 100, // INR in paise
            currency: "INR",
            receipt: `receipt_${user.id}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Save pending payment record to DB
        await supabase.from('payments').insert({
            user_id: user.id,
            amount: finalAmount,
            currency: "INR",
            status: "pending",
            razorpay_order_id: order.id,
            promo_code_id: promoId // Link promo to order
        });

        return NextResponse.json({ success: true, order_id: order.id, amount: finalAmount });

    } catch (error: any) {
        console.error("Checkout creation error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
