"use client";

import { useState } from "react";
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
        <div className="space-y-8 pb-12">
            {/* Input Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Resume Input Area */}
                <Card className="border-slate-200 shadow-sm border-t-4 border-t-indigo-500">
                    <CardHeader className="bg-slate-50/50 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-slate-800">
                                    <FileText className="w-5 h-5 text-indigo-500" />
                                    Candidate Resume
                                </CardTitle>
                                <CardDescription className="mt-1">
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
                                <label htmlFor="resume-upload">
                                    <Button variant="outline" size="sm" className="cursor-pointer bg-white" disabled={isUploading}>
                                        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                        Upload File
                                    </Button>
                                </label>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <Textarea 
                            placeholder="Paste your plain text resume here, or upload a file above..."
                            className="min-h-[250px] resize-y font-mono text-xs focus-visible:ring-indigo-500"
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                        />
                    </CardContent>
                </Card>

                {/* JD Input Area */}
                <Card className="border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
                    <CardHeader className="bg-slate-50/50 pb-4">
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            <Target className="w-5 h-5 text-emerald-500" />
                            Target Job Description
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Paste the complete job description text to compare against.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        <Textarea 
                            placeholder="Paste the job description here..."
                            className="min-h-[250px] resize-y font-mono text-xs focus-visible:ring-emerald-500"
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                        />
                    </CardContent>
                </Card>

            </div>

            <div className="flex justify-center">
                <Button 
                    size="lg" 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || !resumeText || !jdText}
                    className="bg-brand hover:bg-brand/90 text-white min-w-[200px] shadow-lg hover:shadow-xl transition-all h-14 text-lg rounded-full"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                            Analyzing Explicit Rules...
                        </>
                    ) : (
                        <>
                            <BarChart3 className="w-6 h-6 mr-3" />
                            Run Deep ATS Analysis
                        </>
                    )}
                </Button>
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

                </div>
            )}
        </div>
    );
}
