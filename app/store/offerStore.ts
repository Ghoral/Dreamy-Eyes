import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setOffer: (offer: Offer | null, selectedProducts: any[]) => void;
  clearOffer: () => void;
}

export const useOfferStore = create<OfferState>()(
  persist(
    (set) => ({
      selectedOffer: null,
      offerSelectedProducts: [],
      isOfferApplied: false,
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },
      setOffer: (offer, selectedProducts) => {
        set({
          selectedOffer: offer,
          offerSelectedProducts: selectedProducts,
          isOfferApplied: true,
        });
      },
      clearOffer: () => {
        set({
          selectedOffer: null,
          offerSelectedProducts: [],
          isOfferApplied: false,
        });
      },
    }),
    {
      name: "offer-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
