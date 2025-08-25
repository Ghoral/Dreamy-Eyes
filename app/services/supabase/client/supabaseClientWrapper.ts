import { supabaseEvent$ } from "@/app/interface";
import { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import { supabaseBrowserClient } from "./supabaseBrowserClient";

type QueryResult<T> = {
  data: T | null;
  error: PostgrestError | null;
};

export async function supabaseQuery<T>(
  queryCallback: (
    client: SupabaseClient
  ) => Promise<{ data: T | null; error: PostgrestError | null }>,
  context?: string,
  message?: string,
  showSnackbar?: boolean
): Promise<QueryResult<T>> {
  try {
    const { data, error } = await queryCallback(supabaseBrowserClient);

    if (error) {
      supabaseEvent$.next({
        error,
        type: "ERROR",
        context,
        message,
        showSnackbar,
      });
    } else {
      supabaseEvent$.next({ type: "SUCCESS", context, message, showSnackbar });
    }

    return { data, error };
  } catch (err) {
    const errorObj: PostgrestError = {
      name: "",
      message: "Unexpected error",
      details: String(err),
      hint: "",
      code: "",
    };

    supabaseEvent$.next({ error: errorObj, type: "ERROR", context });

    return { data: null, error: errorObj };
  }
}
