import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { job_id, type } = await req.json();
        // type could be 'post_application' or 'post_interview'

        const { data: job } = await supabase.from("jobs").select("*").eq("id", job_id).single();
        if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });

        const context = type === 'post_interview'
            ? "I recently had an interview with them and want to send a thank you / follow up."
            : "I applied a week ago and haven't heard back yet.";

        const systemPrompt = `You are a professional communication coach. Write a polite, concise follow-up email to the recruiter/hiring manager for the following job at ${job.company} (${job.title}). Context: ${context}. Do not use placeholders like [Your Name] if you can avoid it, just write the body.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }],
        });

        const emailText = completion.choices[0].message.content || "";
        return NextResponse.json({ success: true, email: emailText });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
