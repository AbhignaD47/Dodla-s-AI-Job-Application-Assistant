import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { desired_role, experience_level, location, remote_preference } = body;

        // Upsert preferences
        const { data, error } = await supabase
            .from("user_preferences")
            .upsert(
                {
                    user_id: (user?.id || "demo-user-id"),
                    desired_role: desired_role || null,
                    experience_level: experience_level || null,
                    location: location || null,
                    remote_preference: remote_preference !== undefined ? remote_preference : true,
                    updated_at: new Date().toISOString()
                },
                { onConflict: "user_id" }
            )
            .select()
            .single();

        if (error) {
            console.error("Database error saving preferences:", error);
            return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
        }

        return NextResponse.json({ success: true, preferences: data });
    } catch (error: unknown) {
        console.error("Preferences API Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
