import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resume_text, jd_text } = body;

        if (!resume_text || !jd_text) {
            return NextResponse.json({ error: "Resume text and Job Description text are required." }, { status: 400 });
        }

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

        return NextResponse.json({ success: true, optimized_resume_text: optimizedMarkdown });

    } catch (error: any) {
        console.error("Resume optimization error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
