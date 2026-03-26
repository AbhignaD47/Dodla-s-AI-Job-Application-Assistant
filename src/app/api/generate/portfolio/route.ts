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
            .eq("user_id", (user?.id || "demo-user-id"))
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
            .eq("user_id", (user?.id || "demo-user-id"))
            .order("created_at", { ascending: false })
            .limit(1);

        if (!resumes || resumes.length === 0) {
            return NextResponse.json({ error: "No resume found. Please upload a resume first." }, { status: 400 });
        }

        const resume = resumes[0];
        const resumeText = resume.parsed_content;

        // 3. Prompt OpenAI to extract and align projects into JSON
        const systemPrompt = `You are an expert Technical Recruiter and Portfolio Designer.
You will be provided with a candidate's existing resume text and a specific target job description.
Your task is to extract the candidate's most relevant projects, experiences, and technical skills that align perfectly with the target job description.

You MUST completely adhere to the following strict JSON schema in your response:
{
  "summary": "A 1-2 sentence compelling summary of the candidate specifically tailored to why they are a great fit for this role.",
  "skills": ["Skill 1", "Skill 2", "Skill 3"], // Minimum 5, maximum 15 key technical skills relevant to the job.
  "projects": [
    {
      "name": "Project Name or Role",
      "description": "A 2-3 sentence impactful description focusing on achievements and technologies used.",
      "technologies": ["React", "Node", "PostgreSQL"] // Array of strings used in this specific project
    }
  ]
}

Rules:
1. Extract a maximum of 3 highly relevant projects or major career experiences from the resume. Do NOT invent new projects.
2. Only include skills the candidate actually possesses according to their resume, but prioritize those mentioned in the job description.
3. Return ONLY valid JSON block. No markdown wrappers, no introductory text, no conversational responses. Just the raw JSON object.`;

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
            model: "gpt-4o", // use 4o for precise JSON shaping
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.5,
        });

        const rawJsonOutput = completion.choices[0].message.content || "{}";

        // Validate JSON parses directly
        let portfolioData;
        try {
            portfolioData = JSON.parse(rawJsonOutput);
        } catch (e: unknown) {
            console.error("Failed to parse OpenAI portfolio JSON:", e);
            return NextResponse.json({ error: "Received malformed data from AI." }, { status: 500 });
        }

        // 4. Save the generated JSON string to the applications table
        const { error: updateError } = await supabase
            .from("applications")
            .update({ portfolio_url: JSON.stringify(portfolioData) })
            .eq("user_id", (user?.id || "demo-user-id"))
            .eq("job_id", job_id);

        if (updateError) {
            console.error("Failed to save generated portfolio to DB", updateError);
            throw updateError;
        }

        return NextResponse.json({ success: true, portfolio: portfolioData });

    } catch (error: unknown) {
        console.error("Portfolio generation error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
