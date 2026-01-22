"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { get_enabled_offers } from "@/app/api/offers";
import { useCart } from "@/app/context/CartContext";
import { useOfferStore } from "@/app/store/offerStore";
import Toast from "../ui/Toast";

interface Offer {
  id: number;
  name?: string; // Offer name
  title?: string; // Alternative to name
  description?: string;
  discount_type?: string;
  discount_value?: number;
  discount?: number; // New field: discount amount/percentage
  price?: number; // New field: fixed price for offer items
  minimum_quantity?: number;
  minimum_value?: number;
  value?: string | number; // Minimum items in cart required
  quantity?: string | number; // How many items can be included in offer
  is_enabled?: boolean;
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
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { state: cartState, clearCart } = useCart();
  const {
    selectedOffer: zustandOffer,
    offerSelectedProducts: zustandOfferProducts,
    setOffer: setOfferStore,
    isOfferApplied,
    clearOffer,
  } = useOfferStore();
  const [localSelectedOffer, setLocalSelectedOffer] = useState<Offer | null>(
    zustandOffer
  );
  const [hasAppliedOffer, setHasAppliedOffer] = useState(false);
  const hasClearedRef = useRef(false);
  const justAppliedRef = useRef(false);
  const [showWarningToast, setShowWarningToast] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOffer, setPendingOffer] = useState<Offer | null>(null);

  // Sync local state with Zustand store
  useEffect(() => {
    if (zustandOffer) {
      setLocalSelectedOffer(zustandOffer);
    }
  }, [zustandOffer]);

  useEffect(() => {
    if (isOpen) {
      fetchOffers();
      setHasAppliedOffer(isOfferApplied); // Track if offer was already applied when modal opens
      hasClearedRef.current = false; // Reset clear flag when modal opens
      justAppliedRef.current = false; // Reset just applied flag when modal opens
    } else if (!hasClearedRef.current && !justAppliedRef.current) {
      // When modal closes, only clear offer if user didn't apply offer in this session
      // Don't clear if justAppliedRef is true (user just applied an offer)
      const { offerSelectedProducts, isOfferApplied: storeIsOfferApplied } =
        useOfferStore.getState();
      const hasOfferItems =
        offerSelectedProducts && offerSelectedProducts.length > 0;

      // Only clear if:
      // 1. User didn't apply offer in this session (hasAppliedOffer is false)
      // 2. AND there are no offer items selected (hasOfferItems is false)
      // 3. AND the store doesn't have an offer applied
      if (!hasAppliedOffer && !hasOfferItems && !storeIsOfferApplied) {
        clearOffer();
        hasClearedRef.current = true; // Mark as cleared to prevent infinite loop
      }
    }
  }, [isOpen, hasAppliedOffer]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await get_enabled_offers();
      if (response.status && response.data) {
        setOffers(response.data);

        // If offer already applied, use that. 
        // If not, pre-select the first available offer if none is selected.
        if (zustandOffer) {
          setLocalSelectedOffer(zustandOffer);
        } else if (response.data.length > 0 && !localSelectedOffer) {
          setLocalSelectedOffer(response.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOffer = (offer: Offer) => {
    setLocalSelectedOffer(offer);
  };

  const handleApplyOffer = () => {
    if (!localSelectedOffer) return;

    // Check if there's already an offer applied and user is changing it
    const currentOffer = zustandOffer;
    if (currentOffer && currentOffer.id !== localSelectedOffer.id) {
      // User is changing the offer, show confirmation dialog
      setPendingOffer(localSelectedOffer);
      setShowConfirmDialog(true);
      return;
    }

    // No existing offer or same offer, proceed directly
    applyOffer(localSelectedOffer);
  };

  const applyOffer = (offer: Offer) => {
    if (!offer) return;

    // Select products based on offer quantity
    // value = buy X items (normal price) to qualify
    // quantity = get Y items with offer benefit
    // Example: value=2, quantity=1 means "buy 2 get 1" - buy 2 items normally, then 1 gets offer
    let selectedProducts: any[] = [];
    const offerBenefitQuantity = offer.quantity
      ? Number(offer.quantity)
      : offer.minimum_quantity || 0;
    let remainingBenefitQuantity = offerBenefitQuantity;

    // Select items up to the offer benefit quantity limit
    // Example: quantity=1 means only 1 item gets the benefit, rest are normal
    for (const item of cartState.items) {
      if (remainingBenefitQuantity <= 0) break;

      const quantityToInclude = Math.min(
        item.quantity,
        remainingBenefitQuantity
      );
      selectedProducts.push({
        ...item,
        quantity: quantityToInclude,
      });
      remainingBenefitQuantity -= quantityToInclude;
    }

    // Save to Zustand store (persists across sessions)
    setOfferStore(offer, selectedProducts);

    // Mark that offer was explicitly applied
    setHasAppliedOffer(true);
    justAppliedRef.current = true; // Mark that we just applied an offer

    // Also call the callback for CartContext compatibility
    onSelectOffer(offer, selectedProducts);

    // Show warning toast
    setShowWarningToast(true);

    // Close modal after a short delay to show the toast, then navigate to home
    setTimeout(() => {
      onClose();
      router.push("/");
    }, 100);
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
        <div className="bg-white rounded shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Available Offers</h2>
                <p className="text-primary-100 text-xs mt-1">
                  Select an offer to apply to your order
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded flex items-center justify-center transition-colors"
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
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-secondary-600">Loading offers...</p>
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-secondary-600">
                  No offers available at this time
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => {
                  const isSelected = localSelectedOffer?.id === offer.id;

                  return (
                    <div
                      key={offer.id}
                      onClick={() => handleSelectOffer(offer)}
                      className={`relative p-6 rounded border-2 cursor-pointer transition-all overflow-hidden transform hover:scale-[1.02] ${isSelected
                        ? "border-primary-500 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 shadow-xl ring-2 ring-primary-300"
                        : "border-secondary-200 bg-gradient-to-br from-white to-secondary-50 hover:border-primary-400 hover:shadow-lg"
                        }`}
                    >
                      {/* Offer Badge/Sticker - Top Right */}
                      {isSelected && (
                        <div className="absolute top-0 right-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white px-5 py-2 rounded shadow-xl transform rotate-3">
                          <div className="flex items-center space-x-1.5">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-xs font-extrabold tracking-wide">
                              SELECTED
                            </span>
                          </div>
                        </div>
                      )}
                      {!isSelected && (
                        <div className="absolute top-0 right-0 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white px-5 py-2 rounded shadow-lg transform rotate-3">
                          <span className="text-xs font-extrabold tracking-wide">
                            AVAILABLE
                          </span>
                        </div>
                      )}
                      {/* Offer Number Badge - Sticker Style */}
                      <div className="absolute top-4 left-4 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 text-white w-14 h-14 rounded flex items-center justify-center shadow-xl font-extrabold text-xl border-4 border-white transform -rotate-12 z-10">
                        #{offer.id}
                      </div>

                      <div className="flex items-start justify-between pt-2">
                        <div className="flex-1 ml-20">
                          <h3 className="text-2xl font-extrabold text-secondary-800 mb-2 mt-1">
                            {offer.name || offer.title || `Offer #${offer.id}`}
                          </h3>
                          {offer.description && (
                            <p className="text-secondary-600 mb-3">
                              {offer.description}
                            </p>
                          )}
                          <div className="space-y-2 text-sm">
                            {/* Show value (buy X items) */}
                            {offer.value !== undefined &&
                              offer.value !== null && (
                                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                                  <p className="text-secondary-700 font-medium text-sm">
                                    💰{" "}
                                    <strong>
                                      Buy {Number(offer.value)} items
                                    </strong>{" "}
                                    (at normal price) to qualify
                                    {cartState.totalItems >=
                                      Number(offer.value) ? (
                                      <span className="text-green-600 ml-2 font-bold">
                                        ✓ You qualify!
                                      </span>
                                    ) : (
                                      <span className="text-red-600 ml-2">
                                        (Add{" "}
                                        {Number(offer.value) -
                                          cartState.totalItems}{" "}
                                        more item
                                        {Number(offer.value) -
                                          cartState.totalItems >
                                          1
                                          ? "s"
                                          : ""}
                                        )
                                      </span>
                                    )}
                                  </p>
                                </div>
                              )}
                            {/* Show quantity (get Y items with offer) */}
                            {offer.quantity !== undefined &&
                              offer.quantity !== null && (
                                <div className="bg-primary-50 border border-primary-200 rounded p-3 mb-2">
                                  <p className="text-primary-700 font-semibold text-sm mb-1">
                                    🎁{" "}
                                    <strong>
                                      Get {Number(offer.quantity)} item
                                      {Number(offer.quantity) > 1
                                        ? "s"
                                        : ""}{" "}
                                      with offer benefit
                                    </strong>
                                  </p>
                                  {cartState.totalItems >
                                    Number(offer.quantity) ? (
                                    <div className="bg-amber-50 border border-amber-200 rounded p-2 mt-2">
                                      <p className="text-xs text-amber-800">
                                        📊{" "}
                                        <strong>
                                          You have {cartState.totalItems} items
                                          in cart.
                                        </strong>
                                        <br />•{" "}
                                        <strong>
                                          {Number(offer.quantity)} item
                                          {Number(offer.quantity) > 1
                                            ? "s"
                                            : ""}
                                        </strong>{" "}
                                        → Get offer benefit
                                        <br />• Remaining{" "}
                                        <strong>
                                          {cartState.totalItems -
                                            Number(offer.quantity)}{" "}
                                          items
                                        </strong>{" "}
                                        → Normal price
                                      </p>
                                    </div>
                                  ) : cartState.totalItems ===
                                    Number(offer.quantity) ? (
                                    <p className="text-xs text-secondary-600 mt-1">
                                      All {cartState.totalItems} item
                                      {Number(offer.quantity) > 1
                                        ? "s"
                                        : ""}{" "}
                                      will receive the offer benefit.
                                    </p>
                                  ) : (
                                    <p className="text-xs text-secondary-600 mt-1">
                                      When you apply this offer,{" "}
                                      {Number(offer.quantity)} item
                                      {Number(offer.quantity) > 1
                                        ? "s"
                                        : ""}{" "}
                                      will get the benefit.
                                    </p>
                                  )}
                                </div>
                              )}
                            {/* Fallback to minimum_quantity for backward compatibility */}
                            {!offer.value && offer.minimum_quantity && (
                              <p>
                                Minimum quantity: {offer.minimum_quantity} items
                                {cartState.totalItems >=
                                  offer.minimum_quantity ? (
                                  <span className="text-green-600 ml-2">✓</span>
                                ) : (
                                  <span className="text-red-600 ml-2">
                                    (Need{" "}
                                    {offer.minimum_quantity -
                                      cartState.totalItems}{" "}
                                    more)
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
                                    (Need $
                                    {(
                                      offer.minimum_value - cartState.totalPrice
                                    ).toFixed(2)}{" "}
                                    more)
                                  </span>
                                )}
                              </p>
                            )}
                            {offer.discount_type && offer.discount_value && (
                              <p className="text-primary-600 font-semibold">
                                Benefit:{" "}
                                {offer.discount_type === "percentage"
                                  ? `${offer.discount_value}%`
                                  : `$${offer.discount_value}`}
                              </p>
                            )}
                          </div>
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
            {/* Info Note */}
            {localSelectedOffer && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded p-3">
                <p className="text-sm text-amber-800 font-medium mb-2">
                  📋 <strong>How this offer works:</strong>
                </p>
                <div className="text-xs text-amber-700 space-y-1">
                  {localSelectedOffer.value && localSelectedOffer.quantity ? (
                    <>
                      <p>
                        •{" "}
                        <strong>
                          Buy {Number(localSelectedOffer.value)} items
                        </strong>{" "}
                        at normal price to qualify
                      </p>
                      <p>
                        •{" "}
                        <strong>
                          Get {Number(localSelectedOffer.quantity)} item
                          {Number(localSelectedOffer.quantity) > 1 ? "s" : ""}
                        </strong>{" "}
                        with offer benefit
                      </p>
                      {cartState.totalItems >
                        Number(localSelectedOffer.quantity) && (
                          <p>
                            •{" "}
                            <strong>
                              Remaining{" "}
                              {cartState.totalItems -
                                Number(localSelectedOffer.quantity)}{" "}
                              items
                            </strong>{" "}
                            → Normal price
                          </p>
                        )}
                      <p className="text-amber-600 mt-2 italic">
                        Example: Buy {Number(localSelectedOffer.value)} get{" "}
                        {Number(localSelectedOffer.quantity)} → You have{" "}
                        {cartState.totalItems} items,{" "}
                        {Number(localSelectedOffer.quantity)} get offer, rest
                        are normal price
                      </p>
                    </>
                  ) : localSelectedOffer.quantity &&
                    cartState.totalItems >
                    Number(localSelectedOffer.quantity) ? (
                    <>
                      <p>
                        •{" "}
                        <strong>
                          {Number(localSelectedOffer.quantity)} item
                          {Number(localSelectedOffer.quantity) > 1 ? "s" : ""}
                        </strong>{" "}
                        → Will receive offer benefit
                      </p>
                      <p>
                        •{" "}
                        <strong>
                          Remaining{" "}
                          {cartState.totalItems -
                            Number(localSelectedOffer.quantity)}{" "}
                          items
                        </strong>{" "}
                        → Will be charged at normal price
                      </p>
                    </>
                  ) : (
                    <p>
                      •{" "}
                      {Number(localSelectedOffer.quantity) ||
                        cartState.totalItems}{" "}
                      item
                      {Number(localSelectedOffer.quantity) > 1 ||
                        cartState.totalItems > 1
                        ? "s"
                        : ""}{" "}
                      in your cart will receive the offer benefit
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer with buttons */}
          <div className="border-t border-secondary-200 p-4 bg-secondary-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white border-2 border-secondary-200 text-secondary-700 rounded text-sm font-semibold hover:bg-secondary-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyOffer}
                disabled={!localSelectedOffer}
                className={`px-4 py-2 rounded text-sm font-semibold transition-all ${localSelectedOffer
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-soft hover:shadow-glow"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Apply Offer
              </button>
            </div>
          </div>
        </div>
      </div >

      {/* Warning Toast when offer is applied */}
      < Toast
        message="Offer applied! Note: If you remove or decrease any item quantity, your cart will be cleared."
        type="info"
        isVisible={showWarningToast}
        onClose={() => setShowWarningToast(false)
        }
        duration={6000}
      />

      {/* Confirmation Dialog for changing offer */}
      {
        showConfirmDialog && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setShowConfirmDialog(false)}
            />
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div className="bg-white rounded shadow-2xl max-w-md w-full p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 rounded flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-secondary-800 mb-2">
                      Change Offer?
                    </h3>
                    <p className="text-secondary-600 mb-4">
                      You already have an offer applied. Changing to a new offer
                      will <strong>clear your entire cart</strong>. Are you sure
                      you want to continue?
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowConfirmDialog(false);
                          setPendingOffer(null);
                        }}
                        className="flex-1 px-4 py-2 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (pendingOffer) {
                            // Clear cart and offer first
                            clearCart();
                            clearOffer();
                            // Then apply the new offer (with empty selectedProducts since cart is cleared)
                            setOfferStore(pendingOffer, []);
                            onSelectOffer(pendingOffer, []);
                            setHasAppliedOffer(true);
                            justAppliedRef.current = true;
                            // Show warning toast
                            setShowWarningToast(true);
                            // Close dialogs and navigate
                            setShowConfirmDialog(false);
                            setPendingOffer(null);
                            onClose();
                            setTimeout(() => {
                              router.push("/");
                            }, 100);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-semibold transition-colors"
                      >
                        Yes, Clear Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      }
    </>
  );
}
