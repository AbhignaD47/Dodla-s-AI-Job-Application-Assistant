import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ApplicationKanban } from "@/components/applications/ApplicationKanban";

export default async function ApplicationsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.log("No user session - fallback to open tool mode");
    }

    // Fetch the user's applications joined with the job details
    const { data: applications } = await supabase
        .from("applications")
        .select(`
            status,
            created_at,
            jobs (
                id,
                title,
                company,
                applies_link
            )
        `)
        .eq("user_id", (user?.id || "demo-user-id"));

    return (
        <div className="flex flex-col gap-6 h-full min-h-[calc(100vh-8rem)]">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
                <p className="text-muted-foreground">
                    Track your job search progress across different stages.
                </p>
            </div>

            <ApplicationKanban initialApplications={(applications as any) || []} />
        </div>
    );
}
