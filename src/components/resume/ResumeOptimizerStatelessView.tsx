"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Loader2, Sparkles, Check, Copy, Target } from "lucide-react";
import { toast } from "sonner";

export function ResumeOptimizerStatelessView() {
    const [resumeText, setResumeText] = useState("");
    const [jdText, setJdText] = useState("");
    const [optimizedContent, setOptimizedContent] = useState<string | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [viewMode, setViewMode] = useState<"optimized" | "original">("optimized");
    const [hasCopied, setHasCopied] = useState(false);

    // Sync context from App Pipeline
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedResume = sessionStorage.getItem("dodla_resume");
            const savedJd = sessionStorage.getItem("dodla_jd");
            if (savedResume) setResumeText(savedResume);
            if (savedJd) setJdText(savedJd);
        }
    }, []);

    useEffect(() => {
        if (resumeText) sessionStorage.setItem("dodla_resume", resumeText);
        if (jdText) sessionStorage.setItem("dodla_jd", jdText);
    }, [resumeText, jdText]);

    const handleOptimize = async () => {
        if (resumeText.length < 50) {
            toast.error("Please provide your original resume text.");
            return;
        }
        if (jdText.length < 50) {
            toast.error("Please provide the target job description text.");
            return;
        }

        try {
            setIsOptimizing(true);
            const response = await fetch("/api/resume/optimize-stateless", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resume_text: resumeText, jd_text: jdText }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to optimize resume.");
            }

            setOptimizedContent(data.optimized_resume_text);
            setViewMode("optimized");
            toast.success("Resume optimized instantly!");
        } catch (error: any) {
            toast.error(error.message || "Optimization failed.");
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleCopy = () => {
        const textToCopy = viewMode === "optimized" ? optimizedContent : resumeText;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            setHasCopied(true);
            toast.success("Copied to clipboard!");
            setTimeout(() => setHasCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-10 pb-16 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-cyan-500/0 rounded-[2rem] blur-xl opacity-50 transition duration-500"></div>
                    <Card className="relative h-full bg-white/80 backdrop-blur-xl border-slate-200/50 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-b from-slate-50/80 to-transparent border-b border-slate-100/50 pb-5 pt-6 px-6">
                            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                                <div className="p-2 bg-blue-100/80 rounded-xl text-blue-600"><FileText className="w-5 h-5" /></div>
                                Original Resume
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Textarea 
                                placeholder="Paste or verify your resume..."
                                className="min-h-[220px] resize-y font-mono text-[13px] leading-relaxed bg-slate-50/50 border-slate-200/60 rounded-2xl p-4 focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all shadow-inner"
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-bl from-emerald-500/20 to-teal-500/0 rounded-[2rem] blur-xl opacity-50 transition duration-500"></div>
                    <Card className="relative h-full bg-white/80 backdrop-blur-xl border-slate-200/50 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-b from-slate-50/80 to-transparent border-b border-slate-100/50 pb-5 pt-6 px-6">
                            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                                <div className="p-2 bg-emerald-100/80 rounded-xl text-emerald-600"><Target className="w-5 h-5" /></div>
                                Target JD
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Textarea 
                                placeholder="Paste or verify the target job description..."
                                className="min-h-[220px] resize-y font-mono text-[13px] leading-relaxed bg-slate-50/50 border-slate-200/60 rounded-2xl p-4 focus-visible:ring-2 focus-visible:ring-emerald-500/50 transition-all shadow-inner"
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-center pt-2 relative z-20">
                <div className="relative group inline-block">
                    <div className="absolute -inset-1 pointer-events-none bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500" />
                    <Button 
                        size="lg" 
                        onClick={handleOptimize} 
                        disabled={isOptimizing}
                        className="relative bg-slate-900 hover:bg-slate-800 text-white min-w-[280px] h-16 text-xl font-bold rounded-full shadow-2xl disabled:opacity-75 disabled:cursor-wait"
                    >
                        {isOptimizing ? (
                            <><Loader2 className="w-6 h-6 mr-3 animate-spin text-cyan-400" /> Rewriting strict alignments...</>
                        ) : (
                            <><Sparkles className="w-6 h-6 mr-3 text-blue-400" /> Auto-Optimize Resume</>
                        )}
                    </Button>
                </div>
            </div>

            {optimizedContent && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 mt-10">
                    <Card className="border-indigo-100 shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl">
                        <div className="flex px-6 pt-4 gap-2 border-b border-slate-100 bg-slate-50/50">
                            <button
                                onClick={() => setViewMode("optimized")}
                                className={\`pb-3 text-sm font-bold transition-colors border-b-2 \${viewMode === "optimized" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"}\`}
                            >
                                <Sparkles className="inline w-4 h-4 mr-2" />
                                Optimized Resume
                            </button>
                            <button
                                onClick={() => setViewMode("original")}
                                className={\`pb-3 text-sm font-bold transition-colors border-b-2 \${viewMode === "original" ? "border-slate-400 text-slate-700" : "border-transparent text-slate-500 hover:text-slate-700"}\`}
                            >
                                <FileText className="inline w-4 h-4 mr-2" />
                                Original Version
                            </button>
                        </div>
                        <div className="p-8 relative min-h-[400px]">
                            <div className="absolute top-6 right-8 z-10">
                                <Button size="sm" variant="outline" className="bg-white shadow-sm hover:text-indigo-600 rounded-xl" onClick={handleCopy}>
                                    {hasCopied ? <><Check className="w-4 h-4 mr-2 text-emerald-600" /> Copied</> : <><Copy className="w-4 h-4 mr-2" /> Copy Markdown</>}
                                </Button>
                            </div>
                            <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-800 pt-10">
                                {viewMode === "optimized" ? optimizedContent : resumeText}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
