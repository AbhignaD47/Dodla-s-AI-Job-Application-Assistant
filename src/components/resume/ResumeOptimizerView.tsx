"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Copy, Check, FileText } from "lucide-react";
import { toast } from "sonner";

interface ResumeOptimizerViewProps {
    jobId: string;
    initialOptimizedText?: string | null;
    initialOriginalText?: string | null;
}

export function ResumeOptimizerView({ jobId, initialOptimizedText, initialOriginalText }: ResumeOptimizerViewProps) {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedContent, setOptimizedContent] = useState<string | null>(initialOptimizedText || null);
    const [viewMode, setViewMode] = useState<"optimized" | "original">("optimized");
    const [hasCopied, setHasCopied] = useState(false);

    const handleOptimize = async () => {
        try {
            setIsOptimizing(true);
            const response = await fetch("/api/resume/optimize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ job_id: jobId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to optimize resume");
            }

            setOptimizedContent(data.optimized_resume_url);
            setViewMode("optimized");
            toast.success("Resume optimized successfully!");
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong.");
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleCopy = () => {
        const textToCopy = viewMode === "optimized" ? optimizedContent : initialOriginalText;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            setHasCopied(true);
            toast.success("Copied to clipboard!");
            setTimeout(() => setHasCopied(false), 2000);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-b-xl min-h-[500px]">
            {optimizedContent || initialOriginalText ? (
                <div className="flex flex-col h-full relative group">
                    <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="shadow-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                            onClick={handleCopy}
                        >
                            {hasCopied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2 text-emerald-600" />
                                    <span className="text-emerald-700">Copied</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Text
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Tabs / Toggle */}
                    <div className="flex px-6 pt-4 gap-2 border-b border-slate-100">
                        <button
                            onClick={() => setViewMode("optimized")}
                            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${viewMode === "optimized" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
                        >
                            <Sparkles className="inline w-3.5 h-3.5 mr-1.5" />
                            Optimized Version
                        </button>
                        <button
                            onClick={() => setViewMode("original")}
                            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${viewMode === "original" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
                        >
                            <FileText className="inline w-3.5 h-3.5 mr-1.5" />
                            Original Resume
                        </button>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto w-full prose prose-sm prose-slate max-w-none prose-headings:text-indigo-900 prose-a:text-indigo-600 outline-none">
                        <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-800">
                            {viewMode === "optimized" ? (optimizedContent || "No optimized content yet. Click Generate below.") : (initialOriginalText || "No original resume found.")}
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between items-center">
                        <span className="text-xs text-slate-500 flex items-center">
                            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                            Optimized for ATS keyword alignment
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOptimize}
                            disabled={isOptimizing}
                            className="bg-white hover:bg-indigo-50 hover:text-indigo-700 border-indigo-200 text-indigo-600 transition-colors"
                        >
                            {isOptimizing ? "Re-generating..." : (optimizedContent ? "Regenerate" : "Generate")}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-b-xl border-dashed border-2 border-slate-200 m-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-indigo-200">
                        <Sparkles className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Ready to Optimize?</h3>
                    <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                        We will analyze the original job description and rewrite your resume bullet points to maximize keyword matches and improve your ATS score.
                    </p>
                    <Button
                        size="lg"
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:shadow-lg rounded-full px-8 py-6 h-auto text-base font-medium group"
                    >
                        {isOptimizing ? (
                            <>
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                Analyzing and Rewriting...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                                Generate Optimized Resume
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
