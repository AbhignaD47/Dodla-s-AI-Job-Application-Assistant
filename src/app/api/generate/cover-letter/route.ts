import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
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
            .eq("user_id", (user?.id || "demo-user-id"))
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
        const systemPrompt = `You are an expert career coach. Write a professional, highly personalized cover letter for the candidate based on their resume and the specific job description provided.

CRUCIAL RULES:
1. NEVER use placeholder tags like [Your Name], [Company Name], [Date], or [Insert Skill]. 
2. Use the actual name, skills, and past companies extracted from the candidate's resume.
3. If the candidate's name is not obvious from the resume, sign off as "A Passionate Professional".
4. Address the letter to "Hiring Manager" or the Company Name directly.
5. Keep the letter concise (3-4 paragraphs), compelling, and directly focused on how the candidate's specific past achievements solve the problems outlined in the job description.
6. Do NOT wrap the response in markdown blocks like \`\`\` text, just return the raw string.`;

        const userPromptContent = `
Candidate Resume:
${resume.parsed_content.substring(0, 4000)}

Job Description:
Title: ${job.title}
Company: ${job.company}
Description:
${job.description.substring(0, 4000)}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            temperature: 0.7,
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
                user_id: (user?.id || "demo-user-id"),
                job_id: job_id,
                cover_letter_text: coverLetterText,
                updated_at: new Date().toISOString()
            }, { onConflict: "user_id, job_id" });

        return NextResponse.json({ success: true, cover_letter: coverLetterText });

    } catch (error: unknown) {
        console.error("Cover letter generation error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
