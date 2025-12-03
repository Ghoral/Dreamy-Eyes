"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";

export const useUserCountry = () => {
  const [country, setCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        const supabase = createSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.user_metadata?.country) {
          setCountry(user.user_metadata.country.toLowerCase());
        } else {
          setCountry(null); // Default to Nepal if no country
        }
      } catch (error) {
        setCountry(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCountry();

    // Listen for auth state changes
    const supabase = createSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.user_metadata?.country) {
        setCountry(session.user.user_metadata.country.toLowerCase());
      } else {
        setCountry(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { country, isLoading };
};

