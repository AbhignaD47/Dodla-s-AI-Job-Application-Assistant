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
        if (!job_id) return NextResponse.json({ error: "Job ID required" }, { status: 400 });

        const { data: resumes } = await supabase.from("resumes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
        const { data: job } = await supabase.from("jobs").select("*").eq("id", job_id).single();

        if (!resumes || !job) {
            return NextResponse.json({ error: "Resume or Job not found." }, { status: 400 });
        }

        // Generate Portfolio JSON
        const systemPrompt = `You are a portfolio generator. Extract the candidate's projects and experience that are MOST RELEVANT to the provided job description. 
Return a JSON object with this schema:
{
  "title": string,
  "summary": string,
  "projects": [{ "name": string, "description": string, "skills_used": string[] }]
}`;

        const userPromptContent = `Resume: ${resumes[0].parsed_content.substring(0, 3000)}\n\nJob: ${job.title} at ${job.company}\n${job.description.substring(0, 2000)}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPromptContent }
            ],
            response_format: { type: "json_object" }
        });

        const portfolioData = JSON.parse(completion.choices[0].message.content || "{}");

        // In a real app we'd save this JSON to a new table `portfolios` or store it as stringified JSON in `applications` or storage.
        // For now we persist the stringified URL/Data to `applications`
        const portDataStr = JSON.stringify(portfolioData);

        await supabase.from("applications").upsert({
            user_id: user.id,
            job_id: job_id,
            portfolio_url: portDataStr, // using this text column to store the json string for the generated portfolio view
            updated_at: new Date().toISOString()
        }, { onConflict: "user_id, job_id" });

        return NextResponse.json({ success: true, portfolio: portfolioData });

    } catch (error: any) {
        console.error("Portfolio generation error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
