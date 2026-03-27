"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2, FileSignature, Check, Copy, Target, Download } from "lucide-react";
import { toast } from "sonner";
import { exportToPDF, exportToDOCX } from "@/utils/export";

export function CoverLetterStatelessView() {
    const searchParams = useSearchParams();
    const urlResumeId = searchParams.get("resume_id");
    const urlJdId = searchParams.get("jd_id");

    const [resumeText, setResumeText] = useState("");
    const [jdText, setJdText] = useState("");
    const [generatedContent, setGeneratedContent] = useState<string | null>(null);
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
            let generatedContentRes;

            if (finalResumeId && finalJdId) {
                generatedContentRes = await fetch("/api/generate/cover-letter-stateless", {
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
                    toast.error("Please provide the target job description text.");
                    setIsGenerating(false);
                    return;
                }

                const storeRes = await fetch("/api/resume/store", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ resume_text: resumeText, jd_text: jdText }),
                });
                
                let storeData;
                try { storeData = await storeRes.json(); } catch(e) {}
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let generatePayload: any = { resume_text: resumeText, jd_text: jdText };

                if (storeRes.ok && storeData && storeData.resume_id && storeData.jd_id) {
                    generatePayload = { resume_id: storeData.resume_id, jd_id: storeData.jd_id };
                }

                generatedContentRes = await fetch("/api/generate/cover-letter-stateless", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(generatePayload),
                });
            }

            const data = await generatedContentRes.json();

            if (!generatedContentRes.ok) {
                throw new Error(data.error || "Failed to generate cover letter.");
            }

            setGeneratedContent(data.cover_letter_text);
            if (data.original_resume_text) setResumeText(data.original_resume_text);
            toast.success("Cover letter generated perfectly!");
        } catch (error: any) {
            toast.error(error.message || "Generation failed.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!generatedContent) return;
        navigator.clipboard.writeText(generatedContent);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
        toast.success("Copied to clipboard!");
    };

    const hasIds = Boolean(urlResumeId && urlJdId);

    return (
        <div className="space-y-10 pb-16 relative">
            {!hasIds && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 w-full animate-in fade-in duration-500">
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
            )}

            {(!hasIds || (!generatedContent && isGenerating)) && (
                <div className="flex justify-center pt-2 relative z-20">
                    <div className="relative group inline-block">
                        <div className="absolute -inset-1 pointer-events-none bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500" />
                        <Button 
                            size="lg" 
                            onClick={() => handleGenerate()} 
                            disabled={isGenerating}
                            className="relative bg-slate-900 hover:bg-slate-800 text-white min-w-[280px] h-16 text-xl font-bold rounded-full shadow-2xl disabled:opacity-75 disabled:cursor-wait"
                        >
                            {isGenerating ? (
                                <><Loader2 className="w-6 h-6 mr-3 animate-spin text-pink-400" /> Writing your letter...</>
                            ) : (
                                <><FileSignature className="w-6 h-6 mr-3 text-pink-400" /> Generate Cover Letter</>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {generatedContent && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 mt-10">
                    <Card className="border-slate-200/50 shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 pointer-events-none border-b border-slate-100"></div>
                        
                        <div className="flex border-b border-slate-100/80 bg-white/40 backdrop-blur-sm relative z-10 px-6 pt-4">
                            <button
                                className="px-6 py-4 font-bold text-sm transition-all border-b-2 bg-indigo-50/50 text-indigo-700 border-indigo-500 rounded-t-xl"
                            >
                                Generated Cover Letter
                            </button>
                        </div>
                        <div className="p-8 relative min-h-[400px]">
                            <div className="absolute top-6 right-8 z-10 flex gap-2">
                                <Button size="sm" variant="outline" className="bg-white shadow-sm hover:text-indigo-600 rounded-xl" onClick={handleCopy}>
                                    {hasCopied ? <><Check className="w-4 h-4 mr-2 text-emerald-600" /> Copied</> : <><Copy className="w-4 h-4 mr-2" /> Copy</>}
                                </Button>
                                <Button size="sm" variant="outline" className="bg-white shadow-sm hover:text-rose-600 rounded-xl" onClick={() => exportToPDF(generatedContent || "", "Cover_Letter.pdf")}>
                                    <Download className="w-4 h-4 mr-2" /> PDF
                                </Button>
                                <Button size="sm" variant="outline" className="bg-white shadow-sm hover:text-blue-600 rounded-xl" onClick={() => exportToDOCX(generatedContent || "", "Cover_Letter.docx")}>
                                    <Download className="w-4 h-4 mr-2" /> DOCX
                                </Button>
                            </div>
                            <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-800 pt-10 px-4 max-w-4xl mx-auto">
                                {generatedContent}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
