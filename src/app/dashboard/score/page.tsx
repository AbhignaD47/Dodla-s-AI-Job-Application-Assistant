import { createClient } from "@/utils/supabase/server";
import { JobScoringDashboard } from "@/components/scoring/JobScoringDashboard";
import { redirect } from "next/navigation";
import { Target } from "lucide-react";

export default async function ScorePage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch the User's Latest Resume automatically to pre-fill
    const { data: resumes } = await supabase
        .from("resumes")
        .select("parsed_content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

    const initialResumeText = resumes && resumes.length > 0 ? resumes[0].parsed_content : null;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Target className="w-8 h-8 text-brand" />
                    Dedicated AI Job Scoring
                </h1>
                <p className="text-slate-500 mt-2 max-w-2xl text-lg">
                    Validate your resume explicitly against any Job Description using our strict mathematical ATS algorithm. We extract required skills, keywords, and domain experience to calculate a concrete score and precise actionable improvements.
                </p>
            </div>

            <JobScoringDashboard initialResumeText={initialResumeText} />
        </div>
    );
}
