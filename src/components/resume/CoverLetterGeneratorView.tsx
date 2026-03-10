"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileSignature, Copy, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface CoverLetterGeneratorViewProps {
    jobId: string;
    initialCoverLetter?: string | null;
}

export function CoverLetterGeneratorView({ jobId, initialCoverLetter }: CoverLetterGeneratorViewProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [coverLetter, setCoverLetter] = useState(initialCoverLetter || "");

    const handleGenerate = async () => {
        try {
            setIsGenerating(true);
            const response = await fetch("/api/generate/cover-letter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ job_id: jobId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate cover letter");
            }

            setCoverLetter(data.cover_letter);
            toast.success("Cover letter generated perfectly!");
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!coverLetter) return;
        navigator.clipboard.writeText(coverLetter);
        toast.success("Cover letter copied to clipboard!");
    };

    const handleDownload = () => {
        if (!coverLetter) return;
        const blob = new Blob([coverLetter], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Cover_Letter.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Cover letter downloading...");
    };

    if (coverLetter) {
        return (
            <div className="flex flex-col h-full bg-slate-50 border-t border-slate-100 rounded-b-xl">
                <div className="flex-1 p-6">
                    <Textarea
                        value={coverLetter}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCoverLetter(e.target.value)}
                        className="min-h-[400px] w-full p-6 text-sm md:text-base leading-relaxed text-slate-700 bg-white border-slate-200 shadow-inner focus-visible:ring-indigo-500 rounded-xl resize-y"
                        placeholder="Your cover letter will appear here..."
                    />
                </div>

                {/* Utilities Toolbar */}
                <div className="bg-white border-t border-slate-200 p-4 rounded-b-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Button
                        variant="secondary"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full sm:w-auto text-slate-600 border border-slate-200 hover:bg-slate-100"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Regenerating...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Regenerate
                            </>
                        )}
                    </Button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={handleCopy}
                            className="flex-1 sm:flex-none"
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                        </Button>
                        <Button
                            onClick={handleDownload}
                            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Save .TXT
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Empty Generator State
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-b-xl border-dashed border-2 border-slate-200 m-4 min-h-[400px]">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-indigo-200">
                <FileSignature className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Write Cover Letter</h3>
            <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                Generate a personalized, highly targeted cover letter perfectly matching your experience to this job description.
            </p>
            <Button
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:shadow-lg rounded-full px-8 py-6 h-auto text-base font-medium group"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Writing Letter...
                    </>
                ) : (
                    <>
                        <FileSignature className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        Generate Cover Letter
                    </>
                )}
            </Button>
        </div>
    );
}
