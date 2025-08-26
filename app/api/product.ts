"use server";

import { supabaseBrowserClient } from "../services/supabase/client/supabaseBrowserClient";

export async function get_all_products() {
  const { data, error } = await await supabaseBrowserClient.rpc(
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
    message: "Auction deleted successfully.",
    status: true,
    statusCode: 200,
    error: null,
  };
}

export async function get_all_products_with_types() {
  const { data, error } = await await supabaseBrowserClient.rpc(
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
