"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ResumeUpload() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        if (file.type !== "application/pdf") {
            toast.error("Please upload a valid PDF file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB.");
            return;
        }
        setFile(file);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/resume/parse", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                let errorMessage = `Server Error: ${res.status} ${res.statusText}`;
                try {
                    const text = await res.text();
                    try {
                        const errorData = JSON.parse(text);
                        if (errorData.error) errorMessage = errorData.error;
                    } catch (e) {
                        // Truncate HTML error pages so they fit in the toast
                        errorMessage = text.substring(0, 150) + (text.length > 150 ? "..." : "");
                    }
                } catch (e) {
                    console.error("Failed to read error response", e);
                }
                throw new Error(errorMessage);
            }

            toast.success("Resume uploaded and parsed successfully!");
            router.refresh();
        } catch (error: any) {
            console.error("Upload error details:", error);
            toast.error(error.message || JSON.stringify(error) || "An error occurred during upload.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className="border-dashed border-2 bg-slate-50/50">
            <CardHeader className="text-center pb-2">
                <CardTitle>Upload Your Resume</CardTitle>
                <CardDescription>We support PDF formats up to 5MB.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
                {!file ? (
                    <div
                        className={`w-full max-w-md p-10 flex flex-col items-center justify-center rounded-xl transition-all ${isDragging ? "bg-primary/5 border-primary scale-105" : "bg-white border-2 border-slate-200 border-dashed hover:border-primary/50"
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-medium mb-1">Drag and drop your file here, or</p>
                        <label className="text-sm text-primary font-semibold hover:underline cursor-pointer">
                            browse files
                            <input type="file" className="hidden" accept=".pdf" onChange={handleFileInput} />
                        </label>
                    </div>
                ) : (
                    <div className="w-full max-w-md p-6 bg-white border rounded-xl shadow-sm flex flex-col items-center space-y-6">
                        <div className="flex items-center space-x-4 w-full p-4 bg-slate-50 rounded-lg border">
                            <div className="bg-blue-100 p-3 rounded-md text-blue-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setFile(null)} disabled={isUploading} className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">
                                Remove
                            </Button>
                        </div>

                        <Button className="w-full" size="lg" onClick={handleUpload} disabled={isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Parsing with AI...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                    Confirm Upload
                                </>
                            )}
                        </Button>
                        {isUploading && (
                            <p className="text-xs text-muted-foreground text-center">
                                Our AI is reading your resume and extracting key skills... This might take 5-10 seconds.
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
