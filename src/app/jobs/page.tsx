import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, Building2, Globe, MapPin } from "lucide-react";
import { JobSearchForm } from "./JobSearchForm";

export const metadata: Metadata = {
    title: "Find Jobs - Dodla's AI Job Assistant",
    description: "Browse curated tech jobs powered by AI.",
};

export const dynamic = 'force-dynamic';

interface Job {
    id: string | number;
    title: string;
    company?: { display_name?: string };
    location?: { display_name?: string; area?: string[] };
    contract_time?: string;
    description: string;
    created: string;
    redirect_url?: string;
}

// Fetch jobs server-side
async function getJobs(query: string, location: string) {
    try {
        const adzunaAppId = "be001e44";
        const adzunaAppKey = "ffa3d1155d68cbdad175d4e716c9b170";

        let adzunaUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${adzunaAppId}&app_key=${adzunaAppKey}&results_per_page=12&what=${encodeURIComponent(query)}`;

        if (location && location.trim() !== "") {
            adzunaUrl += `&where=${encodeURIComponent(location.trim())}`;
        }

        const res = await fetch(adzunaUrl, { cache: 'no-store' });
        const data = await res.json();
        return data.results || [];
    } catch (error) {
        console.error("Failed to fetch jobs:", error);
        return [];
    }
}

export default async function PublicJobsPage({
    searchParams,
}: {
    searchParams: { q?: string; location?: string };
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let defaultQuery = "software developer";
    const defaultLocation = "";

    // If user is logged in, check for their resume
    if (user) {
        const { data: resumes } = await supabase
            .from("resumes")
            .select("skills")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        if (!resumes || resumes.length === 0) {
            // Enforce Resume-First: if user has no resume, they must upload one
            redirect("/dashboard/resume");
        }

        // If no specific query is provided, use resume data
        if (!searchParams.q && resumes[0].skills) {
            const skills = resumes[0].skills;
            if (skills.skills && skills.skills.length > 0) {
                defaultQuery = skills.skills[0];
            } else if (skills.keywords && skills.keywords.length > 0) {
                defaultQuery = skills.keywords[0];
            } else if (skills.technologies && skills.technologies.length > 0) {
                defaultQuery = skills.technologies[0];
            }
        }
    }

    const currentQuery = searchParams.q || defaultQuery;
    const currentLocation = searchParams.location || defaultLocation;

    const jobs = await getJobs(currentQuery, currentLocation);

    return (
        <div className="container py-12 mx-auto max-w-7xl">
            <div className="flex flex-col items-center mb-12 text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Curated Tech Jobs
                </h1>
                <p className="text-xl text-muted-foreground justify-center max-w-2xl mx-auto">
                    {user ? "Explore remote and local opportunities. Finding matches based on your profile!" : "Discover high-quality opportunities. Open the dashboard to utilize AI-powered tools."}
                </p>

                <JobSearchForm initialQuery={searchParams.q || ""} initialLocation={searchParams.location || ""} />
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">
                    {searchParams.q || searchParams.location ? "Search Results" : "Latest Opportunities for You"}
                </h2>
                {user ? (
                    <Link href="/dashboard">
                        <Button variant="outline" className="text-brand border-brand/50 hover:bg-brand/10">
                            Go to Dashboard
                            <span className="ml-2">→</span>
                        </Button>
                    </Link>
                ) : (
                    <Link href="/dashboard">
                        <Button variant="outline" className="text-brand border-brand/50 hover:bg-brand/10">
                            Enter Dashboard
                            <span className="ml-2">✨</span>
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job: Job) => (
                    <Card key={job.id} className="flex flex-col hover:border-brand/40 transition-colors shadow-sm hover:shadow-md cursor-pointer">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start gap-4">
                                <CardTitle className="text-xl line-clamp-2 leading-tight">
                                    {job.title}
                                </CardTitle>
                            </div>
                            <div className="flex items-center text-muted-foreground mt-2 text-sm text-slate-600 gap-3">
                                <div className="flex items-center">
                                    <Building2 className="w-4 h-4 mr-1" />
                                    <span className="font-medium">{job.company?.display_name || "Unknown Company"}</span>
                                </div>
                                {job.location?.display_name && (
                                    <div className="flex items-center text-slate-500">
                                        <MapPin className="w-3.5 h-3.5 mr-1" />
                                        <span className="truncate max-w-[120px]" title={job.location.display_name}>{job.location.display_name}</span>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {(job.contract_time || "full_time") && (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-normal">
                                        <Briefcase className="w-3 h-3 mr-1" />
                                        {job.contract_time ? job.contract_time.replace("_", " ") : "Full Time"}
                                    </Badge>
                                )}
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-normal border-amber-200">
                                    <Globe className="w-3 h-3 mr-1" />
                                    {job.location?.area?.includes("Remote") || job.title.toLowerCase().includes("remote") ? "Remote" : "On-site/Hybrid"}
                                </Badge>
                            </div>

                            <div
                                className="text-sm text-muted-foreground line-clamp-3 text-ellipsis prose prose-sm prose-slate"
                                dangerouslySetInnerHTML={{ __html: job.description.substring(0, 150) + "..." }}
                            />
                        </CardContent>
                        <CardFooter className="pt-4 border-t bg-slate-50/50 mt-auto flex justify-between items-center rounded-b-xl">
                            <span className="text-xs text-slate-500 font-medium pb-2">
                                {new Date(job.created).toLocaleDateString()}
                            </span>
                            {user ? (
                                <Link href={job.redirect_url || "#"} target="_blank" prefetch={false}>
                                    <Button size="sm" variant="ghost" className="text-brand hover:text-brand hover:bg-brand/10 group">
                                        Apply Now
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">→</span>
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/dashboard">
                                    <Button size="sm" variant="ghost" className="text-brand hover:text-brand hover:bg-brand/10 group">
                                        Open Tools
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
                    Failed to load jobs or no jobs matching your criteria were found. Please try a different search.
                </div>
            )}
        </div>
    );
}
