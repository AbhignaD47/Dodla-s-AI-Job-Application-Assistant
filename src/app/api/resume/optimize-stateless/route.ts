import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resume_id, jd_id } = body;

        if (!resume_id || !jd_id) {
            return NextResponse.json({ error: "resume_id and jd_id are strictly required. Raw text input is not allowed." }, { status: 400 });
        }

        const supabase = await import("@/utils/supabase/server").then(m => m.createClient());
        
        // Fetch JD
        const { data: jobData, error: jobErr } = await supabase
            .from("jobs")
            .select("description")
            .eq("id", jd_id)
            .single();

        if (!jobData || jobErr) throw new Error("Job Description not found.");

        // Fetch Resume
        const { data: resumeData, error: resumeErr } = await supabase
            .from("resumes")
            .select("parsed_content")
            .eq("id", resume_id)
            .single();

        if (!resumeData || resumeErr) throw new Error("Resume not found.");

        const jd_text = jobData.description;
        const resume_text = resumeData.parsed_content;

        const systemPrompt = `You are a senior technical recruiter and ATS optimization expert.

Strict rules:

Do not fabricate, infer, or exaggerate experience.
Do not add tools, technologies, or metrics not present in the original resume.
Preserve all original sections, order, and roles.
Rewrite bullet points to improve clarity, impact, and keyword alignment.
Integrate relevant keywords from the job description naturally (no keyword stuffing).
Use strong action verbs.
Use measurable impact only if explicitly present.
Keep formatting clean and ATS-friendly.

Output must be clean resume text only. No explanations.`;

        const userPrompt = `
TARGET JOB DESCRIPTION:
${jd_text.substring(0, 4000)}

---

CANDIDATE ORIGINAL RESUME TEXT:
${resume_text.substring(0, 4000)}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
        });

        const optimizedMarkdown = completion.choices[0].message.content || "";

        return NextResponse.json({ 
            success: true, 
            optimized_resume_text: optimizedMarkdown,
            original_resume_text: resume_text
        });

    } catch (error: any) {
        console.error("Resume optimization error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
