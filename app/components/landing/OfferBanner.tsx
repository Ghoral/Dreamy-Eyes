"use client";

import { useEffect, useState } from "react";
import { useOfferStore } from "../../store/offerStore";
import { useCart } from "../../context/CartContext";
import { createSupabaseClient } from "../../services/supabase/client/supabaseBrowserClient";
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
  const {
    selectedOffer,
    offerSelectedProducts,
    isOfferApplied,
    clearOffer,
    _hasHydrated,
  } = useOfferStore();
  const { state: cartState } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check authentication status
  useEffect(() => {
    if (!isMounted) return;

    const checkAuthStatus = async () => {
      try {
        const supabase = createSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();

    // Set up auth state change listener
    const supabase = createSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isMounted]);

  // Show banner only if user is authenticated, offer is applied, selected, cart has items, and store has hydrated
  if (
    !isMounted ||
    !isAuthenticated ||
    !_hasHydrated ||
    !isOfferApplied ||
    !selectedOffer ||
    cartState.items.length === 0
  ) {
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
            onClick={clearOffer}
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
