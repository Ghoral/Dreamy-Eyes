"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";

const IP_COUNTRY_COOKIE_NAME = "dreamy-eyes-ip-country";

// Helper function to get cookie value by name
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
    // Check if we're on the client side
    if (typeof window === "undefined") {
      return "nepal"; // Default for SSR
    }

    // Check if encrypted cookie exists
    const encryptedCookie = getCookie(IP_COUNTRY_COOKIE_NAME);
    if (encryptedCookie) {
      // Verify and decrypt cookie server-side
      try {
        const verifyResponse = await fetch("/api/verify-country", {
          method: "POST",
          credentials: "include",
        });

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          if (verifyData.valid && verifyData.country) {

            return verifyData.country.toLowerCase();
          } else {

            // Cookie was tampered with or corrupted, clear it and re-fetch
            document.cookie = `${IP_COUNTRY_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          }
        }
      } catch (verifyError) {

        // Continue to re-fetch if verification fails
      }
    }

    // Fetch from API (which will set the encrypted cookie)
    const response = await fetch("/api/detect-country");
    if (!response.ok) {
      throw new Error("Failed to fetch country");
    }

    const data = await response.json();
    const countryName = data.countryName || "nepal"; // Default to Nepal

    // Encrypted cookie is automatically set by the API response

    return countryName.toLowerCase();
  } catch (error) {


    // Fallback to default if all else fails
    return "nepal";
  }
};

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

        // Priority 1: Use user metadata country if logged in
        if (user?.user_metadata?.country) {
          const userCountry = user.user_metadata.country.toLowerCase();
          setCountry(userCountry);
          setIsLoading(false);
          return;
        }

        // Priority 2: Fetch country from IP (for non-logged-in users or users without country in metadata)
        const ipCountry = await fetchCountryFromIP();
        setCountry(ipCountry);
      } catch (error) {

        // Fallback to cookie or Nepal
        if (typeof window !== "undefined") {
          const cookieCountry = getCookie(IP_COUNTRY_COOKIE_NAME);
          setCountry(cookieCountry ? cookieCountry.toLowerCase() : "nepal");
        } else {
          setCountry("nepal");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCountry();

    // Listen for auth state changes
    const supabase = createSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user?.user_metadata?.country) {
        // User logged in with country in metadata
        setCountry(session.user.user_metadata.country.toLowerCase());
      } else if (session?.user) {
        // User logged in but no country in metadata, use IP country
        const ipCountry = await fetchCountryFromIP();
        setCountry(ipCountry);
      } else {
        // User logged out, use IP country
        const ipCountry = await fetchCountryFromIP();
        setCountry(ipCountry);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { country, isLoading };
};
