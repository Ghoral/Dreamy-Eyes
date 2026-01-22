"use server";

import { createSupabaseServerClient } from "../services/supabase/server/supabaseServerClient";

export async function get_enabled_offers() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_enabled_offers");

  if (error) {
    return {
      data: null,
      message: error.message || "Failed to fetch offers",
      status: false,
      statusCode: 400,
      error: error.details,
      total: 0,
    };
  }

  return {
    data: data?.data || [],
    message: "Offers fetched successfully",
    status: true,
    statusCode: 200,
    error: null,
    total: data?.total || 0,
  };
}






