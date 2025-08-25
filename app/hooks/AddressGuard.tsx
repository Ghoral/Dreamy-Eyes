"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";

const AUTH_FREE_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

export const AddressGuard = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAddresses = async () => {
      try {
        if (!pathname || AUTH_FREE_PATHS.has(pathname)) return;

        const supabase = createSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return; // Not logged in, let auth flow handle it

        const { data: addresses, error } = await (supabase as any)
          .from("address")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if (error) return;

        const hasAnyAddress = Array.isArray(addresses) && addresses.length > 0;

        if (!hasAnyAddress && pathname !== "/shipping-address") {
          router.replace("/shipping-address");
        }
      } catch (_) {
        // Silently ignore guard errors
      }
    };

    checkAddresses();
    // Re-check on path change
  }, [pathname, router]);

  return null;
};

export default AddressGuard;
