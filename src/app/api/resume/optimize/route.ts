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

        // 3. Prompt OpenAI to rewrite the resume
        // Instructions: rewrite bullet points to align with keywords, improve ATS compatibility.
        const systemPrompt = `You are a senior technical recruiter and ATS optimization expert.

Rewrite resumes to maximize ATS performance and recruiter readability.
CRUCIAL CONDITIONS:
- You must STRICTLY map the user's resume into the exact JSON schema provided.
- Keep the exact structure: personalInfo, education, skills, experience, projects, certifications.
- If a sub-field (e.g. gpa, coursework, link) is missing or NA, return an empty string "".
- Use strong action verbs and integrate keywords naturally from the Job Description into the bullet points.
- Bullet points must be quantified where possible.
- CRITICAL: You MUST include ALL sections present in the original resume. Do NOT omit Professional Experience, Projects, or any other sections under any circumstances. Output the COMPLETE resume.
- Keep content truthful. Do not fabricate experience.`;

        const userPrompt = `Resume:
${resumeText.substring(0, 15000)}

Job Description:
${jobDescription.substring(0, 15000)}

Rewrite the resume mapped exactly to the required JSON schema structure.`;

        const { resumeJsonSchema } = await import("@/lib/resumeSchema");

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 8000,
            response_format: {
                type: "json_schema",
                json_schema: resumeJsonSchema
            }
        });

        const optimizedJsonString = completion.choices[0].message.content || "{}";
        const optimizedJson = JSON.parse(optimizedJsonString);

        // 4. Save the optimized version to the applications table
        const { error: updateError } = await supabase
            .from("applications")
            .update({ optimized_resume_url: optimizedJsonString })
            .eq("user_id", (user?.id || "demo-user-id"))
            .eq("job_id", job_id);

        if (updateError) {
            console.error("Failed to save optimized resume to DB", updateError);
            throw updateError;
        }

        return NextResponse.json({ success: true, optimized_resume_json: optimizedJson });

    } catch (error: unknown) {
        console.error("Resume optimization error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
