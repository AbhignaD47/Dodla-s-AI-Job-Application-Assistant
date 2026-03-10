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
            return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
        }

        // 1. Fetch the Application and Job details
        const { data: application } = await supabase
            .from("applications")
            .select(`
                status,
                jobs (
                    id,
                    title,
                    company,
                    description
                )
            `)
            .eq("user_id", user.id)
            .eq("job_id", job_id)
            .single();

        if (!application || !application.jobs) {
            return NextResponse.json({ error: "Application/Job not found" }, { status: 404 });
        }

        const job: any = Array.isArray(application.jobs) ? application.jobs[0] : application.jobs; // eslint-disable-line @typescript-eslint/no-explicit-any
        const jobDescription = job.description || job.title;

        // 2. Fetch the User's Latest Resume
        const { data: resumes } = await supabase
            .from("resumes")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        if (!resumes || resumes.length === 0) {
            return NextResponse.json({ error: "No resume found. Please upload a resume first." }, { status: 400 });
        }

        const resume = resumes[0];
        const resumeText = resume.parsed_content;

        // 3. Prompt OpenAI to rewrite the resume
        // Instructions: rewrite bullet points to align with keywords, improve ATS compatibility.
        const systemPrompt = `You are an expert Resume Optimizer and Career Coach.
You will be provided with a candidate's existing resume text and a specific target job description.
Your task is to comprehensively rewrite the candidate's resume to be perfectly optimized for this specific job.

Rules for rewriting:
1. MAXIMIZE ATS COMPATIBILITY: Weave in exact keywords and phrases from the job description naturally into the bullet points and summary.
2. REWRITE BULLET POINTS: Enhance the impact of existing bullet points using strong action verbs and highlighting measurable achievements that align with the required skills.
3. RETAIN TRUTH: Do not invent experiences, skills, or degrees the candidate does not have. Only rephrase and emphasize existing truths.
4. PROFESSIONAL FORMATTING: Output the generated resume clearly in standard, highly-readable Markdown format without any conversational filler or preambles. Output only the Resume.`;

        const userPrompt = `
TARGET JOB DETAILS:
Title: ${job.title}
Company: ${job.company}

Job Description:
${jobDescription.substring(0, 4000)}

---

CANDIDATE ORIGINAL RESUME TEXT:
${resumeText.substring(0, 4000)}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // using the smarter model for highly creative text manipulation
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
        });

        const optimizedMarkdown = completion.choices[0].message.content || "";

        // 4. Save the optimized version to the applications table
        const { error: updateError } = await supabase
            .from("applications")
            .update({ optimized_resume_url: optimizedMarkdown })
            .eq("user_id", user.id)
            .eq("job_id", job_id);

        if (updateError) {
            console.error("Failed to save optimized resume to DB", updateError);
            throw updateError;
        }

        return NextResponse.json({ success: true, optimized_resume_url: optimizedMarkdown });

    } catch (error: unknown) {
        console.error("Resume optimization error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
