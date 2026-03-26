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
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();


        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Read the file buffer
        const arrayBuffer = await file.arrayBuffer();

        let textContent = "";

        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
            // Parse PDF using pdf2json
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const PDFParser = require("pdf2json");
            textContent = await new Promise<string>((resolve, reject) => {
                const pdfParser = new PDFParser(null, 1);
                pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
                pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
                pdfParser.parseBuffer(Buffer.from(arrayBuffer));
            });
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) {
            // Parse DOCX using mammoth
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const mammoth = require("mammoth");
            const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
            textContent = result.value;
        } else {
            return NextResponse.json({ error: "Unsupported file format. Please upload PDF or DOCX." }, { status: 400 });
        }

        if (!textContent || textContent.trim().length === 0) {
            return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 400 });
        }

        // Use OpenAI to extract skills, keywords, and experience
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
        });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost efficient but smart
            messages: [
                {
                    role: "system",
                    content: "You are an expert ATS (Applicant Tracking System). Extract the candidate's skills, technologies, key experience metrics, and keywords from the text. Respond ONLY with a valid JSON object matching this schema: { \"skills\": string[], \"technologies\": string[], \"experience_years\": number, \"keywords\": string[] }.",
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
            const fileName = `${(user?.id || "demo-user-id")}/${Date.now()}_${file.name}`;
            const { data, error } = await supabase.storage
                .from("resumes")
                .upload(fileName, arrayBuffer, {
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

        if (!user) {
            // Stateless open mode: Return the parsed content directly without hitting the DB to avoid Foreign Key violations.
            return NextResponse.json({ 
                success: true, 
                resume: { parsed_content: textContent, skills: extraction } 
            }, { status: 200, headers: corsHeaders });
        }

        // Store in database for authenticated users
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
            return NextResponse.json({ error: "Failed to save resume securely" }, { status: 500, headers: corsHeaders });
        }

        return NextResponse.json({ success: true, resume: resumeRecord }, { status: 200, headers: corsHeaders });
    } catch (error: any) {
        console.error("Resume parse error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500, headers: corsHeaders });
    }
}
