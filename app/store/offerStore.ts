import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Offer {
  id: number;
  name?: string;
  title?: string;
  value?: string | number; // Buy X items (normal price)
  quantity?: string | number; // Get Y items with offer benefit
  [key: string]: any;
}

interface OfferState {
  selectedOffer: Offer | null;
  offerSelectedProducts: any[];
  isOfferApplied: boolean;
  setOffer: (offer: Offer | null, selectedProducts: any[]) => void;
  clearOffer: () => void;
}

export const useOfferStore = create<OfferState>()(
  persist(
    (set) => ({
      selectedOffer: null,
      offerSelectedProducts: [],
      isOfferApplied: false,
      setOffer: (offer, selectedProducts) =>
        set({
          selectedOffer: offer,
          offerSelectedProducts: selectedProducts,
          isOfferApplied: true,
        }),
      clearOffer: () =>
        set({
          selectedOffer: null,
          offerSelectedProducts: [],
          isOfferApplied: false,
        }),
    }),
    {
      name: "offer-storage",
    }
  )
);

