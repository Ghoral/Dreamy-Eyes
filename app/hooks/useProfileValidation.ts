"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";

export const useProfileValidation = () => {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const supabase = createSupabaseClient();

      // Check if user is authenticated
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsValidating(false);
        return;
      }

      // Check if profile is complete
      const { data: profileData } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("id", user.id)
        .single();

      const profileComplete = profileData?.profile_completed === true;
      setIsProfileComplete(profileComplete);

      // If profile is not complete, redirect to shipping address page
      if (!profileComplete) {
        router.push("/shipping-address");
        return;
      }

      setIsValidating(false);
    } catch (error) {
      console.error("Error checking profile completion:", error);
      setIsValidating(false);
    }
  };

  const redirectToProfileCompletion = () => {
    router.push("/shipping-address");
  };

  return {
    isValidating,
    isProfileComplete,
    redirectToProfileCompletion,
    checkProfileCompletion,
  };
};
