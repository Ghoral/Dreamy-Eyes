"use server";

import { createSupabaseServerClient } from "../services/supabase/server/supabaseServerClient";

export async function get_detail() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await (supabase as any)
        .from("detail")
        .select("*")
        .order("id", { ascending: false })
        .limit(1)
        .single();

    if (error) {
        return {
            status: false,
            message: error.message,
        };
    }

    return {
        status: true,
        data: data,
    };
}
