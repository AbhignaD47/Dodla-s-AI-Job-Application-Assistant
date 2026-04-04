"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Sparkles, Target, Copy, Check, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";

export function PortfolioStatelessView() {
    const searchParams = useSearchParams();
    const urlResumeId = searchParams.get("resume_id");
    const urlJdId = searchParams.get("jd_id");

    const [resumeText, setResumeText] = useState("");
    const [jdText, setJdText] = useState("");
    const [portfolioData, setPortfolioData] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasCopied, setHasCopied] = useState(false);
    const [hasAutoFetched, setHasAutoFetched] = useState(false);

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

    useEffect(() => {
        if (urlResumeId && urlJdId && !hasAutoFetched) {
            setHasAutoFetched(true);
            handleGenerate(urlResumeId, urlJdId);
        }
    }, [urlResumeId, urlJdId, hasAutoFetched]);

    const handleGenerate = async (resumeIdToUse?: string, jdIdToUse?: string) => {
        const finalResumeId = resumeIdToUse || urlResumeId;
        const finalJdId = jdIdToUse || urlJdId;

        setIsGenerating(true);
        try {
            let response;
            if (finalResumeId && finalJdId) {
                response = await fetch("/api/generate/portfolio-stateless", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ resume_id: finalResumeId, jd_id: finalJdId }),
                });
            } else {
                if (resumeText.length < 50) {
                    toast.error("Please provide your original resume text.");
                    setIsGenerating(false);
                    return;
                }
                if (jdText.length < 50) {
                    toast.error("Please provide the target job description.");
                    setIsGenerating(false);
                    return;
                }
                response = await fetch("/api/generate/portfolio-stateless", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ resume_text: resumeText, jd_text: jdText }),
                });
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to generate portfolio.");
            }

            setPortfolioData(data.portfolio_json);
            if (data.original_resume_text) setResumeText(data.original_resume_text);
            toast.success("Tailored Portfolio generated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Generation failed.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (portfolioData) {
            const textToCopy = `# ${portfolioData.about}\n\n## Experience Summary\n${portfolioData.experience_summary}\n\n## Technical Core Skills\n${portfolioData.skills?.join(", ")}\n\n## Highlighted Projects\n${portfolioData.projects?.map((p: any) => `### ${p.title}\n${p.description}\nImpact: ${p.impact}`).join("\n\n")}`;
            navigator.clipboard.writeText(textToCopy);
            setHasCopied(true);
            toast.success("Portfolio text copied!");
            setTimeout(() => setHasCopied(false), 2000);
        }
    };

    const hasIds = Boolean(urlResumeId && urlJdId);

    return (
        <div className="space-y-10 pb-16 relative">
            {!hasIds && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 w-full animate-in fade-in duration-500">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500/20 to-pink-500/0 rounded-[2rem] blur-xl opacity-50 transition duration-500"></div>
                        <Card className="relative h-full bg-white/80 backdrop-blur-xl border-slate-200/50 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-b from-slate-50/80 to-transparent border-b border-slate-100/50 pb-5 pt-6 px-6">
                                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                                    <div className="p-2 bg-purple-100/80 rounded-xl text-purple-600"><FileText className="w-5 h-5" /></div>
                                    Original Resume
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Textarea 
                                    placeholder="Paste your original resume..."
                                    className="min-h-[220px] resize-y font-mono text-[13px] leading-relaxed bg-slate-50/50 border-slate-200/60 rounded-2xl p-4 focus-visible:ring-2 focus-visible:ring-purple-500/50 transition-all shadow-inner"
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
                                    placeholder="Paste the target job description..."
                                    className="min-h-[220px] resize-y font-mono text-[13px] leading-relaxed bg-slate-50/50 border-slate-200/60 rounded-2xl p-4 focus-visible:ring-2 focus-visible:ring-emerald-500/50 transition-all shadow-inner"
                                    value={jdText}
                                    onChange={(e) => setJdText(e.target.value)}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            <div className="flex justify-center pt-2 relative z-20">
                <Button 
                    size="lg" 
                    onClick={() => handleGenerate()} 
                    disabled={isGenerating}
                    className="relative bg-slate-900 hover:bg-slate-800 text-white min-w-[280px] h-16 text-xl font-bold rounded-full shadow-2xl disabled:opacity-75"
                >
                    {isGenerating ? (
                        <><Loader2 className="w-6 h-6 mr-3 animate-spin text-purple-400" /> Generating Portfolio...</>
                    ) : (
                        <><Sparkles className="w-6 h-6 mr-3 text-purple-400" /> Generate JD-Specific Portfolio</>
                    )}
                </Button>
            </div>

            {portfolioData && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 mt-10">
                    <Card className="border-purple-100 shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl border border-slate-200">
                        <div className="flex px-6 py-4 justify-between items-center border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-2 font-bold text-slate-800">
                                <LayoutTemplate className="w-5 h-5 text-purple-600" />
                                Tailored Portfolio
                            </div>
                            <Button size="sm" variant="outline" className="bg-white shadow-sm hover:text-purple-600 rounded-xl" onClick={handleCopy}>
                                {hasCopied ? <><Check className="w-4 h-4 mr-2 text-emerald-600" /> Copied</> : <><Copy className="w-4 h-4 mr-2" /> Copy Text</>}
                            </Button>
                        </div>
                        <div className="p-8 md:p-12 space-y-12">
                            {/* Header Section */}
                            <header className="border-b border-slate-200 pb-10">
                                <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-3xl">
                                    {portfolioData.about}
                                </p>
                            </header>

                            {/* Experience Summary */}
                            <section>
                                <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Experience Summary</h3>
                                    <p className="text-slate-800 leading-relaxed font-medium">
                                        {portfolioData.experience_summary}
                                    </p>
                                </div>
                            </section>

                            {/* Technical Skills */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    Technical Expertise
                                    <span className="h-px flex-1 bg-slate-200 ml-4" />
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {portfolioData.skills?.map((skill: string, idx: number) => (
                                        <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium"
                                        >
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </section>

                            {/* Projects Section */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                                    Highlighted Projects
                                    <span className="h-px flex-1 bg-slate-200 ml-4" />
                                </h2>

                                <div className="space-y-10">
                                    {portfolioData.projects?.map((project: any, idx: number) => (
                                        <div key={idx} className="group">
                                            <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-3 gap-2">
                                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                                                    {project.title}
                                                </h3>
                                            </div>
                                            <p className="text-slate-600 leading-relaxed mb-4">
                                                {project.description}
                                            </p>
                                            {project.impact && (
                                                <div className="mt-3 p-4 bg-purple-50/50 rounded-lg border border-purple-100">
                                                    <strong className="text-purple-700 text-sm font-semibold uppercase tracking-wide block mb-1">Impact</strong>
                                                    <p className="text-slate-700 italic text-sm">{project.impact}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
