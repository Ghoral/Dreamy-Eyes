"use client";

import { useEffect } from "react";
import { supabaseEvent$ } from "../interface";

export const GlobalSupabaseListenerWrapper = () => {
  useEffect(() => {
    const sub = supabaseEvent$.subscribe((event) => {
      if (event?.type === "ERROR") {
        if (event?.showSnackbar) {
          //   setCommonStore(
          //     showSnackbar({ message: event?.message ?? "", type: "error" })
          //   );
        }
        console.error(
          `[${event.context}] Supabase error:`,
          event.error?.message
        );
      }

      if (event?.type === "SUCCESS") {
        if (event?.showSnackbar) {
          //   setCommonStore(
          //     showSnackbar({ message: event?.message ?? "", type: "success" })
          //   );
        }
      }
    });

    return () => sub.unsubscribe();
  }, []);
  return <></>;
};
