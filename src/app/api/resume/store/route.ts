import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resume_text, jd_text } = body;

        if (!resume_text || !jd_text) {
            return NextResponse.json({ error: "resume_text and jd_text are required." }, { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let resume_id = null;
        let jd_id = null;

        if (user) {
            const remotiveId = `custom-jd-${crypto.randomUUID()}`;
            const { data: jobRes } = await supabase
                .from("jobs")
                .insert({
                    remotive_id: remotiveId,
                    title: "Manual Job Application",
                    company: "Manual Target",
                    description: jd_text,
                })
                .select("id")
                .single();

            if (jobRes?.id) jd_id = jobRes.id;

            const { data: resumeRes } = await supabase
                .from("resumes")
                .insert({
                    user_id: user.id,
                    parsed_content: resume_text
                })
                .select("id")
                .single();

            if (resumeRes?.id) resume_id = resumeRes.id;
        } else {
             // For unauthenticated users, we cannot store to DB due to RLS user_id requirements.
             return NextResponse.json({ error: "Must be logged in to securely store resumes for optimization." }, { status: 401 });
        }

        return NextResponse.json({ success: true, resume_id, jd_id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
