"use client";

import { useState, useEffect } from "react";
import { get_enabled_offers } from "@/app/api/offers";
import { useCart } from "@/app/context/CartContext";

interface Offer {
  id: number;
  title: string;
  description?: string;
  discount_type?: string;
  discount_value?: number;
  minimum_quantity?: number;
  minimum_value?: number;
  is_enabled: boolean;
  [key: string]: any;
}

interface ModalOffersProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOffer: (offer: Offer, selectedProducts: any[]) => void;
}

export default function ModalOffers({
  isOpen,
  onClose,
  onSelectOffer,
}: ModalOffersProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const { state: cartState } = useCart();

  useEffect(() => {
    if (isOpen) {
      fetchOffers();
    }
  }, [isOpen]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await get_enabled_offers();
      if (response.status && response.data) {
        setOffers(response.data);
        
        // Auto-select offer based on quantity if applicable
        if (response.data.length > 0 && cartState.items.length > 0) {
          const totalQuantity = cartState.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          
          // Find offer that matches quantity requirement
          const matchingOffer = response.data.find((offer) => {
            if (offer.minimum_quantity) {
              return totalQuantity >= offer.minimum_quantity;
            }
            if (offer.minimum_value) {
              return cartState.totalPrice >= offer.minimum_value;
            }
            return false;
          });
          
          if (matchingOffer) {
            setSelectedOffer(matchingOffer);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOffer = (offer: Offer) => {
    setSelectedOffer(offer);
  };

  const handleApplyOffer = () => {
    if (!selectedOffer) return;

    // Select products based on offer quantity requirement
    let selectedProducts: any[] = [];
    let remainingQuantity = selectedOffer.minimum_quantity || 0;

    for (const item of cartState.items) {
      if (remainingQuantity <= 0) break;
      
      const quantityToInclude = Math.min(item.quantity, remainingQuantity);
      selectedProducts.push({
        ...item,
        quantity: quantityToInclude,
      });
      remainingQuantity -= quantityToInclude;
    }

    onSelectOffer(selectedOffer, selectedProducts);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Available Offers</h2>
                <p className="text-primary-100 text-sm mt-1">
                  Select an offer to apply to your order
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
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
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-secondary-600">Loading offers...</p>
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-secondary-600">No offers available at this time</p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => {
                  const isSelected = selectedOffer?.id === offer.id;
                  const meetsRequirement =
                    (!offer.minimum_quantity ||
                      cartState.totalItems >= offer.minimum_quantity) &&
                    (!offer.minimum_value ||
                      cartState.totalPrice >= offer.minimum_value);

                  return (
                    <div
                      key={offer.id}
                      onClick={() => meetsRequirement && handleSelectOffer(offer)}
                      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary-500 bg-primary-50"
                          : meetsRequirement
                          ? "border-secondary-200 bg-white hover:border-primary-300 hover:shadow-soft"
                          : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-secondary-800 mb-2">
                            {offer.title}
                          </h3>
                          {offer.description && (
                            <p className="text-secondary-600 mb-3">
                              {offer.description}
                            </p>
                          )}
                          <div className="space-y-1 text-sm text-secondary-500">
                            {offer.minimum_quantity && (
                              <p>
                                Minimum quantity: {offer.minimum_quantity} items
                                {cartState.totalItems >= offer.minimum_quantity ? (
                                  <span className="text-green-600 ml-2">✓</span>
                                ) : (
                                  <span className="text-red-600 ml-2">
                                    (Need {offer.minimum_quantity - cartState.totalItems} more)
                                  </span>
                                )}
                              </p>
                            )}
                            {offer.minimum_value && (
                              <p>
                                Minimum value: ${offer.minimum_value}
                                {cartState.totalPrice >= offer.minimum_value ? (
                                  <span className="text-green-600 ml-2">✓</span>
                                ) : (
                                  <span className="text-red-600 ml-2">
                                    (Need ${(offer.minimum_value - cartState.totalPrice).toFixed(2)} more)
                                  </span>
                                )}
                              </p>
                            )}
                            {offer.discount_type && offer.discount_value && (
                              <p className="text-primary-600 font-semibold">
                                Discount: {offer.discount_type === "percentage" ? `${offer.discount_value}%` : `$${offer.discount_value}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          {isSelected ? (
                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-secondary-300 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-secondary-100 p-6 bg-secondary-50">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white border-2 border-secondary-200 text-secondary-700 rounded-xl font-semibold hover:bg-secondary-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyOffer}
                disabled={!selectedOffer}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedOffer
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-soft hover:shadow-glow"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Apply Offer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

