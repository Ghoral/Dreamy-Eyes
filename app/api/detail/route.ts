import { createSupabaseServerClient } from "../../services/supabase/server/supabaseServerClient";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await (supabase as any)
            .from("detail")
            .select("*")
            .order("id", { ascending: false })
            .limit(1)
            .single();

        if (error) {
            return NextResponse.json({ status: false, message: error.message }, { status: 400 });
        }

        return NextResponse.json({ status: true, data: data });
    } catch (err: any) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
