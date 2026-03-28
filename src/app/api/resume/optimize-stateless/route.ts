import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resume_id, jd_id, resume_text: raw_resume, jd_text: raw_jd } = body;

        let jd_text = raw_jd;
        let resume_text = raw_resume;

        if (resume_id && jd_id) {
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

            jd_text = jobData.description;
            resume_text = resumeData.parsed_content;
        }

        if (!resume_text || !jd_text) {
            return NextResponse.json({ error: "Valid text or valid IDs are required for optimization." }, { status: 400 });
        }

        const systemPrompt = `You are a senior technical recruiter and ATS optimization expert.

Strict rules:
- You must STRICTLY map the user's resume into the exact JSON schema provided.
- Keep the exact structure: personalInfo, education, skills, experience, projects, certifications.
- If a sub-field (e.g. gpa, coursework, link) is missing or NA, return an empty string.
- Use strong action verbs and integrate keywords naturally from the Job Description into the bullet points.
- Bullet points must be quantified where possible.
- CRITICAL EXHAUSTIVE EXTRACTION: You MUST include ALL sections present in the original resume. 
- You MUST extract EVERY SINGLE job and EVERY SINGLE project into the JSON arrays. 
- NEVER return empty arrays for experience or projects if they exist in the source text.
- Do NOT delete experience just because it doesn't match the Job Description perfectly. You must keep all experience, just optimize the phrasing.
- Output the COMPLETE, full-length resume exactly matching the original chronological timeline.
- Preserve all original sections, order, and roles.
- Do not fabricate, infer, or exaggerate experience.`;

        const userPrompt = `
TARGET JOB DESCRIPTION:
${jd_text.substring(0, 15000)}

---

CANDIDATE ORIGINAL RESUME TEXT:
${resume_text.substring(0, 15000)}
`;

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

        return NextResponse.json({ 
            success: true, 
            optimized_resume_json: optimizedJson,
            original_resume_text: resume_text
        });

    } catch (error: any) {
        console.error("Resume optimization error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
