"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";

const IP_COUNTRY_COOKIE_NAME = "dreamy-eyes-ip-country";

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

const fetchCountryFromIP = async (): Promise<string | null> => {
  try {
    if (typeof window === "undefined") return "nepal";

    // 1. Browser Probe (Captures Browser VPN)
    let browserHint = "";
    try {
      const res = await fetch("https://ipapi.co/json/", { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        browserHint = data.country_code || "";
        console.log(`[useUserCountry] Browser Probe: ${browserHint}`);
      }
    } catch (e) {
      console.warn("[useUserCountry] Browser probe failed.");
    }

    // 2. Server Sync
    const response = await fetch(`/api/detect-country?hint=${browserHint}`, { cache: 'no-store' });
    if (!response.ok) throw new Error("API failed");

    const data = await response.json();
    console.log(`[useUserCountry] Server Response: ${data.countryName}`);
    return (data.countryName || "Nepal").toLowerCase();
  } catch (error) {
    console.error("[useUserCountry] Fetch failed:", error);
    return "nepal";
  }
};

export const useUserCountry = () => {
  const [country, setCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.user_metadata?.country) {
          console.log("[useUserCountry] Using Account Settings");
          setCountry(user.user_metadata.country.toLowerCase());
        } else {
          const res = await fetchCountryFromIP();
          setCountry(res);
        }
      } catch (e) {
        setCountry("nepal");
      } finally {
        setIsLoading(false);
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
          const res = await fetchCountryFromIP();
          setCountry(res);
        }
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { country, isLoading };
};
