import { CoverLetterStatelessView } from "@/components/resume/CoverLetterStatelessView";

export default function CoverLetterPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Cover Letter Generator</h1>
                <p className="text-slate-500">Generate a personalized, ATS-friendly cover letter.</p>
            </div>
            <CoverLetterStatelessView />
        </div>
    );
}
