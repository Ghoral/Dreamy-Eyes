"use server";

import { createSupabaseServerClient } from "../services/supabase/server/supabaseServerClient";

export async function get_all_products() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("get_available_products");

  console.log("data", data, error);

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
