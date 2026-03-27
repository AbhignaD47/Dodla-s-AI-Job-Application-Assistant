import { Sparkles } from "lucide-react";
import { ResumeOptimizerStatelessView } from "@/components/resume/ResumeOptimizerStatelessView";

export default function ResumeOptimizerPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="mb-10 relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -z-10" />
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                        Resume Optimizer per JD
                    </span>
                </h1>
                <p className="text-slate-500 max-w-2xl text-lg leading-relaxed font-medium">
                    Strictly rewrite your resume bullet points to naturally integrate job description keywords and maximize your ATS alignment without fabricating experience.
                </p>
            </div>

            <ResumeOptimizerStatelessView />
        </div>
    );
}
