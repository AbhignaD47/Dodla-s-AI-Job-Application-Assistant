import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        // Polyfill DOMMatrix for pdf-parse in Next.js 14 serverless Node.js
        if (typeof (global as any).DOMMatrix === "undefined") {
            (global as any).DOMMatrix = class DOMMatrix {
                constructor() { return [1, 0, 0, 1, 0, 0]; }
            };
        }

        // Defer instantiation to catch Vercel Edge Node.js binary incompatibility crashes
        const pdfParse = require("pdf-parse");
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Read the file buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Parse PDF
        const parsedData = await pdfParse(buffer);
        const textContent = parsedData.text;

        if (!textContent || textContent.trim().length === 0) {
            return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 400 });
        }

        // Use OpenAI to extract skills, keywords, and experience
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost efficient but smart
            messages: [
                {
                    role: "system",
                    content: "You are an expert ATS (Applicant Tracking System). Extract the candidate's skills, key experience metrics, and keywords from the text. Respond ONLY with a valid JSON object matching this schema: { \"skills\": string[], \"experience_years\": number, \"keywords\": string[] }.",
                },
                {
                    role: "user",
                    content: textContent.substring(0, 10000), // Avoid exceeding limits
                },
            ],
            response_format: { type: "json_object" },
        });

        const extraction = JSON.parse(completion.choices[0].message.content || "{}");

        // Optional: Upload the file to Supabase storage 'resumes' bucket
        let fileUrl = null;
        try {
            const fileName = `${user.id}/${Date.now()}_${file.name}`;
            const { data, error } = await supabase.storage
                .from("resumes")
                .upload(fileName, buffer, {
                    contentType: file.type,
                    upsert: true,
                });

            if (!error && data) {
                const { data: publicUrlData } = supabase.storage.from("resumes").getPublicUrl(fileName);
                fileUrl = publicUrlData.publicUrl;
            }
        } catch (storageError) {
            console.error("Storage error:", storageError);
            // Proceed even if storage fails, we still have the parsed text
        }

        // Store in database
        const { data: resumeRecord, error: dbError } = await supabase
            .from("resumes")
            .insert({
                user_id: user.id,
                file_url: fileUrl,
                parsed_content: textContent,
                skills: extraction,
            })
            .select()
            .single();

        if (dbError) {
            return NextResponse.json({ error: "Failed to save resume" }, { status: 500, headers: corsHeaders });
        }

        return NextResponse.json({ success: true, resume: resumeRecord }, { status: 200, headers: corsHeaders });
    } catch (error: any) {
        console.error("Resume parse error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500, headers: corsHeaders });
    }
}
