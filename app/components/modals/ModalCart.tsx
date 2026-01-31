import React, { useCallback, useState, useEffect, useRef } from "react";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { update_product_quantity } from "../../api/quantity";
import { useOfferStore } from "../../store/offerStore";
import { useUserCountry } from "../../hooks/useUserCountry";
import {
  formatPriceWithCurrency,
  calculatePriceSync,
  calculateTotalPrice,
  formatPrice,
} from "../../util";
import Toast from "../ui/Toast";

// Helper function to get Supabase public bucket URL for product images
const getProductImageUrl = (filename: string): string => {
  if (!filename) return "";

  // If it's already a full URL, return as is
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }

  // Construct Supabase public bucket URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/product-image/${filename}`;
  }

  // Last resort fallback
  return `/product-image/${filename}`;
};

const ModalCart = ({
  isOpen = false,
  onClose,
  onViewCart,
  onCheckout,
}: {
  isOpen: boolean;
  onClose: () => void;
  onViewCart: () => void;
  onCheckout: () => void;
}) => {
  const { state: cartItems, removeItem, updateQuantity, updateAccessoryQuantity, removeAccessoryItem } = useCart();
  const router = useRouter();
  const { selectedOffer, isOfferApplied, clearOffer } = useOfferStore();
  const { country } = useUserCountry();
  const [checkingQuantities, setCheckingQuantities] = useState<
    Record<string, boolean>
  >({});
  const [quantityErrors, setQuantityErrors] = useState<Record<string, string>>(
    {}
  );
  const [showOfferClearedToast, setShowOfferClearedToast] = useState(false);
  const prevCartLengthRef = useRef(cartItems.items.length);
  const prevOfferRef = useRef(selectedOffer);

  // Detect when cart is cleared due to offer
  useEffect(() => {
    if (
      prevOfferRef.current &&
      cartItems.items.length === 0 &&
      prevCartLengthRef.current > 0
    ) {
      clearOffer();
      setShowOfferClearedToast(true);
    }
    prevCartLengthRef.current = cartItems.items.length;
    prevOfferRef.current = selectedOffer;
  }, [cartItems.items.length, selectedOffer, clearOffer]);

  const handleBackdropClick = useCallback(
    (e: any) => {
      if (e.target === e.currentTarget) {
        onClose?.();
      }
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: any) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    },
    [onClose]
  );

  const handleViewCart = useCallback(() => {
    onViewCart?.();
    onClose?.();
  }, [onViewCart, onClose]);

  const handleCheckout = useCallback(() => {
    if (cartItems.items.length === 0) return;
    onClose?.();
    router.push("/checkout");
  }, [onClose, router, cartItems.items.length]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with extreme glass blur */}
      <div
        className="fixed inset-0 bg-secondary-900/60 backdrop-blur-xl z-40 transition-opacity duration-700"
        onClick={handleBackdropClick}
      />

      {/* Boutique Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className="bg-white rounded shadow-[0_40px_100px_rgba(0,0,0,0.2)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative border border-secondary-100 animate-in fade-in zoom-in duration-500">

          {/* Subtle Glows inside white modal */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-100/30 blur-[100px] pointer-events-none" />

          {/* Header */}
          <div className="p-8 pb-4 flex-shrink-0 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] mb-1">Your Selection</span>
                <h2 className="text-3xl font-black text-secondary-900 tracking-tighter">CART <span className="text-secondary-400 font-serif italic font-normal">COLLECTIVE</span></h2>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 bg-secondary-50 hover:bg-secondary-100 text-secondary-400 hover:text-secondary-900 rounded flex items-center justify-center transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[1px] w-full bg-secondary-100" />
          </div>

          {/* Offer Banner */}
          {isOfferApplied && selectedOffer && (
            <div className="mx-8 mb-4 bg-primary-50/50 border border-primary-100 rounded p-4 flex items-start gap-3 animate-in slide-in-from-top duration-700">
              <div className="w-8 h-8 rounded bg-primary-500 flex-shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(195,78,138,0.3)]">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest block mb-1">Vault Offer Active</span>
                <p className="text-[11px] text-secondary-600 font-medium leading-relaxed">
                  Modifying your collection will release the applied <span className="text-primary-600 font-bold">{selectedOffer.title || selectedOffer.name}</span> offer.
                </p>
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar relative z-10">
            {cartItems.items.length === 0 ? (
              <div className="py-20 flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-secondary-50 rounded flex items-center justify-center mb-6 relative group">
                  <div className="absolute inset-0 bg-primary-500/10 rounded blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                  <svg className="w-12 h-12 text-secondary-300 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-secondary-900 tracking-tight mb-2">COLLECTION IS EMPTY</h3>
                <p className="text-sm text-secondary-400 font-medium max-w-[200px]">Begin your vision journey today.</p>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {cartItems.items.map((item, index) => (
                  <div
                    key={`${item.id}-${item.color}`}
                    className="group relative bg-white border border-secondary-100 rounded p-4 flex gap-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:border-primary-100 transition-all duration-500"
                  >
                    {/* Item Image */}
                    <div className="w-24 h-24 bg-secondary-50 border border-secondary-100 rounded overflow-hidden flex-shrink-0 relative">
                      {item.image || item.primary_thumbnail ? (
                        <img
                          src={item.primary_thumbnail ? getProductImageUrl(item.primary_thumbnail) : item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary-100 opacity-20">
                          <svg className="w-8 h-8 text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-black text-secondary-900 leading-tight uppercase tracking-tight truncate max-w-[180px]">
                            {item.title}
                          </h4>
                          <span className="text-lg font-black text-secondary-900 tracking-tighter">
                            {formatPriceWithCurrency(item.price, country)}
                          </span>
                        </div>
                        {item.color && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-3 h-3 rounded-full border border-secondary-100 shadow-sm" style={{ backgroundColor: item.colorHex || "#ccc" }} />
                            <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">{item.color}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center bg-secondary-50 border border-secondary-100 rounded p-1 h-10">
                          <button
                            onClick={async () => {
                              if (typeof window !== "undefined") {
                                if (localStorage.getItem("checkout_completed") === "true") {
                                  clearOffer();
                                  localStorage.removeItem("checkout_completed");
                                }
                              }
                              const newQuantity = Math.max(1, item.quantity - 1);
                              const itemKey = `${item.id}-${item.color}`;
                              setCheckingQuantities(prev => ({ ...prev, [itemKey]: true }));
                              try {
                                if (item.category === "accessory") {
                                  updateAccessoryQuantity(item.id, newQuantity, item.color, item.type);
                                } else if (item.colorHex && typeof item.id === "string") {
                                  const result = await update_product_quantity(item.id, item.colorHex, newQuantity);
                                  if (result.success) updateQuantity(item.id, result.validated_quantity || newQuantity, item.color);
                                } else {
                                  updateQuantity(item.id, newQuantity, item.color);
                                }
                              } finally {
                                setCheckingQuantities(prev => ({ ...prev, [itemKey]: false }));
                              }
                            }}
                            disabled={item.quantity <= 1 || checkingQuantities[`${item.id}-${item.color}`]}
                            className="w-8 h-full flex items-center justify-center text-secondary-400 hover:text-secondary-900 disabled:opacity-30 transition-colors"
                          >
                            <span className="text-lg font-medium leading-none">—</span>
                          </button>
                          <div className="w-10 flex items-center justify-center relative">
                            {checkingQuantities[`${item.id}-${item.color}`] ? (
                              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <span className="text-sm font-black text-secondary-900">{item.quantity}</span>
                            )}
                          </div>
                          <button
                            onClick={async () => {
                              if (typeof window !== "undefined") {
                                if (localStorage.getItem("checkout_completed") === "true") {
                                  clearOffer();
                                  localStorage.removeItem("checkout_completed");
                                }
                              }
                              const newQuantity = Math.min(item.maxQuantity || 999, item.quantity + 1);
                              const itemKey = `${item.id}-${item.color}`;
                              setCheckingQuantities(prev => ({ ...prev, [itemKey]: true }));
                              try {
                                if (item.category === "accessory") {
                                  if (typeof window !== "undefined") {
                                    const { check_stock_availability_accessories } = await import("../../api/product");
                                    const check = await check_stock_availability_accessories(item.type || "", item.id, item.quantity + 1);
                                    if (!check.data) return;
                                  }
                                  updateAccessoryQuantity(item.id, newQuantity, item.color, item.type);
                                } else if (item.colorHex && typeof item.id === "string") {
                                  const result = await update_product_quantity(item.id, item.colorHex, newQuantity);
                                  if (result.success) updateQuantity(item.id, result.validated_quantity || newQuantity, item.color);
                                } else {
                                  updateQuantity(item.id, newQuantity, item.color);
                                }
                              } finally {
                                setCheckingQuantities(prev => ({ ...prev, [itemKey]: false }));
                              }
                            }}
                            disabled={item.quantity >= (item.maxQuantity || 999) || checkingQuantities[`${item.id}-${item.color}`]}
                            className="w-8 h-full flex items-center justify-center text-secondary-400 hover:text-secondary-900 disabled:opacity-30 transition-colors"
                          >
                            <span className="text-xl font-medium leading-none">+</span>
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            if (item.category === "accessory") {
                              removeAccessoryItem(item.id, item.color, item.type);
                            } else {
                              removeItem(item.id, item.color);
                            }
                          }}
                          className="text-[10px] font-black text-secondary-300 hover:text-red-500 uppercase tracking-widest transition-colors duration-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.items.length > 0 && (
            <div className="p-8 border-t border-secondary-100 bg-secondary-50 flex-shrink-0 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Global Subtotal</span>
                  <span className="text-3xl font-black text-secondary-900 tracking-tighter leading-none mt-1">
                    {formatPrice(calculatePriceSync(cartItems.totalPrice, country), country)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Order Secure</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={handleViewCart}
                  className="flex-1 py-5 px-8 bg-white border border-secondary-200 text-secondary-900 font-black text-[11px] uppercase tracking-[0.2em] rounded hover:bg-secondary-100 hover:border-secondary-300 transition-all duration-300"
                >
                  Inspect Full Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 py-5 px-8 bg-primary-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded shadow-[0_15px_30px_rgba(195,78,138,0.2)] hover:shadow-[0_20px_40px_rgba(195,78,138,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10">Confirm & Acquire</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message="Collection reset due to offer modification."
        type="info"
        isVisible={showOfferClearedToast}
        onClose={() => setShowOfferClearedToast(false)}
        duration={5000}
      />
    </>
  );
};

export default ModalCart;
