"use server";

import { supabaseBrowserClient } from "../services/supabase/client/supabaseBrowserClient";

export async function get_sales(
  limit_value: number = 10,
  offset_value: number = 0
) {
  const { data, error } = await supabaseBrowserClient.rpc("get_sales", {
    limit_value,
    offset_value,
  });

  if (error) {
    return {
      data: null,
      message: error.message || "Failed to fetch sales",
      status: false,
      statusCode: 400,
      error: error.details,
      total: 0,
    };
  }

  return {
    data: data?.data || [],
    message: "Sales fetched successfully",
    status: true,
    statusCode: 200,
    error: null,
    total: data?.total || 0,
  };
}

