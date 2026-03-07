"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { LogOut, Settings, User as UserIcon, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function UserNav({ user }: { user: User }) {
    const router = useRouter();
    const supabase = createClient();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsOpen(false);
        router.refresh();
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNavigate = (path: string) => {
        setIsOpen(false);
        router.push(path);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
                className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all focus:outline-none"
            >
                <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} alt={user.email ?? ""} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-slate-800">Account</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                            {user.email}
                        </p>
                    </div>
                    <div className="py-1">
                        <button onClick={() => handleNavigate('/dashboard')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center">
                            <UserIcon className="mr-3 h-4 w-4 text-slate-400" />
                            <span>Dashboard Profile</span>
                        </button>
                        <button onClick={() => handleNavigate('/pricing')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center">
                            <CreditCard className="mr-3 h-4 w-4 text-slate-400" />
                            <span>Billing & Plans</span>
                        </button>
                        <button onClick={() => handleNavigate('/dashboard/settings')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center">
                            <Settings className="mr-3 h-4 w-4 text-slate-400" />
                            <span>Account Settings</span>
                        </button>
                    </div>
                    <div className="py-1 border-t">
                        <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center">
                            <LogOut className="mr-3 h-4 w-4" />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
