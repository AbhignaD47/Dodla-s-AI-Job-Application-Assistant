import { createClient } from "@/utils/supabase/server";
import { JobScoringDashboard } from "@/components/scoring/JobScoringDashboard";
import { redirect } from "next/navigation";
import { Target } from "lucide-react";

export default async function ScorePage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.log("No user session - fallback to open tool mode");
    }

    // Fetch the User's Latest Resume automatically to pre-fill
    const { data: resumes } = await supabase
        .from("resumes")
        .select("parsed_content")
        .eq("user_id", (user?.id || "demo-user-id"))
        .order("created_at", { ascending: false })
        .limit(1);

    const initialResumeText = resumes && resumes.length > 0 ? resumes[0].parsed_content : null;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="mb-10 relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand/10 rounded-full blur-3xl -z-10" />
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center gap-4 mb-4">
                    <div className="p-3 bg-brand/10 rounded-2xl text-brand">
                        <Target className="w-8 h-8" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                        Dedicated AI Job Scoring
                    </span>
                </h1>
                <p className="text-slate-500 max-w-2xl text-lg leading-relaxed font-medium">
                    Validate your resume explicitly against any Job Description using our strict mathematical ATS algorithm. We extract exact required skills to calculate a concrete score and precise actionable improvements.
                </p>
            </div>

            <JobScoringDashboard initialResumeText={initialResumeText} />
        </div>
    );
}
