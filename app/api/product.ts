"use server";

import { supabaseBrowserClient } from "../services/supabase/client/supabaseBrowserClient";
import { headers } from "next/headers";

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
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0] || headerList.get("x-real-ip");

  // Convert country to API format: 'np' for Nepal, user IP or 'in' for others
  const countryCode = country?.toLowerCase() === 'nepal' ? 'np' : (ip || 'in');

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

export async function get_eye_lashes(
  limit: number = 10,
  offset: number = 0,
  country: string | null = null
) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0] || headerList.get("x-real-ip");
  const countryCode = country?.toLowerCase() === 'nepal' ? 'np' : (ip || 'in');

  const { data, error } = await supabaseBrowserClient.rpc("get_eye_lashes", {
    limit_value: limit,
    offset_value: offset,
    country: countryCode,
  });

  if (error) {
    return { data: null, total: 0, error: error.details };
  }
  return { data: data.data, total: data.total, error: null };
}

export async function get_applicator_solution(
  country: string | null = null
) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0] || headerList.get("x-real-ip");
  const countryCode = country?.toLowerCase() === 'nepal' ? 'np' : (ip || 'in');

  const { data, error } = await supabaseBrowserClient.rpc("get_applicator_solution", {
    p_country: countryCode,
  });

  if (error) {
    return { data: null, total: 0, error: error.details };
  }
  return { data: data, total: data?.length || 0, error: null };
}


export async function get_banners() {
  const { data, error } = await supabaseBrowserClient.storage.from("banner").list("", {
    limit: 50,
    sortBy: { column: "name", order: "asc" },
  });

  if (error || !data) {
    console.error("Error fetching banners:", error);
    return [];
  }

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/banner`;
  const urls = data
    .filter((f) => !f.name.startsWith(".") && f.id)
    .map((file) => `${baseUrl}/${encodeURIComponent(file.name)}`);

  return urls;
}
