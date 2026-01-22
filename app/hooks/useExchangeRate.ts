"use client";

import { useEffect } from "react";
import { fetchExchangeRate } from "../util";

// Hook to pre-fetch exchange rate on mount
export const useExchangeRate = () => {
  useEffect(() => {
    // Pre-fetch exchange rate to populate cache
    fetchExchangeRate();
  }, []);
};

