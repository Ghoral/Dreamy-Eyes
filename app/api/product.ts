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
    .select("instagram_link, instagram")
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
  console.log('data insta', data);

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

export async function get_products(
  limit: number = 10,
  offset: number = 0,
  tags: string[] = [],
  country: string | null = null
) {
  // Convert country to API format: 'np' for Nepal, null for others
  const countryCode = country?.toLowerCase() === 'nepal' ? 'np' : null;
  console.log('[get_products API] Received country:', country, '-> Sending to RPC:', countryCode);

  const { data, error } = await supabaseBrowserClient.rpc("get_products", {
    limit_value: limit,
    offset_value: offset,
    tags: tags.length > 0 ? tags : null,
    country: countryCode,
  });

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
