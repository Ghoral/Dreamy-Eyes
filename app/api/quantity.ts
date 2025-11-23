"use server";

import { createSupabaseServerClient } from "../services/supabase/server/supabaseServerClient";

export async function check_product_quantity(
  p_product_id: string,
  p_color_hex: string,
  p_requested_quantity: number
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("check_product_quantity", {
    p_product_id,
    p_color_hex,
    p_requested_quantity,
  });

  if (error) {
    return {
      available: false,
      message: error.message || "Failed to check quantity",
      available_quantity: 0,
      requested_quantity: p_requested_quantity,
      error: error.details,
    };
  }

  return (
    data || {
      available: false,
      message: "Unknown error",
      available_quantity: 0,
      requested_quantity: p_requested_quantity,
    }
  );
}

export async function update_product_quantity(
  p_product_id: string,
  p_color_hex: string,
  p_requested_quantity: number
) {
  const supabase = await createSupabaseServerClient();

  // First check if quantity is available
  const { data: checkData, error: checkError } = await supabase.rpc(
    "check_product_quantity",
    {
      p_product_id,
      p_color_hex,
      p_requested_quantity,
    }
  );

  if (checkError) {
    return {
      success: false,
      message: checkError.message || "Failed to check quantity",
      available_quantity: 0,
      requested_quantity: p_requested_quantity,
      error: checkError.details,
    };
  }

  if (!checkData?.available) {
    return {
      success: false,
      message: checkData?.message || "Quantity not available",
      available_quantity: checkData?.available_quantity || 0,
      requested_quantity: p_requested_quantity,
    };
  }

  // If available, return success with the validated quantity
  return {
    success: true,
    message: checkData.message || "Quantity available",
    available_quantity: checkData.available_quantity,
    requested_quantity: p_requested_quantity,
    validated_quantity: Math.min(
      p_requested_quantity,
      checkData.available_quantity
    ),
  };
}
