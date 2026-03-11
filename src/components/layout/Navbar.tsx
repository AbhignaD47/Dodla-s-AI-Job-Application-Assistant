import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { UserNav } from "./UserNav";
import { Briefcase, ChevronDown, Target, FileText, Globe, Download, FileSignature, KanbanSquare, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export async function Navbar() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let isAdmin = false;
    if (user) {
        const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
        isAdmin = data?.is_admin || false;
    }

    return (
        <header className="fixed top-0 w-full z-50 glass border-b border-slate-200/50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-br from-primary to-pink-500 p-2 rounded-xl text-white group-hover:scale-105 transition-transform shadow-sm">
                            <Briefcase size={20} />
                        </div>
                        <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                            Dodla&apos;s AI
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                        <Link href="/jobs" className="hover:text-primary transition-colors">Find Jobs</Link>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors outline-none cursor-pointer">
                                Features <ChevronDown size={14} className="opacity-50" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-64 p-2 shadow-lg rounded-xl border-slate-200">
                                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Core AI Tools</DropdownMenuLabel>
                                <DropdownMenuItem className="cursor-pointer rounded-md p-0">
                                    <Link href="/jobs" className="flex items-center gap-2 w-full px-2 py-1.5">
                                        <div className="bg-emerald-100 p-1.5 rounded-md text-emerald-600"><Target size={14} /></div>
                                        <span>AI Job Scoring</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer rounded-md p-0">
                                    <Link href="/dashboard" className="flex items-center gap-2 w-full px-2 py-1.5">
                                        <div className="bg-blue-100 p-1.5 rounded-md text-blue-600"><FileText size={14} /></div>
                                        <span>Resume Optimizer per JD</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer rounded-md p-0">
                                    <Link href="/dashboard" className="flex items-center gap-2 w-full px-2 py-1.5">
                                        <div className="bg-purple-100 p-1.5 rounded-md text-purple-600"><Globe size={14} /></div>
                                        <span>JD-Specific Portfolio</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer rounded-md p-0">
                                    <Link href="/dashboard" className="flex items-center gap-2 w-full px-2 py-1.5">
                                        <div className="bg-slate-100 p-1.5 rounded-md text-slate-600"><Download size={14} /></div>
                                        <span>Portfolio PDF Export</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer rounded-md p-0">
                                    <Link href="/dashboard" className="flex items-center gap-2 w-full px-2 py-1.5">
                                        <div className="bg-pink-100 p-1.5 rounded-md text-pink-600"><FileSignature size={14} /></div>
                                        <span>Cover Letter Generator</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 border-slate-100" />
                                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Management</DropdownMenuLabel>
                                <DropdownMenuItem className="cursor-pointer rounded-md p-0">
                                    <Link href="/dashboard" className="flex items-center gap-2 w-full px-2 py-1.5">
                                        <div className="bg-orange-100 p-1.5 rounded-md text-orange-600"><KanbanSquare size={14} /></div>
                                        <span>Kanban Application Tracker</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer rounded-md p-0">
                                    <Link href="/dashboard" className="flex items-center gap-2 w-full px-2 py-1.5">
                                        <div className="bg-amber-100 p-1.5 rounded-md text-amber-600"><Mail size={14} /></div>
                                        <span>Follow-Up Email Generator</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            {isAdmin && (
                                <Link href="/admin">
                                    <Button variant="outline" size="sm" className="hidden sm:flex border-primary/20 hover:bg-primary/5">
                                        Admin Dashboard
                                    </Button>
                                </Link>
                            )}
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-slate-100">
                                    Dashboard
                                </Button>
                            </Link>
                            <UserNav user={user} />
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
                                Sign In
                            </Link>
                            <Link href="/signup">
                                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-md hover:shadow-lg transition-all px-6">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
