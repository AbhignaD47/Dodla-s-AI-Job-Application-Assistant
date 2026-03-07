import { createClient } from "@/utils/supabase/server";
import { ResumeUpload } from "@/components/resume/ResumeUpload";
import { ResumeView } from "@/components/resume/ResumeView";
import { redirect } from "next/navigation";

export default async function ResumePage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: resume } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    return (
        <div className="flex flex-col gap-6 max-w-4xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">My Resume</h1>
                <p className="text-muted-foreground">
                    Upload and manage your resume. Our AI extracts your core skills to match you with the best jobs.
                </p>
            </div>

            {resume ? (
                <ResumeView resume={resume} />
            ) : (
                <ResumeUpload />
            )}
        </div>
    );
}
