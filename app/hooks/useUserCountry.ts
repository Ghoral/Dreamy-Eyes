"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";

const fetchCountryName = async (): Promise<string> => {
  try {
    // 1. Get raw country code from Vercel-optimized endpoint
    const locRes = await fetch("/api/location", { cache: 'no-store' });
    const locData = await locRes.json();
    const code = locData.country?.toUpperCase();

    // 2. Sync with main detection API to get full name and update encrypted cookie
    const syncRes = await fetch(`/api/detect-country?hint=${code || ""}&v=${Date.now()}`, {
      cache: 'no-store'
    });

    if (!syncRes.ok) return "india";

    const syncData = await syncRes.json();
    return (syncData.countryName || "India").toLowerCase();
  } catch (error) {
    return "india";
  }
};

export const useUserCountry = () => {
  const [country, setCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Priority 1: User Profile
        if (user?.user_metadata?.country) {
          if (isMounted) {
            setCountry(user.user_metadata.country.toLowerCase());
            setIsLoading(false);
          }
          return;
        }

        // Priority 2: Vercel Detection
        const detected = await fetchCountryName();
        if (isMounted) {
          setCountry(detected);
          setIsLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setCountry("india");
          setIsLoading(false);
        }
      }
    };

    init();

    const supabase = createSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setIsLoading(true);
        if (session?.user?.user_metadata?.country) {
          setCountry(session.user.user_metadata.country.toLowerCase());
        } else {
          const res = await fetchCountryName();
          setCountry(res);
        }
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { country, isLoading };
};
