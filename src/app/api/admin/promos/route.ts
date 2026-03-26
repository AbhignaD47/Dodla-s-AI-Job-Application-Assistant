import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function generateRandomString(length: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: dbUser } = await supabase.from('users').select('is_admin').eq('id', (user?.id || "demo-user-id")).single();
        if (!dbUser?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { action } = await req.json();

        if (action === "create") {
            const { discount_percent, expires_at } = await req.json();
            const code = generateRandomString(21); // Auto-generate 21 char code

            const { data, error } = await supabase.from('promo_codes').insert({
                code,
                discount_percent: discount_percent || 100,
                expires_at: expires_at || null,
                is_active: true,
                is_used: false
            }).select().single();

            if (error) throw error;
            return NextResponse.json({ success: true, promo: data });

        } else if (action === "deactivate") {
            const { id } = await req.json();
            const { data, error } = await supabase.from('promo_codes').update({ is_active: false }).eq('id', id).select().single();
            if (error) throw error;
            return NextResponse.json({ success: true, promo: data });

        } else if (action === "delete") {
            const { id } = await req.json();
            // Only delete if unused
            const { data: promo } = await supabase.from('promo_codes').select('is_used').eq('id', id).single();
            if (promo?.is_used) {
                return NextResponse.json({ error: "Cannot delete a used promo code" }, { status: 400 });
            }

            await supabase.from('promo_codes').delete().eq('id', id);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        console.error("Admin promo error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
