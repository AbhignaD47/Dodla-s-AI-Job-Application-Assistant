"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Briefcase, Trello, Settings } from "lucide-react";

const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Resume", href: "/dashboard/resume", icon: FileText },
    { name: "Matches", href: "/jobs", icon: Briefcase },
    { name: "Kanban Board", href: "/dashboard/applications", icon: Trello },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
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

            <div className="mt-auto p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Credits</p>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500">1,000</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: "100%" }}></div>
                </div>
            </div>
        </aside>
    );
}
