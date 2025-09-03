import { supabaseClient } from "../service/supabase";

/**
 * Activity types for logging user actions
 */
export enum ActivityType {
  SIGN_IN = "sign_in",
  SIGN_UP = "sign_up",
  PRODUCT_CREATE = "product_create",
  PRODUCT_UPDATE = "product_update",
  PRODUCT_DELETE = "product_delete",
  USER_DELETE = "user_delete",
  ADMIN_DELETE = "admin_delete",
  ADMIN_INVITE = "admin_invite",
  TIKTOK_UPDATE = "tiktok_update",
  BANNER_UPDATE = "banner_update",
}

/**
 * Logs user activity to the database
 * @param data Activity log data
 * @returns Promise with the result of the logging operation
 */
export const logActivity = async (
  action: string,
  table: string,
  module: string
) => {
  try {
    console.log("oook");

    // Call the RPC function to log the activity
    const { error, data } = await supabaseClient.rpc("log_activity", {
      p_action: action,
      p_table_name: table,
      p_module: module,
    });
    console.log("bdy", {
      p_action: action,
      p_table_name: table,
      p_module: module,
    });

    console.log("dd", data);

    if (error) {
      console.error("Error logging activity:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in logActivity:", error);
    return { success: false, error };
  }
};
