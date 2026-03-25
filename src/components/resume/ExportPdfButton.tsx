"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportPdfButtonProps {
    jobId: string;
}

export function ExportPdfButton({ jobId }: ExportPdfButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const targetUrl = window.location.href; // The current page URL

            const response = await fetch("/api/export/pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUrl, job_id: jobId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate PDF");
            }

            toast.success("PDF generated and stored successfully!");
            
            // Open the generated PDF in a new tab
            if (data.pdfUrl) {
                window.open(data.pdfUrl, "_blank");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            className="bg-slate-900 text-white hover:bg-slate-800"
            onClick={handleExport}
            disabled={isExporting}
        >
            {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
                <Printer className="w-4 h-4 mr-2" />
            )}
            {isExporting ? "Generating..." : "Export PDF (S3)"}
        </Button>
    );
}
