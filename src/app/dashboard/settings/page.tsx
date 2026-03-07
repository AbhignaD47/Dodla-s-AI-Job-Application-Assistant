import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, CreditCard, LogOut, Mail, Clock } from "lucide-react";
import Link from "next/link";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    return (
        <div className="flex flex-col gap-6 max-w-4xl">
            <div className="flex flex-col gap-2 mb-4">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences, billing, and AI credits.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200/60">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Account Profile
                        </CardTitle>
                        <CardDescription>Your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center p-3 bg-slate-50 border rounded-lg">
                            <Mail className="h-4 w-4 text-slate-500 mr-3" />
                            <div className="flex-1">
                                <p className="text-xs font-medium text-slate-500">Email Address</p>
                                <p className="text-sm font-semibold">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center p-3 bg-slate-50 border rounded-lg">
                            <Clock className="h-4 w-4 text-slate-500 mr-3" />
                            <div className="flex-1">
                                <p className="text-xs font-medium text-slate-500">Member Since</p>
                                <p className="text-sm font-semibold">
                                    {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200/60">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Billing & Credits
                        </CardTitle>
                        <CardDescription>Manage your subscription</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-slate-600 mb-1">Current Plan</p>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold capitalize">{subscription?.plan_type || "Free"}</h3>
                                    {subscription && (
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Active</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-600 mb-1">AI Credits</p>
                                <p className="text-xl font-bold text-primary">{profile?.credits?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                        <Link href="/pricing" className="block w-full">
                            <Button className="w-full" variant="outline">
                                Upgrade Plan
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200/50">
                <SettingsForm />
            </div>
        </div>
    );
}
