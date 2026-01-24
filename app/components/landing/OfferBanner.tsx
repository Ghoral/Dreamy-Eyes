"use client";

import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";

// Close icon SVG
const CloseIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const OfferBanner = () => {
  const { state: cartState, setOffer, removeItem, updateQuantity } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectedOffer = cartState.selectedOffer;
  const isOfferApplied = !!selectedOffer;
  const offerSelectedProducts = cartState.offerSelectedProducts || [];
  const offerAppliedCount = (cartState.offerItems || []).reduce(
    (sum, i) => sum + (i?.quantity || 0),
    0
  );

  // Show banner only if offer is applied, selected, and mounted
  if (!isMounted || !isOfferApplied || !selectedOffer) {
    return null;
  }

  const offerQuantity = selectedOffer.quantity
    ? Number(selectedOffer.quantity)
    : 0;
  const offerValue =
    selectedOffer.value !== undefined && selectedOffer.value !== null
      ? Number(selectedOffer.value)
      : selectedOffer.minimum_quantity || 0;

  return (
    <div className="fixed top-1/2 right-0 -translate-y-1/2 z-[45] bg-secondary-900 text-white shadow-2xl border-l border-y border-white/10 rounded-l-[32px] w-[320px] transition-all duration-500 transform translate-x-4 hover:translate-x-0">
      <div className="p-8 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

        {/* Close Button */}
        <button
          onClick={() => {
            if (offerSelectedProducts && offerSelectedProducts.length > 0) {
              offerSelectedProducts.forEach((offerItem) => {
                const cartItem = cartState.items.find(
                  (item) =>
                    item.id === offerItem.id && item.color === offerItem.color
                );

                if (cartItem) {
                  const offerQuantity = offerItem.quantity || 0;
                  const newQuantity = cartItem.quantity - offerQuantity;
                  if (newQuantity <= 0) {
                    removeItem(offerItem.id, offerItem.color);
                  } else {
                    updateQuantity(offerItem.id, newQuantity, offerItem.color);
                  }
                }
              });
            }
            setOffer(null, []);
          }}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 group"
          aria-label="Remove offer"
        >
          <svg
            className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-start gap-8 relative z-10">
          <div className="flex flex-col gap-2">
            <span className="text-primary-500 font-bold tracking-[0.4em] uppercase text-[9px]">Privilege Active</span>
            <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">
              {selectedOffer.name || selectedOffer.title || "Offer"}
            </h3>
          </div>

          <div className="w-full space-y-4">
            <div className="space-y-3">
              {offerValue > 0 && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">Goal</span>
                  <span className="text-xs font-bold text-white uppercase">Buy {offerValue} Items</span>
                </div>
              )}
              {offerQuantity > 0 && (
                <div className="flex items-center justify-between p-3 bg-primary-500 rounded-xl">
                  <span className="text-[9px] font-black tracking-widest text-white/70 uppercase">Benefit</span>
                  <span className="text-xs font-bold text-white uppercase">Get {offerQuantity} Free</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase">
                <span className="text-white/40">Status</span>
                <span className="text-primary-500">{offerAppliedCount} Applied</span>
              </div>

              {/* Animated Progress Bar Placeholder / Signature Line */}
              <div className="h-0.5 w-full bg-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary-500 w-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferBanner;
