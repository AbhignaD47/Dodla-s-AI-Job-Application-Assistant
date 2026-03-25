import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { targetUrl, job_id } = body;

        if (!targetUrl || !job_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Configure chromium based on environment
        // Locally, it might need local executablePath, but on Vercel, @sparticuz handles it.
        const isLocal = process.env.NODE_ENV === "development";
        
        const executablePath = isLocal 
            ? process.env.LOCAL_CHROMIUM_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" // Common mac path
            : await chromium.executablePath();

        const browser = await puppeteer.launch({
            args: isLocal ? puppeteer.defaultArgs() : (chromium.args as string[]),
            defaultViewport: chromium.defaultViewport as any,
            executablePath,
            headless: chromium.headless as any,
        });

        const page = await browser.newPage();
        
        // Wait until network is idle to grab the fully rendered portfolio
        await page.goto(targetUrl, { waitUntil: "networkidle0" });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" }
        });

        await browser.close();

        // Save PDF to Supabase Storage (acting as S3)
        const fileName = `\${user.id}/\${job_id}_\${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
            .from("resumes") // Reuse 'resumes' bucket if 'portfolios' is not explicitly guaranteed
            .upload(fileName, pdfBuffer, {
                contentType: "application/pdf",
                upsert: true
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
            .from("resumes")
            .getPublicUrl(fileName);

        const pdfUrl = publicUrlData.publicUrl;

        return NextResponse.json({ success: true, pdfUrl });

    } catch (error: any) {
        console.error("PDF generation error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate PDF" }, { status: 500 });
    }
}
