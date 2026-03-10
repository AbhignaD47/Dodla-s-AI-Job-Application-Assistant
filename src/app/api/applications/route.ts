import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { action, job_id } = body;
        // action: 'start' | 'mark_applied' | 'update_status'
        // new_status: 'interview' | 'offer' | 'rejected'

        if (!action || !job_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Get current user credits & admin status
        const { data: dbUser } = await supabase
            .from("users")
            .select("credits, is_admin")
            .eq("id", user.id)
            .single();

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { credits } = dbUser;

        if (action === "start") {
            const deduction = 0;

            // Start transaction-like behavior using rpc or distinct updates
            // Note: In production Supabase, prefer a Postgres function for exact transaction logic.
            // Here we simulate it with sequential updates.
            const { data: appData, error: appError } = await supabase
                .from("applications")
                .upsert({ user_id: user.id, job_id, status: "in_progress", updated_at: new Date().toISOString() })
                .select()
                .single();

            if (appError) throw appError;

            if (deduction > 0) {
                await supabase.from("users").update({ credits: credits - deduction }).eq("id", user.id);
                await supabase.from("credit_transactions").insert({
                    user_id: user.id,
                    amount: -deduction,
                    type: "deduction",
                    reference: `start_application_${job_id}`
                });
            }

            return NextResponse.json({ success: true, application: appData, deducted: deduction, newCredits: credits - deduction });

        } else if (action === "mark_applied") {
            const deduction = 0;

            const { data: appData, error: appError } = await supabase
                .from("applications")
                .update({ status: "applied", updated_at: new Date().toISOString() })
                .eq("user_id", user.id)
                .eq("job_id", job_id)
                .select()
                .single();

            if (appError) throw appError;

            if (deduction > 0) {
                await supabase.from("users").update({ credits: credits - deduction }).eq("id", user.id);
                await supabase.from("credit_transactions").insert({
                    user_id: user.id,
                    amount: -deduction,
                    type: "deduction",
                    reference: `mark_applied_${job_id}`
                });
            }

            return NextResponse.json({ success: true, application: appData, deducted: deduction, newCredits: credits - deduction });

        } else if (action === "update_status") {
            const { new_status } = body; // 'interview', 'offer', 'rejected'

            if (!["saved", "in_progress", "applied", "interview", "offer", "rejected"].includes(new_status)) {
                return NextResponse.json({ error: "Invalid status" }, { status: 400 });
            }

            const { data: appData, error: appError } = await supabase
                .from("applications")
                .update({ status: new_status, updated_at: new Date().toISOString() })
                .eq("user_id", user.id)
                .eq("job_id", job_id)
                .select()
                .single();

            if (appError) throw appError;

            return NextResponse.json({ success: true, application: appData });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        console.error("Application action error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
