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

        const { job_id, lastInteraction } = await req.json();

        if (!job_id || !lastInteraction) {
            return NextResponse.json({ error: "Job ID and Last Interaction context are required" }, { status: 400 });
        }

        // Fetch user info for name
        const { data: userData } = await supabase
            .from("users")
            .select("full_name")
            .eq("id", (user?.id || "demo-user-id"))
            .single();

        // Fetch the job
        const { data: job } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", job_id)
            .single();

        if (!job) {
            return NextResponse.json({ error: "Job not found." }, { status: 404 });
        }

        const systemPrompt = `You are an expert career coach and executive assistant. Write a short, highly professional follow-up email for a candidate applying for a job.
        
CRUCIAL RULES:
1. Keep the email concise (maximum 3 short paragraphs).
2. It must be polite, appreciative, and show enthusiasm for the role without being desperate or pushy.
3. Use the candidate's name, the job title, and the company name provided.
4. The context of the follow up is: "\${lastInteraction}". Write the email specifically addressing this context.
5. Do NOT include markdown blocks like \`\`\` text, just return the raw string suitable for copy/pasting.
6. The subject line should be included on the very first line prefixed with "Subject: ".`;

        const userPrompt = `
Context:
Candidate Name: \${userData?.full_name || "Applicant"}
Target Role: \${job.title}
Company: \${job.company}
Last Interaction / Purpose: \${lastInteraction}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            temperature: 0.6,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        const emailText = completion.choices[0].message.content || "";

        return NextResponse.json({ success: true, email: emailText });

    } catch (error: unknown) {
        console.error("Follow-up email generation error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
