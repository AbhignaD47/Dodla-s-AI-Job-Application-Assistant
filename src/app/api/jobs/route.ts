import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
});

function cosineSimilarity(A: number[], B: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < A.length; i++) {
        dotProduct += A[i] * B[i];
        normA += A[i] * A[i];
        normB += B[i] * B[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let userPreferences: any = {};
        try {
            userPreferences = await req.json();
        } catch (e) {
            // Ignore if no body provided
        }

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

        let searchTerm = userPreferences?.keywords || userPreferences?.desired_role;

        if (!searchTerm) {
            if (resume.skills?.skills && resume.skills.skills.length > 0) {
                searchTerm = resume.skills.skills[0];
            } else if (resume.skills?.keywords && resume.skills.keywords.length > 0) {
                searchTerm = resume.skills.keywords[0];
            } else {
                searchTerm = "software";
            }
        }

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

        // 1. EMBEDDINGS & COSINE SIMILARITY
        const candidateText = resume.parsed_content.substring(0, 4000);
        const textsToEmbed = [candidateText, ...jobs.map((j: any) => (j.title + " " + (j.description || "")).substring(0, 4000))];
        
        const embeddingsResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: textsToEmbed
        });

        const resumeEmbedding = embeddingsResponse.data[0].embedding;
        const jobEmbeddings = embeddingsResponse.data.slice(1).map(e => e.embedding);

        const similarityScores = jobEmbeddings.map(emb => {
            const sim = cosineSimilarity(resumeEmbedding, emb);
            // Convert cosine sim (-1 to 1) to a 0-100 scale logically (usually texts are > 0)
            return Math.max(0, Math.min(100, Math.round(sim * 100)));
        });

        // 2. LLM REQUIRED SKILLS EXTRACTION (RULE-BASED COMPONENT)
        const jobsPromptData = jobs.map((job: any) => ({
            id: job.id,
            title: job.title,
            company: job.company?.display_name || "Unknown Company",
            description: job.description?.substring(0, 1000)
        }));

        const systemPrompt = `You are an AI Applicant Tracking System.
You will evaluate a candidate against a list of jobs.
Based on the candidate's skills and the jobs' requirements:
1. Identify matching and missing skills.
2. Provide a 1-sentence match summary.
3. Provide a 'rule_based_score' from 0-100 indicating how well their skills explicitly match the job requirements.

Respond ONLY with a JSON array of objects fitting this schema:
{
  "job_id": string or number,
  "rule_based_score": number,
  "skill_gap_analysis": {
    "matching": string[],
    "missing": string[]
  },
  "match_summary": string
}`;

        const targetSkills = userPreferences?.skills?.length > 0 ? userPreferences.skills : resume.skills?.skills;
        const targetExp = userPreferences?.experience_years ?? resume.skills?.experience_years ?? 0;

        const userPromptContent = `
Candidate Core Skills:
${JSON.stringify(targetSkills, null, 2)}

Candidate Experience: ${targetExp} years

Candidate excerpt:
${resume.parsed_content.substring(0, 1500)}

Jobs:
${JSON.stringify(jobsPromptData, null, 2)}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPromptContent }
            ],
            response_format: { type: "json_object" }
        });

        const aiResponseStr = completion.choices[0].message.content || '{"matches": []}';
        let scoredJobs: any[] = [];

        try {
            const parsedAiResponse = JSON.parse(aiResponseStr);
            if (Array.isArray(parsedAiResponse)) {
                scoredJobs = parsedAiResponse;
            } else {
                const arrayKey = Object.keys(parsedAiResponse).find(k => Array.isArray(parsedAiResponse[k]));
                if (arrayKey) {
                    scoredJobs = parsedAiResponse[arrayKey];
                } else {
                    scoredJobs = [parsedAiResponse];
                }
            }
        } catch (err) {
            console.error("OpenAI JSON parse error:", err);
            return NextResponse.json({ error: "Failed to score jobs" }, { status: 500 });
        }

        // 3. COMBINE SCORES
        const finalMatches = [];
        const jobInserts = [];
        const matchInserts = [];

        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            const simScore = similarityScores[i];
            const scoreData = scoredJobs.find(s => String(s.job_id) === String(job.id)) || {
                rule_based_score: 50,
                skill_gap_analysis: { matching: [], missing: [] },
                match_summary: "No summary available."
            };

            // Final Score = 40% Embedding Similarity + 60% Rule-Based Skill Match
            const finalScore = Math.round((simScore * 0.4) + (scoreData.rule_based_score * 0.6));

            if (finalScore >= 60) { // Lowered threshold slightly since realistic cosine sims might lower average
                scoreData.ats_score = finalScore; // Attach for frontend compatibility

                jobInserts.push({
                    remotive_id: String(job.id),
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

        finalMatches.sort((a, b) => b.score.ats_score - a.score.ats_score);

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
                            user_id: (user?.id || "demo-user-id"),
                            job_id: insertedJob.id,
                            relevance_score: matchData.score.ats_score,
                            match_summary: {
                                skill_gap_analysis: matchData.score.skill_gap_analysis,
                                match_summary: matchData.score.match_summary
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
