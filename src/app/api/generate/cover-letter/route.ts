import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { job_id } = await req.json();

        if (!job_id) {
            return NextResponse.json({ error: "Job ID required" }, { status: 400 });
        }

        // Fetch the most recent resume
        const { data: resumes } = await supabase
            .from("resumes")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        if (!resumes || resumes.length === 0) {
            return NextResponse.json({ error: "No resume found." }, { status: 400 });
        }
        const resume = resumes[0];

        // Fetch the job
        const { data: job } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", job_id)
            .single();

        if (!job) {
            return NextResponse.json({ error: "Job not found." }, { status: 404 });
        }

        // Generate Cover Letter
        const systemPrompt = `You are an expert career coach. Write a professional, personalized cover letter for the candidate based on their resume and the job description. Do NOT include placeholders like [Your Name] if possible, just write the body. The cover letter should be concise, compelling, and highlight the matching skills.`;

        const userPromptContent = `
Candidate Resume:
${resume.parsed_content.substring(0, 3000)}

Job Description:
Title: ${job.title}
Company: ${job.company}
Description:
${job.description.substring(0, 2000)}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPromptContent }
            ],
        });

        const coverLetterText = completion.choices[0].message.content || "";

        // Save to applications table
        await supabase
            .from("applications")
            .upsert({
                user_id: user.id,
                job_id: job_id,
                cover_letter_text: coverLetterText,
                updated_at: new Date().toISOString()
            }, { onConflict: "user_id, job_id" });

        return NextResponse.json({ success: true, cover_letter: coverLetterText });

    } catch (error: any) {
        console.error("Cover letter generation error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
