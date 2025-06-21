"use server";

import { createSupabaseServerClient } from "../services/supabase/server/supabaseServerClient";

export async function get_all_products() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.from("product").select("*");
  console.log("data", data);

  if (error) {
    return {
      data: null,
      message: "Failed to fetch",
      status: false,
      statusCode: 400,
      error: error.details,
    };
  }

  return {
    data: data,
    message: "Auction deleted successfully.",
    status: true,
    statusCode: 200,
    error: null,
  };
}
