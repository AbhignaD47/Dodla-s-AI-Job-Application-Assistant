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
        ats_score: number;
        skill_gap_analysis: {
            matching: string[];
            missing: string[];
        };
        match_summary: string;
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
                Live Job Matches (&gt;70% Relevance)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((match, idx) => (
                    <Card key={idx} className="flex flex-col hover:border-brand/40 transition-colors shadow-sm">
                        <CardHeader className="pb-4 relative overflow-hidden bg-slate-50/50 rounded-t-xl border-b border-slate-100">
                            {/* Accent line for high scores */}
                            {match.score.ats_score >= 80 && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                            )}
                            {match.score.ats_score < 80 && match.score.ats_score >= 60 && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-500" />
                            )}
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <CardTitle className="text-xl font-bold text-slate-900 leading-tight mb-2">
                                        {match.job.title}
                                    </CardTitle>
                                    <div className="flex flex-wrap items-center text-slate-600 gap-y-2 gap-x-4 text-sm font-medium">
                                        <div className="flex items-center">
                                            <Building2 className="w-4 h-4 mr-1.5 text-slate-400" />
                                            {match.job.company_name}
                                        </div>
                                        {match.job.location && (
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                                                {match.job.location}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Hero ATS Score Block */}
                                <div className="flex flex-col items-center justify-center shrink-0">
                                    <div className={`
                                        flex items-center justify-center w-16 h-16 rounded-full border-4 shadow-sm
                                        ${match.score.ats_score >= 80 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                                            match.score.ats_score >= 60 ? 'border-amber-400 bg-amber-50 text-amber-700' :
                                                'border-red-400 bg-red-50 text-red-700'}
                                    `}>
                                        <span className="text-xl font-black">{match.score.ats_score}</span>
                                        <span className="text-xs font-bold -mt-3 relative top-2">%</span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-2">ATS Score</span>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col pt-5 pb-4 px-5">
                            {/* Elevated Match Summary */}
                            <div className="bg-brand/5 border-l-4 border-brand p-4 rounded-r-md mb-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-brand" />
                                    <span className="text-sm font-bold text-brand uppercase tracking-wider">AI Match Analysis</span>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed font-medium">
                                    {match.score.match_summary}
                                </p>
                            </div>

                            <div className="space-y-5 flex-1">
                                {/* Visually distinct Skill Sections */}
                                <div>
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-emerald-100">
                                        <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            Matching Skills Found
                                        </span>
                                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                            {match.score.skill_gap_analysis.matching.length}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {match.score.skill_gap_analysis.matching.length > 0 ? (
                                            match.score.skill_gap_analysis.matching.slice(0, 8).map((skill, i) => (
                                                <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2.5 py-0.5 font-medium hover:bg-emerald-100 transition-colors">
                                                    {skill}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">None found</span>
                                        )}
                                        {match.score.skill_gap_analysis.matching.length > 8 && (
                                            <Badge variant="outline" className="text-xs px-2 py-0.5 border-emerald-200 text-emerald-600 bg-white">
                                                +{match.score.skill_gap_analysis.matching.length - 8} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-red-100">
                                        <span className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            Skill Gaps (Missing)
                                        </span>
                                        <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                            {match.score.skill_gap_analysis.missing.length}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {match.score.skill_gap_analysis.missing.length > 0 ? (
                                            match.score.skill_gap_analysis.missing.slice(0, 8).map((skill, i) => (
                                                <Badge key={i} variant="secondary" className="bg-red-50 text-red-700 border-red-200 text-xs px-2.5 py-0.5 font-medium hover:bg-red-100 transition-colors">
                                                    {skill}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-md inline-block w-full text-center border border-emerald-100">
                                                Perfect Match! No major skill gaps identified.
                                            </span>
                                        )}
                                        {match.score.skill_gap_analysis.missing.length > 8 && (
                                            <Badge variant="outline" className="text-xs px-2 py-0.5 border-red-200 text-red-600 bg-white">
                                                +{match.score.skill_gap_analysis.missing.length - 8} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 pb-4 px-5 border-t bg-slate-50 mt-auto flex justify-between items-center rounded-b-xl">
                            <span className="text-xs font-medium text-slate-500">
                                Analysis driven by <strong className="text-slate-700">gpt-4o</strong>
                            </span>
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
