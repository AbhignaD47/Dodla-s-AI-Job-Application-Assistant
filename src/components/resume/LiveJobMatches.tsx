"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Building2, ExternalLink, Loader2, Target, MapPin } from "lucide-react";
import Link from "next/link";

export interface JobMatch {
    job: {
        id: string;
        title: string;
        company_name: string;
        location?: string;
        description: string;
        url: string;
    };
    score: {
        relevance_score: number;
        matching_skills: string[];
        missing_skills: string[];
        ats_summary: string;
    };
}

interface LiveJobMatchesProps {
    matches: JobMatch[];
    isLoading: boolean;
    hasSearched: boolean;
}

export function LiveJobMatches({ matches, isLoading, hasSearched }: LiveJobMatchesProps) {
    if (isLoading) {
        return (
            <Card className="mt-8 border-brand/20 shadow-md">
                <CardContent className="py-12 flex flex-col items-center justify-center text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin mb-4 text-brand" />
                    <p>Analyzing live job market and calculating ATS scores...</p>
                </CardContent>
            </Card>
        );
    }

    if (!hasSearched) {
        return null;
    }

    if (matches.length === 0) {
        return (
            <div className="mt-8 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Target className="text-pink-500" />
                    Live Job Matches
                </h2>
                <Card className="border-brand/20 shadow-md bg-slate-50/50">
                    <CardContent className="py-12 flex flex-col items-center justify-center text-slate-500 text-center">
                        <Briefcase className="h-10 w-10 mb-4 text-slate-300" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-1">No highly relevant jobs found</h3>
                        <p className="max-w-md">
                            We analyzed the latest live listings based on your preferences, but none met our 70% relevance threshold.
                            Consider editing your keywords and trying again!
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Target className="text-pink-500" />
                Live Job Matches (>70% Relevance)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((match, idx) => (
                    <Card key={idx} className="flex flex-col hover:border-brand/40 transition-colors shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-2">
                                <CardTitle className="text-lg line-clamp-2 leading-tight">
                                    {match.job.title}
                                </CardTitle>
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 ml-2 whitespace-nowrap">
                                    {match.score.relevance_score}% Match
                                </Badge>
                            </div>
                            <div className="flex items-center text-muted-foreground mt-1 text-sm text-slate-600 gap-3">
                                <div className="flex items-center">
                                    <Building2 className="w-4 h-4 mr-1" />
                                    <span className="font-medium">{match.job.company_name}</span>
                                </div>
                                {match.job.location && (
                                    <div className="flex items-center text-slate-500">
                                        <MapPin className="w-3.5 h-3.5 mr-1" />
                                        <span>{match.job.location}</span>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 pb-3 text-sm">
                            <p className="text-slate-700 mb-3 italic">"{match.score.ats_summary}"</p>

                            <div className="space-y-2">
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Matching Skills</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {match.score.matching_skills.slice(0, 3).map((skill, i) => (
                                            <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {match.score.matching_skills.length > 3 && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{match.score.matching_skills.length - 3}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-3 border-t bg-slate-50/50 mt-auto flex justify-end">
                            <Link href={match.job.url || "#"} target="_blank" prefetch={false}>
                                <Button size="sm" variant="ghost" className="text-brand hover:text-brand hover:bg-brand/10">
                                    View & Apply
                                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
