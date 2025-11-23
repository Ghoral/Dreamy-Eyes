/* eslint-disable prettier/prettier */

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseClient() {
  // Create a supabase client on the browser with project's credentials
  // Client-side code MUST use NEXT_PUBLIC_ prefix (exposed to browser)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file"
    );
  }

  return createBrowserClient<any>(supabaseUrl, supabaseAnonKey);
}

export const supabaseBrowserClient = createSupabaseClient();
