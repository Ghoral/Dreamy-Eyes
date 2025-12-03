import React, { useCallback, useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { update_product_quantity } from "../../api/quantity";
import { useOfferStore } from "../../store/offerStore";

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

  // Fallback to NEXT_PUBLIC_IMAGE_URL if available (for backward compatibility)
  if (process.env.NEXT_PUBLIC_IMAGE_URL) {
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/product-image/${filename}`;
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
  const { state: cartItems, removeItem, updateQuantity } = useCart();
  const router = useRouter();
  const { selectedOffer, isOfferApplied, clearOffer } = useOfferStore();
  const [checkingQuantities, setCheckingQuantities] = useState<
    Record<string, boolean>
  >({});
  const [quantityErrors, setQuantityErrors] = useState<Record<string, string>>(
    {}
  );

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
    onClose?.();
    router.push("/checkout");
  }, [onClose, router]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Your Cart</h2>
                  <p className="text-primary-100 text-sm">Manage your items</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                  {cartItems.totalItems} items
                </span>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
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
          </div>

          {/* Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {cartItems.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-secondary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-secondary-600 mb-6">
                  Start shopping to add items to your cart
                </p>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-lg"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.items.map((item, index) => (
                  <div
                    key={`${item.id}-${item.color}`}
                    className="bg-white border border-secondary-200 rounded-2xl p-4 hover:shadow-soft transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Item Image */}
                      <div className="w-20 h-20 bg-gradient-to-br from-secondary-50 to-primary-50 rounded-xl overflow-hidden flex-shrink-0">
                        {item.primary_thumbnail ? (
                          <img
                            src={getProductImageUrl(item.primary_thumbnail)}
                            alt={item.title}
                            className="w-full h-full object-contain"
                          />
                        ) : item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-secondary-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-secondary-800 text-lg mb-1 truncate">
                          {item.title}
                        </h4>
                        {item.color && (
                          <div className="flex items-center space-x-2 mb-2">
                            <div
                              className="w-4 h-4 rounded-full border border-white shadow-sm"
                              style={{
                                backgroundColor: item.colorHex || "#ccc",
                              }}
                            />
                            <span className="text-sm text-secondary-600">
                              {item.color}
                            </span>
                          </div>
                        )}
                        <div className="text-secondary-600 text-sm mb-3 line-clamp-2">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: item.description ?? "",
                            }}
                          />
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-primary-600">
                            ${item.price}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={async () => {
                                // Clear offer if checkout was completed (after any quantity change)
                                if (typeof window !== "undefined") {
                                  const checkoutCompleted =
                                    localStorage.getItem("checkout_completed");
                                  if (checkoutCompleted === "true") {
                                    clearOffer();
                                    localStorage.removeItem(
                                      "checkout_completed"
                                    );
                                  }
                                }

                                const newQuantity = Math.max(
                                  1,
                                  item.quantity - 1
                                );
                                const itemKey = `${item.id}-${item.color}`;

                                setCheckingQuantities((prev) => ({
                                  ...prev,
                                  [itemKey]: true,
                                }));
                                setQuantityErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors[itemKey];
                                  return newErrors;
                                });

                                try {
                                  if (
                                    item.colorHex &&
                                    typeof item.id === "string"
                                  ) {
                                    // Call RPC to validate and update quantity
                                    const result =
                                      await update_product_quantity(
                                        item.id,
                                        item.colorHex,
                                        newQuantity
                                      );

                                    if (result.success) {
                                      // Use validated quantity from RPC response
                                      updateQuantity(
                                        item.id,
                                        result.validated_quantity ||
                                          newQuantity,
                                        item.color
                                      );
                                    } else {
                                      setQuantityErrors((prev) => ({
                                        ...prev,
                                        [itemKey]:
                                          result.message ||
                                          "Quantity not available",
                                      }));
                                      if (result.available_quantity > 0) {
                                        updateQuantity(
                                          item.id,
                                          result.available_quantity,
                                          item.color
                                        );
                                      }
                                    }
                                  } else {
                                    updateQuantity(
                                      item.id,
                                      newQuantity,
                                      item.color
                                    );
                                  }
                                } catch (error: any) {
                                  console.error(
                                    "Error updating quantity:",
                                    error
                                  );
                                  setQuantityErrors((prev) => ({
                                    ...prev,
                                    [itemKey]:
                                      error.message ||
                                      "Failed to update quantity",
                                  }));
                                } finally {
                                  setCheckingQuantities((prev) => ({
                                    ...prev,
                                    [itemKey]: false,
                                  }));
                                }
                              }}
                              disabled={
                                checkingQuantities[
                                  `${item.id}-${item.color}`
                                ] || item.quantity <= 1
                              }
                              className="w-8 h-8 bg-secondary-100 hover:bg-secondary-200 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {checkingQuantities[
                                `${item.id}-${item.color}`
                              ] ? (
                                <div className="w-4 h-4 border-2 border-secondary-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg
                                  className="w-4 h-4 text-secondary-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 12H4"
                                  />
                                </svg>
                              )}
                            </button>
                            <span className="w-12 text-center font-semibold text-secondary-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={async () => {
                                // Clear offer if checkout was completed (after any quantity change)
                                if (typeof window !== "undefined") {
                                  const checkoutCompleted =
                                    localStorage.getItem("checkout_completed");
                                  if (checkoutCompleted === "true") {
                                    clearOffer();
                                    localStorage.removeItem(
                                      "checkout_completed"
                                    );
                                  }
                                }

                                const newQuantity = Math.min(
                                  item.maxQuantity || 999,
                                  item.quantity + 1
                                );
                                const itemKey = `${item.id}-${item.color}`;

                                setCheckingQuantities((prev) => ({
                                  ...prev,
                                  [itemKey]: true,
                                }));
                                setQuantityErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors[itemKey];
                                  return newErrors;
                                });

                                try {
                                  if (
                                    item.colorHex &&
                                    typeof item.id === "string"
                                  ) {
                                    // Call RPC to validate and update quantity
                                    const result =
                                      await update_product_quantity(
                                        item.id,
                                        item.colorHex,
                                        newQuantity
                                      );

                                    if (result.success) {
                                      // Use validated quantity from RPC response
                                      updateQuantity(
                                        item.id,
                                        result.validated_quantity ||
                                          newQuantity,
                                        item.color
                                      );
                                    } else {
                                      setQuantityErrors((prev) => ({
                                        ...prev,
                                        [itemKey]:
                                          result.message ||
                                          "Quantity not available",
                                      }));
                                      if (result.available_quantity > 0) {
                                        updateQuantity(
                                          item.id,
                                          result.available_quantity,
                                          item.color
                                        );
                                      }
                                    }
                                  } else {
                                    updateQuantity(
                                      item.id,
                                      newQuantity,
                                      item.color
                                    );
                                  }
                                } catch (error: any) {
                                  console.error(
                                    "Error updating quantity:",
                                    error
                                  );
                                  setQuantityErrors((prev) => ({
                                    ...prev,
                                    [itemKey]:
                                      error.message ||
                                      "Failed to update quantity",
                                  }));
                                } finally {
                                  setCheckingQuantities((prev) => ({
                                    ...prev,
                                    [itemKey]: false,
                                  }));
                                }
                              }}
                              disabled={
                                item.quantity >= (item.maxQuantity || 999) ||
                                checkingQuantities[`${item.id}-${item.color}`]
                              }
                              className="w-8 h-8 bg-secondary-100 hover:bg-secondary-200 disabled:bg-secondary-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors duration-200"
                            >
                              {checkingQuantities[
                                `${item.id}-${item.color}`
                              ] ? (
                                <div className="w-4 h-4 border-2 border-secondary-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg
                                  className="w-4 h-4 text-secondary-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                          {quantityErrors[`${item.id}-${item.color}`] && (
                            <div className="text-xs text-red-600 mt-1">
                              {quantityErrors[`${item.id}-${item.color}`]}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id, item.color)}
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.items.length > 0 && (
            <div className="border-t border-secondary-200 p-6 bg-secondary-50">
              {/* Total */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xl font-semibold text-secondary-800">
                  Total:
                </span>
                <span className="text-3xl font-bold text-primary-600">
                  ${cartItems.totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleViewCart}
                  className="w-full py-3 px-6 bg-white border-2 border-secondary-300 text-secondary-700 hover:bg-secondary-50 hover:border-secondary-400 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  View Full Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-lg"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ModalCart;
