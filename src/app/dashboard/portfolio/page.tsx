import { LayoutTemplate } from "lucide-react";
import { PortfolioStatelessView } from "@/components/resume/PortfolioStatelessView";

export default function PortfolioPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="mb-10 relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10" />
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600">
                        <LayoutTemplate className="w-8 h-8" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                        JD-Specific Portfolio
                    </span>
                </h1>
                <p className="text-slate-500 max-w-2xl text-lg leading-relaxed font-medium">
                    Generate a tailored, structured web portfolio that highlights the exact skills, experiences, and project metrics needed to stand out for your targeted role.
                </p>
            </div>

            <PortfolioStatelessView />
        </div>
    );
}
