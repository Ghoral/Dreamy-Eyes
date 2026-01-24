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
          <div className="bg-secondary-900 p-8 text-white flex-shrink-0 relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-primary-500 font-bold tracking-[0.4em] uppercase text-[10px] mb-2 block">Exclusive Access</span>
                <h2 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">
                  OFFER <span className="text-secondary-400 font-serif italic font-normal">VAULT</span>
                </h2>
                <p className="text-secondary-400 text-[10px] font-medium tracking-widest uppercase mt-2">
                  Select a privilege to apply
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all duration-300 group"
              >
                <svg
                  className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
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
                      className={`relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-500 overflow-hidden ${isSelected
                        ? "border-green-500 bg-green-50/30 shadow-2xl"
                        : "border-secondary-50 bg-secondary-50 hover:border-primary-200"
                        }`}
                    >
                      <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                            <span className={`text-[10px] font-black tracking-[0.3em] uppercase ${isSelected ? 'text-green-600' : 'text-primary-500'}`}>Privilege #{offer.id}</span>
                            <h3 className="text-3xl font-black text-secondary-900 tracking-tighter uppercase leading-none">
                              {offer.name || offer.title || `Offer #${offer.id}`}
                            </h3>
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-600 rounded-full">
                              <span className="text-[8px] font-black tracking-widest text-white uppercase">SELECTED</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            </div>
                          )}
                        </div>

                        {offer.description && (
                          <p className="text-sm font-medium text-secondary-500 leading-relaxed uppercase tracking-wider">
                            {offer.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                          {offer.value !== undefined && offer.value !== null && (
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-secondary-100">
                              <span className="text-[10px] font-black tracking-widest text-secondary-400 uppercase">Requirement</span>
                              <span className="text-sm font-bold text-secondary-900 uppercase">Buy {Number(offer.value)} Items</span>
                            </div>
                          )}
                          {offer.quantity !== undefined && offer.quantity !== null && (
                            <div className={`flex items-center justify-between p-4 rounded-xl ${isSelected ? 'bg-green-600' : 'bg-primary-500'}`}>
                              <span className="text-[10px] font-black tracking-widest text-white/70 uppercase">Benefit</span>
                              <span className="text-sm font-bold text-white uppercase">Get {Number(offer.quantity)} Free</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Signature Animated Line */}
                      <div className="h-0.5 w-full bg-secondary-100 relative overflow-hidden mt-6">
                        <div className={`absolute inset-0 ${isSelected ? 'bg-green-500' : 'bg-primary-500'} transition-transform duration-700 ${isSelected ? 'translate-x-0' : '-translate-x-full'}`}></div>
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
          <div className="border-t border-secondary-100 p-8 bg-secondary-50 flex-shrink-0">
            <div className="flex flex-col gap-6">
              {localSelectedOffer && (
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-secondary-100">
                  <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                  <p className="text-[10px] font-black tracking-widest text-secondary-900 uppercase">
                    Ready to Claim: {localSelectedOffer.name || localSelectedOffer.title}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-8 py-4 bg-white border-2 border-secondary-200 text-secondary-900 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase hover:bg-secondary-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyOffer}
                  disabled={!localSelectedOffer}
                  className={`flex-1 px-8 py-4 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 ${localSelectedOffer
                    ? "bg-secondary-900 text-white hover:bg-primary-500 shadow-xl"
                    : "bg-secondary-100 text-secondary-300 cursor-not-allowed"
                    }`}
                >
                  Apply Privilege
                </button>
              </div>
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
