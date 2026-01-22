"use server";

import { createSupabaseServerClient } from "../services/supabase/server/supabaseServerClient";

export async function get_sales(
  limit_value: number = 10,
  offset_value: number = 0
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_sales", {
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

export async function get_sale_by_id(pid: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_sale_by_id", {
    pid,
  });

  if (error) {
    return {
      data: null,
      message: error.message || "Failed to fetch sale",
      status: false,
      statusCode: 400,
      error: error.details,
    };
  }

  return {
    data: data || null,
    message: "Sale fetched successfully",
    status: true,
    statusCode: 200,
    error: null,
  };
}

