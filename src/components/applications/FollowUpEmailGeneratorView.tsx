"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Copy, Send } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface FollowUpEmailGeneratorViewProps {
    jobId: string;
}

export function FollowUpEmailGeneratorView({ jobId }: FollowUpEmailGeneratorViewProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [context, setContext] = useState("");
    const [generatedEmail, setGeneratedEmail] = useState("");

    const handleGenerate = async () => {
        if (!context.trim()) {
            toast.error("Please provide context for the follow-up.");
            return;
        }

        try {
            setIsGenerating(true);
            const response = await fetch("/api/generate/follow-up", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ job_id: jobId, lastInteraction: context }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate email");
            }

            setGeneratedEmail(data.email);
            toast.success("Draft created!");
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!generatedEmail) return;
        navigator.clipboard.writeText(generatedEmail);
        toast.success("Copied to clipboard!");
    };

    const handleMailTo = () => {
        if (!generatedEmail) return;
        // Parse Subject if it exists
        const lines = generatedEmail.split('\n');
        let subject = "Follow Up";
        let body = generatedEmail;

        if (lines[0].toLowerCase().startsWith("subject:")) {
            subject = lines[0].replace(/subject:/i, "").trim();
            body = lines.slice(1).join("\n").trim();
        }
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 border-t border-slate-100 rounded-b-xl">
            <div className="p-4 border-b border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">What is the context of this follow-up?</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="e.g. Completed final interview on Tuesday, Checking application status..."
                        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <Button onClick={handleGenerate} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap">
                        {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                        Generate
                    </Button>
                </div>
            </div>

            {generatedEmail ? (
                <div className="flex flex-col flex-1">
                    <div className="p-4 flex-1">
                        <Textarea
                            value={generatedEmail}
                            onChange={(e) => setGeneratedEmail(e.target.value)}
                            className="min-h-[250px] w-full p-4 text-sm leading-relaxed text-slate-700 bg-white border-slate-200 shadow-inner focus-visible:ring-indigo-500 rounded-xl resize-y"
                        />
                    </div>
                    <div className="bg-white border-t border-slate-200 p-4 rounded-b-xl flex justify-end gap-3">
                        <Button variant="outline" onClick={handleCopy}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                        </Button>
                        <Button onClick={handleMailTo} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Send className="w-4 h-4 mr-2" />
                            Open in Email Client
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="p-8 text-center text-slate-400 min-h-[200px] flex flex-col items-center justify-center">
                    <Mail className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-sm">Provide context above to generate a perfectly tailored follow-up email.</p>
                </div>
            )}
        </div>
    );
}
