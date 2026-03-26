import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy_key",
});

// We only use the LLM to extract cleanly mapped arrays. We do all the math in TypeScript to avoid hallucinations.
// Simplified schema definition for fallback
const ExtractionSchema = {
    jd_required_skills: ["List of absolutely required skills or technologies from the job description (normalized)."],
    jd_secondary_skills: ["List of nice-to-have or secondary skills from the job description (normalized)."],
    jd_keywords: ["List of important keywords (tools, methodologies, concepts) found in the JD."],
    resume_skills: ["Comprehensive list of all skills implicitly and explicitly mentioned in the resume (normalized rigorously to exactly identically match JD skill names where applicable)."],
    resume_keywords: ["Comprehensive list of all keywords matched in the resume."],
    experience_relevance_score: 0.8,
    weak_areas: ["Specific areas where the candidate lacks experience or falls short of the JD expectations."]
};

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();



        const body = await req.json();
        const { resume_text, jd_text } = body;

        if (!resume_text?.trim() || !jd_text?.trim()) {
            return NextResponse.json({ error: "Both resume_text and jd_text are required and must not be empty." }, { status: 400 });
        }
        
        // Min Length check (avoid low-signal inputs)
        if (resume_text.length < 100 || jd_text.length < 100) {
            return NextResponse.json({ error: "Input text is too short to accurately score. Please provide more detailed text." }, { status: 400 });
        }

        const systemPrompt = `You are a strict, highly accurate ATS parsing engine. Extract the required skills, secondary skills, and keywords from the Job Description. Then, extract the skills and keywords from the Resume. 
CRITICAL RULES:
1. NEVER hallucinate skills the candidate does not explicitly have.
2. NORMALIZE skill names perfectly (e.g. if JD says "Angular 17" and Resume says "Angular", output "Angular" for both).
3. Evaluate experience relevance on a scale of 0.0 to 1.0 based strictly on years of experience and domain relevance matching exactly what the JD asks for.
4. You MUST respond with exactly this JSON format:
{
  "jd_required_skills": ["skill1"],
  "jd_secondary_skills": ["skill2"],
  "jd_keywords": ["keyword1"],
  "resume_skills": ["skill1"],
  "resume_keywords": ["keyword1"],
  "experience_relevance_score": 0.8,
  "weak_areas": ["weakness1"]
}`;

        const userPrompt = `
=== JOB DESCRIPTION ===
${jd_text}

=== CANDIDATE RESUME ===
${resume_text}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-2024-08-06",
            temperature: 0.1,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        const extractionText = completion.choices[0].message.content;
        const extraction = extractionText ? JSON.parse(extractionText) : null;
        if (!extraction) {
            throw new Error("Failed to parse ATS data from LLM.");
        }

        // --- Execute Strict Mathematics based on Specific Rules ---
        
        // Setup Sets for fast lookup with case-insensitive normalization just in case
        const normalize = (s: string) => s.trim().toLowerCase();
        
        const reqStrSet = new Set(extraction.jd_required_skills.map(normalize));
        const secStrSet = new Set(extraction.jd_secondary_skills.map(normalize));
        const resStrSet = new Set(extraction.resume_skills.map(normalize));

        // 1. Calculate Required Skills Intersection
        const matched_required = extraction.jd_required_skills.filter((s: string) => resStrSet.has(normalize(s)));
        const missing_required = extraction.jd_required_skills.filter((s: string) => !resStrSet.has(normalize(s)));

        // 2. Calculate Secondary Skills Intersection
        const matched_secondary = extraction.jd_secondary_skills.filter((s: string) => resStrSet.has(normalize(s)));
        const missing_secondary = extraction.jd_secondary_skills.filter((s: string) => !resStrSet.has(normalize(s)));

        // Combine for output variables
        const all_matched_skills = [...matched_required, ...matched_secondary];
        let missing_skills = [...missing_required, ...missing_secondary];
        
        // "Limit: Max 10 skills (prioritize required ones)"
        missing_skills = missing_skills.slice(0, 10);

        // 3. Score Formula:
        // score = (matched_required / total_required) * 60 + (matched_secondary / total_secondary) * 20 + experience_score * 20
        const total_required = reqStrSet.size > 0 ? reqStrSet.size : 1; // Prevent div/0
        const total_secondary = secStrSet.size > 0 ? secStrSet.size : 1;

        const scoreReq = (matched_required.length / total_required) * 60;
        const scoreSec = secStrSet.size > 0 ? (matched_secondary.length / total_secondary) * 20 : 20; // Give full secondary points if none required
        const scoreExp = extraction.experience_relevance_score * 20;
        
        let finalScore = Math.round(scoreReq + scoreSec + scoreExp);
        if (reqStrSet.size === 0 && secStrSet.size === 0) finalScore = 0; // Edgecase safety

        // "Penalize missing required skills heavily" + "Wrong: 80, Correct: 40-60 range"
        // If a core required skill is missing, the highest they should get realistically is capped, but the math already heavily penalizes.
        // We ensure finalScore is within 0-100.
        finalScore = Math.max(0, Math.min(100, finalScore));

        // 4. Keyword Coverage Formula:
        // (matched_keywords / total_JD_keywords) * 100
        const jdKeywordsSet = new Set(extraction.jd_keywords.map(normalize));
        const resKwSet = new Set(extraction.resume_keywords.map(normalize));
        
        const matchedKeywords = extraction.jd_keywords.filter((k: string) => resKwSet.has(normalize(k)));
        const keywordMatchPercentage = jdKeywordsSet.size > 0 
            ? Math.round((matchedKeywords.length / jdKeywordsSet.size) * 100) 
            : 100;

        // 5. Actionable Improvements Generation based on real gaps
        const improvements: string[] = [];
        
        if (missing_required.length > 0) {
            improvements.push(`Gain or highlight experience directly addressing missing core requirements: ${missing_required.slice(0, 3).join(", ")}.`);
        }
        
        if (extraction.experience_relevance_score < 0.7) {
            improvements.push("Your domain experience appears misaligned. Rewrite accomplishments to match the specific industry or seniority tier of the role.");
        }
        
        if (keywordMatchPercentage < 70) {
            improvements.push(`Increase keyword alignment. You are missing terms like: ${extraction.jd_keywords.filter((k: string) => !resKwSet.has(normalize(k))).slice(0, 3).join(", ")}.`);
        }

        // Add any weak areas the LLM found (up to 2 to avoid clutter)
        if (Array.isArray(extraction.weak_areas)) {
            extraction.weak_areas.slice(0, 2).forEach((w: string) => {
                // Avoid duplicates
                if (!improvements.some(i => i.toLowerCase().includes(w.toLowerCase().split(' ')[0]))) {
                    improvements.push(`Specifically address: ${w}`);
                }
            });
        }

        // Failsafe empty states
        if (improvements.length === 0) {
            if (finalScore >= 90) improvements.push("Resume is a highly excellent match. Ensure your formatting is ATS-friendly and cleanly readable.");
            else improvements.push("Review formatting and ensure bullet points use strong action verbs focusing on specific metrics.");
        }

        // Return Exact Spec
        return NextResponse.json({
            score: finalScore,
            matched_skills: all_matched_skills,
            missing_skills: missing_skills,
            keyword_match_percentage: keywordMatchPercentage,
            improvements: improvements
        });

    } catch (error: unknown) {
        console.error("AI Scoring Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
