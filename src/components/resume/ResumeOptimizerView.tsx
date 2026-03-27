"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Copy, Check, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { exportTemplateToPDF } from "@/utils/export";
import { ResumeData } from "@/types/resume";
import { ResumeTemplate } from "@/components/resume/ResumeTemplate";

interface ResumeOptimizerViewProps {
    jobId: string;
    initialOptimizedText?: string | null;
    initialOriginalText?: string | null;
}

export function ResumeOptimizerView({ jobId, initialOptimizedText, initialOriginalText }: ResumeOptimizerViewProps) {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedContent, setOptimizedContent] = useState<ResumeData | null>(null);
    const [viewMode, setViewMode] = useState<"optimized" | "original">("optimized");
    const [hasCopied, setHasCopied] = useState(false);

    // Parse initial JSON if it exists
    useEffect(() => {
        if (initialOptimizedText) {
            try {
                const parsed = JSON.parse(initialOptimizedText);
                setOptimizedContent(parsed);
            } catch (e) {
                console.error("Failed to parse initial optimized resume JSON", e);
            }
        }
    }, [initialOptimizedText]);

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

            setOptimizedContent(data.optimized_resume_json);
            setViewMode("optimized");
            toast.success("Resume accurately mapped to premium template!");
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong.");
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleCopy = () => {
        if (viewMode === "original" && initialOriginalText) {
            navigator.clipboard.writeText(initialOriginalText);
            setHasCopied(true);
            toast.success("Copied to clipboard!");
            setTimeout(() => setHasCopied(false), 2000);
        } else if (viewMode === "optimized" && optimizedContent) {
            toast.info("Optimized Resume is a visual template. Please export as PDF!");
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 border-t border-slate-100 rounded-b-xl min-h-[600px]">
            {optimizedContent || initialOriginalText ? (
                <div className="flex flex-col h-full relative group">
                    {/* Tabs / Toggle */}
                    <div className="flex px-6 pt-4 gap-2 border-b border-slate-200 bg-white">
                        <button
                            onClick={() => setViewMode("optimized")}
                            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${viewMode === "optimized" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
                        >
                            <Sparkles className="inline w-3.5 h-3.5 mr-1.5" />
                            Optimized Template
                        </button>
                        <button
                            onClick={() => setViewMode("original")}
                            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${viewMode === "original" ? "border-slate-400 text-slate-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
                        >
                            <FileText className="inline w-3.5 h-3.5 mr-1.5" />
                            Original Resume
                        </button>
                        
                        <div className="ml-auto flex gap-2 pb-2">
                            {viewMode === "optimized" && (
                                <Button size="sm" variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-8" onClick={() => exportTemplateToPDF("resume-template-root-auth", "Job_Application_Resume.pdf")}>
                                    <Download className="w-3 h-3 mr-2" /> Download PDF
                                </Button>
                            )}
                            {viewMode === "original" && (
                                <Button size="sm" variant="outline" className="bg-white shadow-sm border-slate-200 h-8 text-slate-600" onClick={handleCopy}>
                                    {hasCopied ? <><Check className="w-3 h-3 mr-1.5 text-emerald-600" /> Copied</> : <><Copy className="w-3 h-3 mr-1.5" /> Copy Text</>}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto w-full outline-none custom-scrollbar">
                        {viewMode === "optimized" && optimizedContent ? (
                            <div className="min-w-[850px] mx-auto transform transition-transform origin-top flex justify-center pb-8 border border-slate-200 shadow-sm bg-white rounded-md overflow-hidden">
                                <ResumeTemplate data={optimizedContent} id="resume-template-root-auth" />
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-800 bg-white p-6 rounded-2xl shadow-inner border border-slate-200 max-w-4xl mx-auto">
                                {initialOriginalText || "No original resume found."}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center rounded-b-xl">
                        <span className="text-xs font-medium text-slate-500 flex items-center">
                            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                            Mapped strictly to professional layout
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOptimize}
                            disabled={isOptimizing}
                            className="bg-white hover:bg-indigo-50 hover:text-indigo-700 border-indigo-200 text-indigo-600 transition-colors shadow-sm"
                        >
                            {isOptimizing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Remapping...</> : (optimizedContent ? "Regenerate Template" : "Generate")}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-transparent m-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-indigo-200">
                        <Sparkles className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Ready to Optimize?</h3>
                    <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                        We will analyze the original job description and map your resume strictly into a highly ATS-compatible, pixel-perfect visual template.
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
                                Processing Template Mapping...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                                Generate Visual Resume
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
