import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { UserNav } from "./UserNav";
import { Briefcase } from "lucide-react";

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
                            Dodla's AI
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                        <Link href="/jobs" className="hover:text-primary transition-colors">Find Jobs</Link>
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
