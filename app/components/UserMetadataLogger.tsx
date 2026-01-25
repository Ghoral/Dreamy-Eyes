"use client";

import { useEffect } from "react";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";

export const UserMetadataLogger = () => {
  useEffect(() => {
    const fetchAndLogUserMetadata = async () => {
      try {
        const supabase = createSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const metadata = user.user_metadata;

        }
      } catch (error) {
        // Silently ignore errors
      }
    };

    fetchAndLogUserMetadata();

    // Also listen for auth state changes
    const supabase = createSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata;

      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
};



