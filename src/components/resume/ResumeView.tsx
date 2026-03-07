"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Calendar, Star, CheckCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface ResumeViewProps {
    resume: {
        id: string;
        file_url: string | null;
        skills: {
            skills: string[];
            experience_years: number;
            keywords: string[];
        } | null;
        created_at: string;
    }
}

export function ResumeView({ resume }: ResumeViewProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const skillsList = resume.skills?.skills || [];
    const keywordsList = resume.skills?.keywords || [];
    const experienceYears = resume.skills?.experience_years || 0;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from("resumes")
                .delete()
                .eq("id", resume.id);

            if (error) throw error;

            toast.success("Resume deleted successfully");
            router.refresh();
        } catch (error: any) {
            toast.error("Failed to delete resume");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card className="border-brand/20 shadow-md">
            <CardHeader className="bg-slate-50 border-b pb-6 rounded-t-xl">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-4 rounded-xl text-primary">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl pt-1 flex items-center gap-2">
                                Active Resume
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 ml-2">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Parsed
                                </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Uploaded on {new Date(resume.created_at).toLocaleDateString()}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {resume.file_url && (
                            <Link href={resume.file_url} target="_blank" prefetch={false}>
                                <Button variant="outline" size="sm" className="hidden sm:flex">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View PDF
                                </Button>
                            </Link>
                        )}
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-400"
                        >
                            <Trash2 className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Experience Summary */}
                    <div className="col-span-1 border rounded-xl p-5 bg-slate-50/50">
                        <div className="flex items-center text-slate-700 font-semibold mb-4">
                            <Calendar className="w-5 h-5 mr-2 text-primary" />
                            AI Extracted Profile
                        </div>
                        <div className="text-4xl font-extrabold text-slate-900 mb-2">
                            {experienceYears}+
                            <span className="text-lg font-medium text-slate-500 ml-2">Years</span>
                        </div>
                        <p className="text-sm text-slate-500">
                            Estimated relevant professional experience based on parsing.
                        </p>
                    </div>

                    {/* Extracted Skills */}
                    <div className="col-span-2">
                        <div className="flex items-center text-slate-700 font-semibold mb-4">
                            <Star className="w-5 h-5 mr-2 text-primary" />
                            Core Skills Identified
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skillsList.length > 0 ? (
                                skillsList.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="px-3 py-1 text-sm bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100">
                                        {skill}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-muted-foreground italic text-sm">No specific skills could be cleanly extracted.</p>
                            )}
                        </div>

                        <div className="flex items-center text-slate-700 font-semibold mb-3 mt-8">
                            <FileText className="w-4 h-4 mr-2 text-slate-400" />
                            Industry Keywords
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {keywordsList.length > 0 ? (
                                keywordsList.map((keyword, index) => (
                                    <Badge key={index} variant="outline" className="text-xs text-slate-500 font-normal">
                                        {keyword}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-muted-foreground italic text-sm">No extended keywords found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 rounded-b-xl border-t mt-4 py-4 px-6 flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                    Your resume data is securely stored and only used for your job matching.
                </p>
                <Link href="/jobs">
                    <Button size="sm" className="hidden sm:flex">
                        Find Matching Jobs
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
