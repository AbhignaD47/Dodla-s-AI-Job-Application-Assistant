"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SettingsForm() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.push("/login");
            toast.success("Successfully logged out");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to log out");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="flex flex-col items-start gap-4">
            <h3 className="text-lg font-semibold text-slate-800">Danger Zone</h3>
            <p className="text-sm text-slate-500 mb-2">
                This action will securely log you out of your account on this device.
            </p>
            <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-400"
            >
                {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                )}
                Sign Out
            </Button>
        </div>
    );
}
