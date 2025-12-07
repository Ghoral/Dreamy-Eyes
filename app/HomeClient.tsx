"use client";

import { useEffect, useState } from "react";
import { useOfferStore } from "./store/offerStore";

export default function HomeClient({ children }: { children: React.ReactNode }) {
  const { isOfferApplied, _hasHydrated } = useOfferStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Wait for hydration before using offer state
  const showOfferBanner = mounted && _hasHydrated && isOfferApplied;
  
  return (
    <main className={showOfferBanner ? "pt-36" : "pt-20"}>
      {children}
    </main>
  );
}

