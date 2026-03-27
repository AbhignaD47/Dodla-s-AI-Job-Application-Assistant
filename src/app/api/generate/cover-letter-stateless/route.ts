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

        const systemPrompt = `You are an expert career coach. Write a professional, highly personalized cover letter for the candidate based on their resume and the specific job description provided.

CRUCIAL RULES:
1. NEVER use placeholder tags like [Your Name], [Company Name], [Date], or [Insert Skill]. 
2. Use the actual name, skills, and past companies extracted from the candidate's resume.
3. If the candidate's name is not obvious from the resume, sign off as "A Passionate Professional".
4. Address the letter to "Hiring Manager" or the Company Name directly.
5. Keep the letter concise (3-4 paragraphs), compelling, and directly focused on how the candidate's specific past achievements solve the problems outlined in the job description.
6. Return the response in formatted markdown for readability.`;

        const userPrompt = `Candidate Resume:
${resume_text.substring(0, 4000)}

Job Description:
${jd_text.substring(0, 4000)}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
        });

        const generatedMarkdown = completion.choices[0].message.content || "";

        return NextResponse.json({ 
            success: true, 
            cover_letter_text: generatedMarkdown,
            original_resume_text: resume_text
        });

    } catch (error: any) {
        console.error("Cover letter generation error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate cover letter" }, { status: 500 });
    }
}
