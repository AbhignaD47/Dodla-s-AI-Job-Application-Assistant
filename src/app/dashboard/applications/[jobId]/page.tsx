import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Building2, Briefcase, Bot, ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";
import { ResumeOptimizerView } from "@/components/resume/ResumeOptimizerView";

export default async function ApplicationDetailPage({ params }: { params: { jobId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const jobId = params.jobId;

    // Fetch application details and job context
    const { data: application } = await supabase
        .from("applications")
        .select(`
            status,
            created_at,
            optimized_resume_url,
            cover_letter_text,
            jobs (
                id,
                title,
                company,
                description,
                applies_link
            )
        `)
        .eq("user_id", user.id)
        .eq("job_id", jobId)
        .single();

    if (!application || !application.jobs) {
        redirect("/dashboard/applications");
    }

    const job: any = Array.isArray(application.jobs) ? application.jobs[0] : application.jobs; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Format the date
    const dateApplied = new Date(application.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">

            {/* Nav and Header */}
            <div>
                <Link href="/dashboard/applications" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Kanban Board
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{job.title}</h1>
                        <div className="flex flex-wrap items-center text-slate-600 gap-4 text-sm font-medium">
                            <span className="flex items-center">
                                <Building2 className="w-4 h-4 mr-1 text-slate-400" />
                                {job.company}
                            </span>
                            <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                                Saved {dateApplied}
                            </span>
                            <Badge variant="outline" className="capitalize px-3 py-1 ml-2 border-slate-300">
                                {application.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>

                    {job.applies_link && (
                        <Link href={job.applies_link} target="_blank">
                            <Button className="bg-brand text-white hover:bg-brand/90 px-6">
                                Apply Externally
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                {/* Left Column - Tools */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Optimizer Workspace */}
                    <Card className="border-indigo-100 shadow-md">
                        <CardHeader className="bg-indigo-50/50 rounded-t-xl pb-4 border-b border-indigo-100">
                            <div className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-indigo-600" />
                                <CardTitle className="text-lg text-indigo-900">AI Resume Optimizer</CardTitle>
                            </div>
                            <CardDescription className="text-indigo-700/80 mt-1">
                                Generate an ATS-friendly, keyword-optimized version of your resume specifically for this role.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* We will build this client component next */}
                            <ResumeOptimizerView
                                jobId={job.id}
                                initialOptimizedText={application.optimized_resume_url}
                            />
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column - Meta / Original Details */}
                <div className="space-y-6">
                    <Card className="border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center">
                                <Briefcase className="w-4 h-4 mr-2 text-slate-500" />
                                Original Job Context
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600 max-h-[500px] overflow-y-auto pr-2">
                            <div dangerouslySetInnerHTML={{ __html: job.description || "No description available." }} className="prose prose-sm prose-slate max-w-none" />
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    );
}
