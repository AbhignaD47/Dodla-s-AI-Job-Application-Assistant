"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, LayoutTemplate, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface PortfolioGeneratorViewProps {
    jobId: string;
    userId: string;
    hasExistingPortfolio: boolean;
}

export function PortfolioGeneratorView({ jobId, userId, hasExistingPortfolio }: PortfolioGeneratorViewProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasPortfolio, setHasPortfolio] = useState(hasExistingPortfolio);

    const handleGenerate = async () => {
        try {
            setIsGenerating(true);
            const response = await fetch("/api/generate/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ job_id: jobId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate portfolio");
            }

            setHasPortfolio(true);
            toast.success("Tailored portfolio generated successfully!");
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-b-xl min-h-[500px] border-t border-slate-100">
            {hasPortfolio ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center m-4">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-inner">
                        <LayoutTemplate className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Portfolio Ready</h3>
                    <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                        We&apos;ve extracted your most relevant projects and skills based on this job description. Your public portfolio is ready to share.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
                        <Link href={`/p/${userId}/${jobId}`} target="_blank">
                            <Button
                                size="lg"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:shadow-lg w-full sm:w-auto"
                            >
                                View Public Link
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-white hover:bg-slate-50 border-slate-200 text-slate-600 w-full sm:w-auto"
                        >
                            {isGenerating ? "Regenerating..." : "Regenerate"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-b-xl border-dashed border-2 border-slate-200 m-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-200">
                        <LayoutTemplate className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Tailored Portfolio</h3>
                    <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                        Generate a customized web portfolio highlighting only the projects and skills that matter most for this specific role.
                    </p>
                    <Button
                        size="lg"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:shadow-lg rounded-full px-8 py-6 h-auto text-base font-medium group"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                Extracting Projects...
                            </>
                        ) : (
                            <>
                                <LayoutTemplate className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                                Generate Tailored Portfolio
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
