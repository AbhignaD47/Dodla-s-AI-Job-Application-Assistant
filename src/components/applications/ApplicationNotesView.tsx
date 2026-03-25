"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, StickyNote, Check } from "lucide-react";
import { toast } from "sonner";

interface ApplicationNotesViewProps {
    jobId: string;
    initialNotes?: string | null;
}

export function ApplicationNotesView({ jobId, initialNotes }: ApplicationNotesViewProps) {
    const [notes, setNotes] = useState(initialNotes || "");
    const [isSaving, setIsSaving] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const response = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "update_notes", job_id: jobId, notes }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to save notes");
            }

            setHasSaved(true);
            toast.success("Notes saved!");
            setTimeout(() => setHasSaved(false), 2000);
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 border-t border-slate-100 rounded-b-xl p-4">
            <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down interview questions, salary expectations, recruiter emails, etc."
                className="min-h-[150px] w-full p-4 mb-4 text-sm leading-relaxed text-slate-700 bg-white border-slate-200 shadow-inner focus-visible:ring-emerald-500 rounded-xl resize-y"
            />
            <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 flex items-center">
                    <StickyNote className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    Automatically saved on changes
                </span>
                <Button 
                    size="sm" 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    {isSaving ? (
                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (hasSaved ? (
                         <Check className="w-4 h-4 mr-2" />
                    ) : null)}
                    {isSaving ? "Saving..." : (hasSaved ? "Saved" : "Save Notes")}
                </Button>
            </div>
        </div>
    );
}
