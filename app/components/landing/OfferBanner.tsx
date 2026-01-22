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
    <div className="fixed top-1/2 right-0 -translate-y-1/2 z-[45] bg-gradient-to-b from-primary-500 via-primary-600 to-primary-700 text-white shadow-2xl border-l-2 border-y-2 border-primary-400 rounded-l-3xl w-[300px] transition-transform duration-300">
      <div className="p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            // Remove only offer items from cart
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
                    // Remove entire item if quantity becomes 0 or less
                    removeItem(offerItem.id, offerItem.color);
                  } else {
                    // Reduce quantity by offer quantity
                    updateQuantity(
                      offerItem.id,
                      newQuantity,
                      offerItem.color
                    );
                  }
                }
              });
            }

            // Clear offer from CartContext
            setOffer(null, []);
          }}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Remove offer"
        >
          <CloseIcon />
        </button>

        <div className="flex flex-col items-start gap-4 mt-2">
          {/* Offer Badge */}
          <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30">
            <span className="text-xs font-bold tracking-widest uppercase">
              OFFER APPLIED
            </span>
          </div>

          {/* Offer Name */}
          <div className="w-full">
            <h3 className="font-black text-2xl leading-tight mb-3">
              {selectedOffer.name ||
                selectedOffer.title ||
                `Offer #${selectedOffer.id}`}
            </h3>
            <div className="flex flex-col gap-2 text-sm text-white/90">
              {offerValue > 0 && (
                <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg">
                  <span className="text-lg">💰</span>
                  <span className="font-bold">Buy {offerValue} items</span>
                </div>
              )}
              {offerQuantity > 0 && (
                <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg">
                  <span className="text-lg">🎁</span>
                  <span className="font-bold">Get {offerQuantity} Free</span>
                </div>
              )}

              <div className="h-px bg-white/20 w-full my-2" />

              {offerAppliedCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  <span>{offerAppliedCount} item{offerAppliedCount > 1 ? "s" : ""} selected</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                <span>{Math.max(cartState.totalItems - offerAppliedCount, 0)} at normal price</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferBanner;
