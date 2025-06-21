import { BehaviorSubject } from "rxjs";
import { PostgrestError } from "@supabase/supabase-js";

export type SupabaseEvent = {
  error?: PostgrestError;
  type: "ERROR" | "SUCCESS";
  context?: string;
  showSnackbar?: boolean;
  message?: string;
};

export const supabaseEvent$ = new BehaviorSubject<SupabaseEvent | null>(null);
