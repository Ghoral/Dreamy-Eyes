"use client";

import { useExchangeRate } from "../hooks/useExchangeRate";

export default function ExchangeRateLoader() {
  useExchangeRate();
  return null;
}




