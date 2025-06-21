/* eslint-disable prettier/prettier */
import { Database } from "@/app/types/database.types";
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseClient() {
  // Create a supabase client on the browser with project's credentials
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const supabaseBrowserClient = createSupabaseClient();
