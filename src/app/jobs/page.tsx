import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Briefcase, Building2, Globe, MapPin, Search } from "lucide-react";

export const metadata: Metadata = {
    title: "Find Jobs - Dodla's AI Job Assistant",
    description: "Browse curated remote tech jobs powered by Remotive API.",
};

export const dynamic = 'force-dynamic';

// Fetch initial generic jobs server-side
async function getPublicJobs() {
    try {
        const res = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=12", {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        const data = await res.json();
        return data.jobs || [];
    } catch (error) {
        console.error("Failed to fetch public jobs:", error);
        return [];
    }
}

export default async function PublicJobsPage() {
    const jobs = await getPublicJobs();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="container py-12 mx-auto max-w-7xl">
            <div className="flex flex-col items-center mb-12 text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Curated Remote Tech Jobs
                </h1>
                <p className="text-xl text-muted-foreground justify-center max-w-2xl mx-auto">
                    {user ? "Explore remote opportunities and use your AI credits to match and generate cover letters." : "Discover high-quality remote opportunities. Sign in to unlock AI-powered match scoring and auto-generated cover letters."}
                </p>

                <div className="w-full max-w-2xl flex items-center space-x-2 mt-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search job titles, required skills, or companies..."
                            className="pl-10 py-6 text-lg rounded-full shadow-sm"
                        />
                    </div>
                    <Button size="lg" className="rounded-full px-8">Search</Button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">Latest Opportunities</h2>
                {user ? (
                    <Link href="/dashboard">
                        <Button variant="outline" className="text-brand border-brand/50 hover:bg-brand/10">
                            Go to Dashboard
                            <span className="ml-2">→</span>
                        </Button>
                    </Link>
                ) : (
                    <Link href="/login">
                        <Button variant="outline" className="text-brand border-brand/50 hover:bg-brand/10">
                            Sign In for AI Matches
                            <span className="ml-2">✨</span>
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job: any) => (
                    <Card key={job.id} className="flex flex-col hover:border-brand/40 transition-colors shadow-sm hover:shadow-md cursor-pointer">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start gap-4">
                                <CardTitle className="text-xl line-clamp-2 leading-tight">
                                    {job.title}
                                </CardTitle>
                                {job.company_logo && (
                                    <img src={job.company_logo} alt={job.company_name} className="w-10 h-10 object-contain rounded-md border" />
                                )}
                            </div>
                            <div className="flex items-center text-muted-foreground mt-2 text-sm text-slate-600">
                                <Building2 className="w-4 h-4 mr-1" />
                                <span className="font-medium">{job.company_name}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-normal">
                                    <Briefcase className="w-3 h-3 mr-1" />
                                    {job.job_type || "Full Time"}
                                </Badge>
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-normal border-amber-200">
                                    <Globe className="w-3 h-3 mr-1" />
                                    Remote
                                </Badge>
                                {job.candidate_required_location && (
                                    <Badge variant="outline" className="text-slate-500 font-normal">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {job.candidate_required_location}
                                    </Badge>
                                )}
                            </div>

                            <div
                                className="text-sm text-muted-foreground line-clamp-3 text-ellipsis prose prose-sm prose-slate"
                                dangerouslySetInnerHTML={{ __html: job.description.substring(0, 150) + "..." }}
                            />
                        </CardContent>
                        <CardFooter className="pt-4 border-t bg-slate-50/50 mt-auto flex justify-between items-center rounded-b-xl">
                            <span className="text-xs text-slate-500 font-medium pb-2">
                                {new Date(job.publication_date).toLocaleDateString()}
                            </span>
                            {user ? (
                                <Link href={job.url || "#"} target="_blank" prefetch={false}>
                                    <Button size="sm" variant="ghost" className="text-brand hover:text-brand hover:bg-brand/10 group">
                                        Apply Now
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">→</span>
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/login">
                                    <Button size="sm" variant="ghost" className="text-brand hover:text-brand hover:bg-brand/10 group">
                                        Match & Apply
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">→</span>
                                    </Button>
                                </Link>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {jobs.length === 0 && (
                <div className="text-center py-24 text-muted-foreground">
                    Failed to load jobs. Please try again later.
                </div>
            )}
        </div>
    );
}
