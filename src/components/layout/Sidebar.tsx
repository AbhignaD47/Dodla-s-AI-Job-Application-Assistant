"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Trello, Settings, Target, Globe, Download, FileSignature, KanbanSquare, Mail } from "lucide-react";

const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Resume", href: "/dashboard/resume", icon: FileText },
    { name: "Kanban Board", href: "/dashboard/applications", icon: Trello },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const featureItems = [
    { name: "AI Job Scoring", href: "/dashboard/score", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Resume Optimizer per JD", href: "/dashboard/resume-optimizer", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "JD-Specific Portfolio", href: "/dashboard/portfolio", icon: Globe, color: "text-purple-500", bg: "bg-purple-500/10" },
    { name: "Portfolio PDF Export", href: "/dashboard/portfolio", icon: Download, color: "text-slate-500", bg: "bg-slate-500/10" },
    { name: "Cover Letter Generator", href: "/dashboard/cover-letter", icon: FileSignature, color: "text-pink-500", bg: "bg-pink-500/10" },
    { name: "Kanban Planner", href: "/dashboard/applications", icon: KanbanSquare, color: "text-orange-500", bg: "bg-orange-500/10" },
    { name: "Follow-Up Emails", href: "/dashboard", icon: Mail, color: "text-amber-500", bg: "bg-amber-500/10" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-slate-200/50 bg-white/50 backdrop-blur-md h-[calc(100vh-4rem)] sticky top-16 p-4">
            <nav className="flex flex-col gap-2 flex-1 mt-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                        <Link key={item.name} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-slate-600 hover:text-primary hover:bg-slate-100"
                                )}
                            >
                                <item.icon
                                    size={18}
                                    className={cn("transition-colors", isActive ? "text-primary" : "text-slate-400 group-hover:text-primary")}
                                />
                                {item.name}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="flex flex-col gap-1 mt-6 mb-4 px-2">
                <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest px-2">Core AI Capabilities</p>
                {featureItems.map((item) => (
                    <Link key={item.name} href={item.href}>
                        <div
                            className={cn(
                                "flex items-center gap-3 px-2 py-2 rounded-md text-xs font-semibold transition-all group hover:bg-slate-100",
                            )}
                        >
                            <div className={cn("p-1.5 rounded-md", item.bg, item.color)}>
                                <item.icon size={13} strokeWidth={2.5} />
                            </div>
                            <span className="text-slate-600 group-hover:text-slate-900 leading-tight">
                                {item.name}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-auto p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Credits</p>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500">Unlimited</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary via-pink-500 to-orange-500 h-1.5 rounded-full" style={{ width: "100%" }}></div>
                </div>
            </div>
        </aside>
    );
}
