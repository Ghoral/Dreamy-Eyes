"use server";

import { createSupabaseServerClient } from "../services/supabase/server/supabaseServerClient";

export async function get_detail() {
    try {
        console.log('>>> [LOG] Fetching detail from database...');
        const supabase = await createSupabaseServerClient();
        const { data, error } = await (supabase as any)
            .from("detail")
            .select("*")
            .order("id", { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error(">>> [ERROR] Database fetch error:", error.message);
            return {
                status: false,
                message: error.message,
            };
        }

        console.log(">>> [LOG] Fetched Detail Data Successfully:", data);
        return {
            status: true,
            data: data,
        };
    } catch (err: any) {
        console.error(">>> [CRITICAL] Unexpected error in get_detail:", err);
        return {
            status: false,
            message: err.message || "An unexpected error occurred",
        };
    }
}
