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
    <div className="fixed top-20 left-0 right-0 z-[45] bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white shadow-lg border-b-2 border-primary-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Offer Badge */}
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
              <span className="text-xs font-bold tracking-wide">
                OFFER APPLIED
              </span>
            </div>

            {/* Offer Name */}
            <div className="flex-1">
              <h3 className="font-bold text-lg">
                {selectedOffer.name ||
                  selectedOffer.title ||
                  `Offer #${selectedOffer.id}`}
              </h3>
              <div className="flex items-center space-x-4 text-sm mt-1">
                {offerValue > 0 && (
                  <span className="flex items-center space-x-1">
                    <span>💰</span>
                    <span>Buy {offerValue} items</span>
                  </span>
                )}
                {offerQuantity > 0 && (
                  <span className="flex items-center space-x-1">
                    <span>🎁</span>
                    <span>Get {offerQuantity} with offer</span>
                  </span>
                )}
                {offerSelectedProducts.length > 0 && (
                  <span className="text-white/90">
                    •{" "}
                    {offerSelectedProducts.reduce(
                      (sum, p) => sum + p.quantity,
                      0
                    )}{" "}
                    item
                    {offerSelectedProducts.reduce(
                      (sum, p) => sum + p.quantity,
                      0
                    ) > 1
                      ? "s"
                      : ""}{" "}
                    selected
                  </span>
                )}
                {cartState.totalItems > offerQuantity && (
                  <span className="text-white/90">
                    • {cartState.totalItems - offerQuantity} at normal price
                  </span>
                )}
              </div>
            </div>
          </div>

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
            className="ml-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Remove offer"
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferBanner;
