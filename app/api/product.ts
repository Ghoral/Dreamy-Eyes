"use server";

import { supabaseBrowserClient } from "../services/supabase/client/supabaseBrowserClient";

export async function get_all_products() {
  const { data, error } = await supabaseBrowserClient.rpc(
    "get_available_products"
  );

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
    message: "Products fetched successfully.", // Fixed message
    status: true,
    statusCode: 200,
    error: null,
  };
}

export async function get_all_products_with_types() {
  const { data, error } = await supabaseBrowserClient.rpc(
    "get_all_products_with_types"
  );

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
    message: "Fetched successfully.",
    status: true,
    statusCode: 200,
    error: null,
  };
}

export async function get_app_details() {
  const { data, error } = await supabaseBrowserClient
    .from("app_detail")
    .select("tiktok_link, follow_us_tiktok")
    .limit(1);

  if (error) {
    return {
      data: null,
      message: "Failed to fetch app details",
      status: false,
      statusCode: 400,
      error: error.details,
    };
  }

  return {
    data: data?.[0] || null,
    message: "App details fetched successfully.",
    status: true,
    statusCode: 200,
    error: null,
  };
}

export async function get_products_by_type(
  p_type: string,
  p_page: number = 1,
  p_limit: number = 10,
  p_filter: any = {}
) {
  const { data, error } = await supabaseBrowserClient.rpc(
    "get_products_by_type",
    {
      p_type,
      p_page,
      p_limit,
      p_filter: p_filter || {},
    }
  );

  if (error) {
    return {
      data: null,
      message: "Failed to fetch products",
      status: false,
      statusCode: 400,
      error: error.details,
    };
  }

  return {
    data: data,
    message: "Products fetched successfully.",
    status: true,
    statusCode: 200,
    error: null,
  };
}
