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

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Attempt to parse body for user preferences if provided, or fetch from DB
        let userPreferences: any = {};
        try {
            userPreferences = await req.json();
        } catch (e) {
            // Ignore if no body provided
        }

        // Get the user's latest parsed resume
        const { data: resumes } = await supabase
            .from("resumes")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        if (!resumes || resumes.length === 0) {
            return NextResponse.json({ error: "No resume found. Please upload a resume first." }, { status: 400 });
        }
        const resume = resumes[0];

        // Build the query for Adzuna
        // Prefer the explicitly submitted keywords, then fallback to AI skills
        let searchTerm = userPreferences?.keywords || userPreferences?.desired_role;

        if (!searchTerm) {
            // Fallback to top skill or first keyword from the parsed resume
            if (resume.skills?.skills && resume.skills.skills.length > 0) {
                searchTerm = resume.skills.skills[0];
            } else if (resume.skills?.keywords && resume.skills.keywords.length > 0) {
                searchTerm = resume.skills.keywords[0];
            } else {
                searchTerm = "software";
            }
        }

        // Fetch from Adzuna API
        // https://developer.adzuna.com/docs/search
        const adzunaAppId = "be001e44";
        const adzunaAppKey = "ffa3d1155d68cbdad175d4e716c9b170";

        let adzunaUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${adzunaAppId}&app_key=${adzunaAppKey}&results_per_page=15&what=${encodeURIComponent(searchTerm)}`;

        if (userPreferences?.location && userPreferences.location.trim() !== "") {
            adzunaUrl += `&where=${encodeURIComponent(userPreferences.location.trim())}`;
        }

        const response = await fetch(adzunaUrl);
        const data = await response.json();
        const jobs = data.results || [];

        if (jobs.length === 0) {
            return NextResponse.json({ matches: [] });
        }

        // Prepare batch prompt for OpenAI to score all 15 jobs at once against the resume
        const jobsPromptData = jobs.map((job: any) => ({
            id: job.id,
            title: job.title,
            company: job.company?.display_name || "Unknown Company",
            description: job.description?.substring(0, 1000) // Truncate HTML/description to avoid token overflow
        }));

        const systemPrompt = `You are a highly capable AI Applicant Tracking System.
You will receive a candidate's preferred skills/experience and resume summary, plus a list of job descriptions.
For EACH job, calculate a relevance score (0-100) based on how well the candidate's skills and experience match the job requirements.
Also identify any 'matching_skills' and 'missing_skills' based on their requested Core Skills.
Respond ONLY with a valid JSON array of objects, where each object matches this schema:
{
  "job_id": string or number,
  "relevance_score": number, // 0 to 100
  "matching_skills": string[],
  "missing_skills": string[],
  "ats_summary": string // short 1 sentence summary of the match
}`;

        // Determine which skills and experience to tell OpenAI about
        const targetSkills = userPreferences?.skills?.length > 0 ? userPreferences.skills : resume.skills?.skills;
        const targetExp = userPreferences?.experience_years ?? resume.skills?.experience_years ?? 0;

        const userPromptContent = `
Candidate Preferred Core Skills to Match:
${JSON.stringify(targetSkills, null, 2)}

Candidate Target Experience Level: ${targetExp} years

Candidate full parsed text excerpt (for context):
${resume.parsed_content.substring(0, 2000)}

Jobs to evaluate:
${JSON.stringify(jobsPromptData, null, 2)}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPromptContent }
            ],
            response_format: { type: "json_object" } // Enforce JSON
        });

        const aiResponseStr = completion.choices[0].message.content || '{"matches": []}';
        let scoredJobs: any[] = [];

        try {
            const parsedAiResponse = JSON.parse(aiResponseStr);
            // Depending on how GPT formats it, it might be an array or an object with a key containing the array
            if (Array.isArray(parsedAiResponse)) {
                scoredJobs = parsedAiResponse;
            } else {
                // Find the first array-like property
                const arrayKey = Object.keys(parsedAiResponse).find(k => Array.isArray(parsedAiResponse[k]));
                if (arrayKey) {
                    scoredJobs = parsedAiResponse[arrayKey];
                } else {
                    scoredJobs = [parsedAiResponse]; // fallback
                }
            }
        } catch (err) {
            console.error("OpenAI JSON parse error:", err);
            // Try to recover by ignoring
            return NextResponse.json({ error: "Failed to score jobs" }, { status: 500 });
        }

        // Filter jobs >= 70% relevance
        const finalMatches = [];
        const jobInserts = [];
        const matchInserts = [];

        for (const job of jobs) {
            const scoreData = scoredJobs.find(s => String(s.job_id) === String(job.id));
            if (scoreData && scoreData.relevance_score >= 70) {

                // Push to public.jobs table (upsert based on remotive_id)
                jobInserts.push({
                    remotive_id: String(job.id), // We keep the column name logic
                    title: job.title,
                    company: job.company?.display_name || "Unknown Company",
                    description: job.description || "",
                    applies_link: job.redirect_url || ""
                });

                finalMatches.push({
                    job: {
                        ...job,
                        company_name: job.company?.display_name || "Unknown Company",
                        location: job.location?.display_name || "",
                        url: job.redirect_url || "#"
                    },
                    score: scoreData
                });
            }
        }

        // Sort by highest relevance
        finalMatches.sort((a, b) => b.score.relevance_score - a.score.relevance_score);

        // Persist cache to DB
        if (jobInserts.length > 0) {
            const { data: insertedJobs, error: jobInsertError } = await supabase
                .from("jobs")
                .upsert(jobInserts, { onConflict: "remotive_id" })
                .select();

            if (!jobInsertError && insertedJobs) {
                for (const insertedJob of insertedJobs) {
                    const matchData = finalMatches.find(m => String(m.job.id) === String(insertedJob.remotive_id));
                    if (matchData) {
                        matchInserts.push({
                            user_id: user.id,
                            job_id: insertedJob.id,
                            relevance_score: matchData.score.relevance_score,
                            match_summary: {
                                matching_skills: matchData.score.matching_skills,
                                missing_skills: matchData.score.missing_skills,
                                ats_summary: matchData.score.ats_summary
                            }
                        });
                    }
                }
            }

            if (matchInserts.length > 0) {
                await supabase
                    .from("job_matches")
                    .upsert(matchInserts, { onConflict: "user_id, job_id" });
            }
        }

        return NextResponse.json({ matches: finalMatches });

    } catch (error: any) {
        console.error("Job match error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
