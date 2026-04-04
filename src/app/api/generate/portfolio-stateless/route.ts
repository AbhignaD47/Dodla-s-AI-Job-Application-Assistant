import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
});

export const maxDuration = 60;

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
                .select("description, title, company")
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

            jd_text = `Title: ${jobData.title || 'Unknown'}\nCompany: ${jobData.company || 'Unknown'}\nDescription:\n${jobData.description}`;
            resume_text = resumeData.parsed_content;
        }

        if (!resume_text || !jd_text) {
            return NextResponse.json({ error: "Valid text or valid IDs are required for generation." }, { status: 400 });
        }

        const systemPrompt = `You are a portfolio generator for job candidates.
Generate structured, job-specific portfolio content.
Do not include fluff.
Make content concise and relevant to the job description.
Return JSON only.

OUTPUT FORMAT (JSON):
{
  "about": "",
  "skills": [],
  "projects": [
    {
      "title": "",
      "description": "",
      "impact": ""
    }
  ],
  "experience_summary": ""
}`;

        const userPrompt = `RESUME:
${resume_text.substring(0, 10000)}

JOB DESCRIPTION:
${jd_text.substring(0, 10000)}

TASK:
Generate a portfolio with:
- About section
- Skills (prioritized for JD)
- Projects (tailored descriptions)
- Experience summary`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2, // low temp for accurate extraction
        });

        const rawJsonOutput = completion.choices[0].message.content || "{}";
        let portfolioData;
        try {
            portfolioData = JSON.parse(rawJsonOutput);
        } catch (e: unknown) {
            throw new Error("Received malformed JSON from AI");
        }

        return NextResponse.json({ 
            success: true, 
            portfolio_json: portfolioData,
            original_resume_text: resume_text
        });

    } catch (error: any) {
        console.error("Portfolio generation error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate tailored portfolio" }, { status: 500 });
    }
}
