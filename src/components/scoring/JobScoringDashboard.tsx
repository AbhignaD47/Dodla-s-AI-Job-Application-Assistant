"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, Upload, FileText, Loader2, CheckCircle2, XCircle, ChevronRight, AlertCircle, BarChart3, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ScoreResult {
    score: number;
    matched_skills: string[];
    missing_skills: string[];
    keyword_match_percentage: number;
    improvements: string[];
}

export function JobScoringDashboard({ initialResumeText }: { initialResumeText?: string | null }) {
    const [resumeText, setResumeText] = useState(initialResumeText || "");
    const [jdText, setJdText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<ScoreResult | null>(null);

    // Context Synchronizer: Interlink Features
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedResume = sessionStorage.getItem("dodla_resume");
            const savedJd = sessionStorage.getItem("dodla_jd");
            if (savedResume && !initialResumeText) setResumeText(savedResume);
            if (savedJd) setJdText(savedJd);
        }
    }, [initialResumeText]);

    useEffect(() => {
        if (resumeText) sessionStorage.setItem("dodla_resume", resumeText);
        if (jdText) sessionStorage.setItem("dodla_jd", jdText);
    }, [resumeText, jdText]);


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File is too large. Max size is 5MB.");
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            // We leverage the existing parse endpoint which handles PDF/DOCX to text natively
            const res = await fetch("/api/resume/parse", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to parse file");

            setResumeText(data.resume.parsed_content);
            toast.success("Resume parsed successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to upload and parse resume.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAnalyze = async () => {
        if (resumeText.length < 100) {
            toast.error("Resume text is too brief to score properly.");
            return;
        }
        if (jdText.length < 100) {
            toast.error("Job description text is too brief.");
            return;
        }

        try {
            setIsAnalyzing(true);
            const res = await fetch("/api/score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resume_text: resumeText, jd_text: jdText }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to score job.");

            setResult(data as ScoreResult);
            toast.success("Analysis complete!");
        } catch (error: any) {
            toast.error(error.message || "Something went wrong during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-10 pb-16 relative">
            {/* Input Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                
                {/* Resume Input Area */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/0 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-500"></div>
                    <Card className="relative h-full bg-white/80 backdrop-blur-xl border-slate-200/50 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-b from-slate-50/80 to-transparent border-b border-slate-100/50 pb-5 pt-6 px-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                                        <div className="p-2 bg-indigo-100/80 rounded-xl text-indigo-600">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        Candidate Resume
                                    </CardTitle>
                                    <CardDescription className="mt-2 text-sm font-medium text-slate-500">
                                        Upload a new PDF/DOCX or ensure current text is accurate.
                                    </CardDescription>
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        id="resume-upload"
                                        className="hidden"
                                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={handleFileUpload}
                                    />
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="cursor-pointer bg-white rounded-full px-4 shadow-sm border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-colors" 
                                        disabled={isUploading}
                                        onClick={() => document.getElementById("resume-upload")?.click()}
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                        Upload File
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Textarea 
                                placeholder="Paste your plain text resume here, or upload a file above..."
                                className="min-h-[280px] resize-y font-mono text-[13px] leading-relaxed bg-slate-50/50 border-slate-200/60 rounded-2xl p-4 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 transition-all shadow-inner"
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* JD Input Area */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-bl from-emerald-500/20 to-teal-500/0 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-500"></div>
                    <Card className="relative h-full bg-white/80 backdrop-blur-xl border-slate-200/50 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-b from-slate-50/80 to-transparent border-b border-slate-100/50 pb-5 pt-6 px-6">
                            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                                <div className="p-2 bg-emerald-100/80 rounded-xl text-emerald-600">
                                    <Target className="w-5 h-5" />
                                </div>
                                Target Job Description
                            </CardTitle>
                            <CardDescription className="mt-2 text-sm font-medium text-slate-500">
                                Paste the complete job description text to compare against.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Textarea 
                                placeholder="Paste the job description here..."
                                className="min-h-[280px] resize-y font-mono text-[13px] leading-relaxed bg-slate-50/50 border-slate-200/60 rounded-2xl p-4 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all shadow-inner"
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                            />
                        </CardContent>
                    </Card>
                </div>

            </div>

            <div className="flex justify-center pt-4 relative z-20">
                <div className="relative group inline-block">
                    <div className="absolute -inset-1 pointer-events-none bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500 group-hover:duration-200" />
                    <Button 
                        size="lg" 
                        onClick={handleAnalyze} 
                        disabled={isAnalyzing}
                        className="relative bg-slate-900 hover:bg-slate-800 text-white min-w-[280px] h-16 text-xl font-bold rounded-full border border-white/10 transition-transform active:scale-95 flex items-center shadow-2xl disabled:opacity-75 disabled:cursor-wait"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-6 h-6 mr-3 animate-spin text-pink-400" />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Analyzing Explicit Rules...</span>
                            </>
                        ) : (
                            <>
                                <BarChart3 className="w-6 h-6 mr-3 text-indigo-400" />
                                Run Deep ATS Analysis
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Output Dashboard */}
            {result && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    {/* Score Overview */}
                    <Card className="md:col-span-1 border-slate-200 shadow-md flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-slate-50">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">ATS Match Score</h3>
                        
                        <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                            {/* Circular Math Indicator */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-slate-200"
                                    strokeWidth="3"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className={`${result.score >= 75 ? 'text-emerald-500' : result.score >= 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                    strokeDasharray={`${result.score}, 100`}
                                    strokeWidth="3"
                                    strokeDashoffset="0"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-slate-800">{result.score}</span>
                                <span className="text-xs font-semibold text-slate-400 mt-1">/ 100</span>
                            </div>
                        </div>

                        <div className="w-full mt-6">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-semibold text-slate-600">Keyword Coverage</span>
                                <span className="text-sm font-bold text-slate-800">{result.keyword_match_percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                    className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" 
                                    style={{ width: `${result.keyword_match_percentage}%` }} 
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Skills Breakdown */}
                    <Card className="md:col-span-2 border-slate-200 shadow-md">
                        <CardHeader className="bg-white border-b border-slate-100 pb-4">
                            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-brand" />
                                Skill Gap Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                                    Matched Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.matched_skills.length > 0 ? (
                                        result.matched_skills.map((skill, idx) => (
                                            <Badge key={idx} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1">
                                                {skill}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-slate-400 italic">No exact skill matches found.</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                                    <XCircle className="w-4 h-4 mr-2 text-red-500" />
                                    Missing Required & Secondary Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.missing_skills.length > 0 ? (
                                        result.missing_skills.map((skill, idx) => (
                                            <Badge key={idx} variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1">
                                                {skill}
                                            </Badge>
                                        ))
                                    ) : (
                                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                                            Excellent! No major skills missing.
                                        </Badge>
                                    )}
                                </div>
                                {result.missing_skills.length > 0 && (
                                    <p className="text-xs text-red-500 mt-2 flex items-center">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Adding these to your resume directly influences your ATS score.
                                    </p>
                                )}
                            </div>

                        </CardContent>
                    </Card>

                    {/* Actionable Improvements */}
                    <Card className="md:col-span-3 border-indigo-100 shadow-md">
                        <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pb-4">
                            <CardTitle className="text-xl text-indigo-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                Actionable Improvements
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <ul className="space-y-4">
                                {result.improvements.map((improvement, idx) => (
                                    <li key={idx} className="flex gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                {idx + 1}
                                            </div>
                                        </div>
                                        <p className="text-slate-700 text-sm leading-relaxed">
                                            {improvement}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Next Steps: Interlinked Feature Pipeline */}
                    <div className="md:col-span-3 mt-4">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            Pipeline Next Steps
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/dashboard/resume-optimizer">
                                <Button className="w-full h-16 bg-blue-50/50 hover:bg-blue-50 text-blue-700 border border-blue-200 shadow-sm transition-all hover:shadow-md flex justify-between items-center px-6 rounded-2xl group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><FileText size={18} /></div>
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="font-bold text-base leading-none">Auto-Optimize Resume</span>
                                            <span className="text-[11px] font-medium text-blue-400 leading-none">Use ATS context to strictly rewrite bullets</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>

                            <Link href="/dashboard/cover-letter">
                                <Button className="w-full h-16 bg-pink-50/50 hover:bg-pink-50 text-pink-700 border border-pink-200 shadow-sm transition-all hover:shadow-md flex justify-between items-center px-6 rounded-2xl group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-pink-100 rounded-lg text-pink-600"><FileText size={18} /></div>
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="font-bold text-base leading-none">Write Cover Letter</span>
                                            <span className="text-[11px] font-medium text-pink-400 leading-none">Generate a JD-specific introduction</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
