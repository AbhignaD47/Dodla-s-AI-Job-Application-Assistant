import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Mail, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { ExportPdfButton } from "@/components/resume/ExportPdfButton";

interface PortfolioPageProps {
    params: {
        userId: string;
        jobId: string;
    };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
    const supabase = createClient();
    const { userId, jobId } = params;

    const { data: application, error } = await supabase
        .from("applications")
        .select(`
            portfolio_url,
            users:user_id (
                full_name,
                email
            ),
            jobs (
                title,
                company
            )
        `)
        .eq("user_id", userId)
        .eq("job_id", jobId)
        .single();

    if (error || !application || !application.portfolio_url) {
        return notFound();
    }

    const job: any = Array.isArray(application.jobs) ? application.jobs[0] : application.jobs; // eslint-disable-line @typescript-eslint/no-explicit-any
    const user: any = Array.isArray(application.users) ? application.users[0] : application.users; // eslint-disable-line @typescript-eslint/no-explicit-any

    let portfolioData;
    try {
        portfolioData = JSON.parse(application.portfolio_url);
    } catch {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans print:bg-white">

            {/* Top Navigation Bar - Hidden in Print */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden shadow-sm">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                        <LayoutTemplate className="w-5 h-5" />
                        <span>Dodla AI Portfolio</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" className="text-slate-600">Build Your Own</Button>
                        </Link>
                        {/* Button that triggers server-side Puppeteer PDF generation and S3 storage */}
                        <ExportPdfButton jobId={jobId} />
                    </div>
                </div>
            </div>

            {/* A4 Document Container */}
            <main className="max-w-4xl mx-auto px-6 py-12 md:py-20 print:p-0 print:m-0 print:w-full print:max-w-none">

                {/* Header Section */}
                <header className="mb-16 print:mb-10 text-center md:text-left border-b border-slate-200 pb-10 print:pb-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                        {user?.full_name || "Applicant Portfolio"}
                    </h1>

                    <div className="flex flex-col md:flex-row md:items-center gap-4 text-slate-600 mb-6 font-medium">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <Briefcase className="w-4 h-4 text-emerald-600" />
                            <span>Prepared for <strong className="text-slate-800">{job?.title}</strong> at <strong className="text-slate-800">{job?.company}</strong></span>
                        </div>
                        <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-300" />
                        {user?.email && (
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <a href={`mailto:${user.email}`} className="hover:text-emerald-600 transition-colors">{user.email}</a>
                            </div>
                        )}
                    </div>

                    <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-3xl">
                        {portfolioData.about}
                    </p>
                </header>

                {/* Experience Summary Section */}
                <section className="mb-14 print:mb-8">
                    <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Experience Summary</h3>
                        <p className="text-slate-800 leading-relaxed font-medium">
                            {portfolioData.experience_summary}
                        </p>
                    </div>
                </section>

                {/* Technical Skills Section */}
                <section className="mb-16 print:mb-10 page-break-inside-avoid">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        Technical Expertise
                        <span className="h-px flex-1 bg-slate-200 ml-4" />
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {portfolioData.skills?.map((skill: string, idx: number) => (
                            <Badge
                                key={idx}
                                variant="secondary"
                                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium print:border print:border-slate-300 print:bg-transparent"
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </section>

                {/* Highlighted Projects Section */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                        Relevant Projects & Experience
                        <span className="h-px flex-1 bg-slate-200 ml-4" />
                    </h2>

                    <div className="space-y-12 print:space-y-8">
                        {portfolioData.projects?.map((project: any, idx: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            return (
                                <div key={idx} className="group page-break-inside-avoid">
                                    <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-3 gap-2">
                                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                            {project.title}
                                        </h3>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed mb-4 print:text-sm">
                                        {project.description}
                                    </p>
                                    {project.impact && (
                                        <div className="mt-3 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 print:bg-transparent print:border-slate-300">
                                            <strong className="text-emerald-700 text-sm font-semibold uppercase tracking-wide block mb-1">Impact</strong>
                                            <p className="text-slate-700 italic text-sm">{project.impact}</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-24 pt-8 border-t border-slate-200 text-center text-sm text-slate-500 print:hidden">
                    <p>Generated by Dodla AI Job Application Assistant</p>
                </footer>

            </main>
        </div>
    );
}
