"use client";

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createSupabaseClient,
  supabaseBrowserClient,
} from "../services/supabase/client/supabaseBrowserClient";
import {
  generateUniqueCode,
  formatPriceWithCurrency,
  calculatePriceSync,
  formatPrice,
  calculateTotalPrice,
} from "../util";
import { useOfferStore } from "../store/offerStore";
import ModalOffers from "../components/modals/ModalOffers";
import { Offer } from "../context/CartContext";
import { useUserCountry } from "../hooks/useUserCountry";

// Helper function to calculate offer price (same logic as CartContext)
const calculateOfferPrice = (
  originalPrice: number,
  offer: Offer | null
): number => {
  if (!offer) {
    return originalPrice;
  }

  // Check if offer name/title suggests "free" (Buy X Get Y Free)
  const offerName = (offer.name || offer.title || "").toLowerCase();
  const isFreeOffer =
    offerName.includes("free") ||
    (offerName.includes("get") && offerName.includes("free"));

  // If offer has a fixed price, use that directly (including 0 for free items)
  if (offer.price !== undefined && offer.price !== null) {
    const fixedPrice = Number(offer.price);
    return fixedPrice;
  }

  // If it's a "free" offer and no price/discount is set, make it free
  if (
    isFreeOffer &&
    (offer.discount === undefined || offer.discount === null) &&
    (offer.discount_value === undefined || offer.discount_value === null)
  ) {
    return 0;
  }

  // If offer has discount field, use that
  if (offer.discount !== undefined && offer.discount !== null) {
    const discountType = offer.discount_type;
    const discountValue = Number(offer.discount);

    if (!discountType) {
      // If no discount type specified, assume percentage
      const percentageDiscount = (originalPrice * discountValue) / 100;
      const finalPrice = Math.max(0, originalPrice - percentageDiscount);
      return finalPrice;
    }

    switch (discountType.toLowerCase()) {
      case "percentage":
      case "percent": {
        const percentageDiscount = (originalPrice * discountValue) / 100;
        const finalPrice = Math.max(0, originalPrice - percentageDiscount);
        return finalPrice;
      }

      case "fixed":
      case "amount": {
        const finalPrice = Math.max(0, originalPrice - discountValue);
        return finalPrice;
      }

      case "free":
      case "zero":
        return 0;

      default: {
        const defaultPercentageDiscount = (originalPrice * discountValue) / 100;
        const finalPrice = Math.max(
          0,
          originalPrice - defaultPercentageDiscount
        );
        return finalPrice;
      }
    }
  }

  // Fallback to old discount_value field
  const discountType2 = offer.discount_type;
  const discountValue2 = offer.discount_value;

  if (discountValue2 !== undefined && discountValue2 !== null) {
    switch ((discountType2 || "").toLowerCase()) {
      case "percentage":
      case "percent": {
        const percentageDiscount =
          (originalPrice * Number(discountValue2)) / 100;
        const finalPrice = Math.max(0, originalPrice - percentageDiscount);
        return finalPrice;
      }

      case "fixed":
      case "amount": {
        const finalPrice = Math.max(0, originalPrice - Number(discountValue2));
        return finalPrice;
      }

      case "free":
      case "zero":
        return 0;

      default:
        // If no type specified, assume percentage
        const percentageDiscount =
          (originalPrice * Number(discountValue2)) / 100;
        const finalPrice = Math.max(0, originalPrice - percentageDiscount);
        return finalPrice;
    }
  }

  return originalPrice;
};

interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  user_id: string;
  created_at: string;
  is_primary: boolean;
}

export default function CheckoutPage() {
  const { state: cartState, clearCart, setOffer } = useCart();
  const {
    clearOffer,
    selectedOffer: zustandOffer,
    isOfferApplied: zustandIsOfferApplied,
  } = useOfferStore();
  const router = useRouter();
  const { country } = useUserCountry();
  const [isProcessing, setIsProcessing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash_on_delivery" | "pre_payment"
  >("cash_on_delivery");
  const [transactionId, setTransactionId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null
  );
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);

  useEffect(() => {
    loadUserAddresses();
    loadDeliveryCharge();
  }, []);

  const loadDeliveryCharge = async () => {
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await (supabase as any)
        .from("detail")
        .select("delivery_charge")
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (!error && data?.delivery_charge) {
        const charge = Number(data.delivery_charge);
        setDeliveryCharge(charge);
      } else {
        console.error("Error loading delivery charge:", error);
        // Default to 250 if not found
        setDeliveryCharge(250);
      }
    } catch (error) {
      console.error("Error loading delivery charge:", error);
      // Default to 250 on error
      setDeliveryCharge(250);
    }
  };

  const uploadScreenshotToStorage = async (
    file: File
  ): Promise<string | null> => {
    try {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const fileName = `payment-${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("payment")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        return null;
      }

      return data.path;
    } catch (error) {
      console.error("Error uploading screenshot:", error);
      return null;
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOfferSelect = (offer: Offer, selectedProducts: any[]) => {
    setOffer(offer, selectedProducts);
  };

  const loadUserAddresses = async () => {
    try {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Load only primary addresses
      const { data: addressesData } = await (supabase as any)
        .from("address")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_primary", true);

      if (addressesData && addressesData.length > 0) {
        setAddresses(addressesData as Address[]);
        // Select the primary address
        setSelectedAddressId(addressesData[0].id);
      } else {
        // If no primary address found, load all addresses as fallback
        const { data: allAddressesData } = await (supabase as any)
          .from("address")
          .select("*")
          .eq("user_id", user.id);

        if (allAddressesData && allAddressesData.length > 0) {
          setAddresses(allAddressesData as Address[]);
          setSelectedAddressId(allAddressesData[0].id);
        }
      }
    } catch (error) {
      setError("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId || selectedAddressId <= 0) {
      setError("Please select a shipping address");
      return;
    }

    // Validate pre-payment requirements
    if (paymentMethod === "pre_payment") {
      if (!transactionId.trim()) {
        setError("Transaction ID is required for pre-payment");
        return;
      }
      if (!paymentScreenshot) {
        setError("Payment screenshot is required for pre-payment");
        return;
      }
    }

    setIsProcessing(true);
    setError("");

    try {
      const supabase = createSupabaseClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const order_number = generateUniqueCode();

      // Upload screenshot if provided
      let paymentUrl: string | null = null;
      if (paymentMethod === "pre_payment" && paymentScreenshot) {
        paymentUrl = await uploadScreenshotToStorage(paymentScreenshot);
        if (!paymentUrl) {
          throw new Error("Failed to upload payment screenshot");
        }
      }

      // Prepare offer data (ready for backend support)
      const offerId = cartState.selectedOffer?.id || null;
      const offerProducts = cartState.offerSelectedProducts || [];

      // Create order
      // TODO: When backend supports offers, uncomment p_offer_id and p_offer_products
      const { data: orderData, error: orderError } =
        await supabaseBrowserClient.rpc("create_orders_and_update_stock", {
          p_address_id: selectedAddressId,
          p_order_number: order_number,
          p_items: cartState.items,
          p_payment_method: paymentMethod,
          p_transaction_id:
            paymentMethod === "pre_payment" ? transactionId : null,
          p_payment_url: paymentUrl,
          // p_offer_id: offerId,
          // p_offer_products: offerProducts.length > 0 ? offerProducts : null,
        });

      if (orderError) {
        const errorMessage =
          orderError.message ||
          orderError.details ||
          orderError.hint ||
          "Failed to create order";
        throw new Error(errorMessage);
      }

      // Clear cart and offer (reset after order completion)
      clearOffer(); // Clear offer first
      clearCart();
      // Set flag to clear offer on any quantity change after checkout
      if (typeof window !== "undefined") {
        localStorage.setItem("checkout_completed", "true");
      }
      // Redirect to success page
      router.push(`/checkout/success?order=${order_number}`);
    } catch (error: any) {
      console.error("Checkout error:", error);
      setError(error.message || "Failed to process order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600 text-lg">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
          <h1 className="text-3xl font-bold text-secondary-800 mb-4">
            Your cart is empty
          </h1>
          <p className="text-secondary-600 mb-8">
            Add some products to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-lg"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 pt-28 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-secondary-800 mb-4">
            Checkout
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            Complete your order and get ready for amazing contact lenses
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3 text-red-700">
              <svg
                className="w-6 h-6 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Checkout Form */}
          <div className="space-y-8">
            {/* Address Selection */}
            <div className="bg-white rounded-3xl shadow-soft p-8 border border-secondary-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-secondary-800">
                  Shipping Address
                </h2>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-secondary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-secondary-600 mb-4">
                    No shipping addresses found
                  </p>
                  <Link
                    href="/shipping-address"
                    className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors duration-300"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
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
                    Add New Address
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="relative">
                      <input
                        type="radio"
                        id={`address-${address.id}`}
                        name="addressSelection"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={(e) =>
                          setSelectedAddressId(Number(e.target.value))
                        }
                        className="sr-only"
                      />
                      <label
                        htmlFor={`address-${address.id}`}
                        className={`block p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          selectedAddressId === address.id
                            ? "border-primary-500 bg-primary-50 shadow-glow"
                            : "border-secondary-200 bg-white hover:border-primary-300 hover:shadow-soft"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm bg-primary-500"></div>
                              <span className="font-semibold text-secondary-800">
                                {address.street}
                              </span>
                            </div>
                            <p className="text-secondary-600 mb-1">
                              {address.city}, {address.state} {address.zip}
                            </p>
                            <p className="text-secondary-500">
                              {address.country}
                            </p>
                          </div>
                          {address.is_primary && (
                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Address Link */}
              <div className="text-center mt-6 pt-6 border-t border-secondary-100">
                <Link
                  href="/shipping-address"
                  className="inline-flex items-center px-6 py-3 bg-white border-2 border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400 font-semibold rounded-xl transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4 mr-2"
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
                  Add New Address
                </Link>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-3xl shadow-soft p-8 border border-secondary-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-secondary-800">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-4">
                {/* Cash on Delivery */}
                <div className="relative">
                  <input
                    type="radio"
                    id="cash_on_delivery"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === "cash_on_delivery"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as "cash_on_delivery")
                    }
                    className="sr-only"
                  />
                  <label
                    htmlFor="cash_on_delivery"
                    className={`block p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      paymentMethod === "cash_on_delivery"
                        ? "border-primary-500 bg-primary-50 shadow-glow"
                        : "border-secondary-200 bg-white hover:border-primary-300 hover:shadow-soft"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm bg-primary-500"></div>
                          <span className="font-semibold text-secondary-800">
                            Cash on Delivery
                          </span>
                        </div>
                        <p className="text-secondary-600 text-sm">
                          Pay with cash when your order is delivered. Delivery
                          charge of{" "}
                          {formatPrice(
                            calculatePriceSync(deliveryCharge, country),
                            country
                          )}{" "}
                          will be included.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Pre Payment */}
                <div className="relative">
                  <input
                    type="radio"
                    id="pre_payment"
                    name="paymentMethod"
                    value="pre_payment"
                    checked={paymentMethod === "pre_payment"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as "pre_payment")
                    }
                    className="sr-only"
                  />
                  <label
                    htmlFor="pre_payment"
                    className={`block p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      paymentMethod === "pre_payment"
                        ? "border-primary-500 bg-primary-50 shadow-glow"
                        : "border-secondary-200 bg-white hover:border-primary-300 hover:shadow-soft"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm bg-primary-500"></div>
                          <span className="font-semibold text-secondary-800">
                            Pre Payment
                          </span>
                        </div>
                        <p className="text-secondary-600 text-sm mb-4">
                          Pay in advance. Delivery charge of $
                          {formatPrice(
                            calculatePriceSync(deliveryCharge, country),
                            country
                          )}{" "}
                          will be included.
                        </p>

                        {paymentMethod === "pre_payment" && (
                          <div className="space-y-4 mt-4 pt-4 border-t border-secondary-200">
                            {/* Transaction ID */}
                            <div>
                              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                                Transaction ID{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={transactionId}
                                onChange={(e) =>
                                  setTransactionId(e.target.value)
                                }
                                placeholder="Enter your transaction ID"
                                className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                                required
                              />
                            </div>

                            {/* Screenshot Upload */}
                            <div>
                              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                                Payment Screenshot{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="space-y-3">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleScreenshotChange}
                                  className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                                  required
                                />
                                {screenshotPreview && (
                                  <div className="mt-3">
                                    <img
                                      src={screenshotPreview}
                                      alt="Payment screenshot preview"
                                      className="max-w-full h-48 object-contain border-2 border-secondary-200 rounded-xl"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-soft p-8 border border-secondary-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-secondary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-secondary-800">
                  Order Summary
                </h2>
              </div>

              {/* Stock Adjustment Warning */}
              {cartState.items.some(
                (item) => item.maxQuantity && item.quantity >= item.maxQuantity
              ) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3 text-amber-700">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      Some quantities have been adjusted to match available
                      stock
                    </span>
                  </div>
                </div>
              )}

              {/* Offer Items Section */}
              {(() => {
                const offer = cartState.selectedOffer || zustandOffer;
                if (
                  !offer ||
                  !cartState.offerSelectedProducts ||
                  cartState.offerSelectedProducts.length === 0
                ) {
                  return null;
                }

                // Create offer items array with full item details
                const offerItems = cartState.offerSelectedProducts
                  .map((offerItem) => {
                    const fullItem = cartState.items.find(
                      (item) =>
                        item.id === offerItem.id &&
                        item.color === offerItem.color
                    );
                    if (!fullItem) return null;
                    return {
                      ...fullItem,
                      quantity: offerItem.quantity, // Only the offer quantity
                    };
                  })
                  .filter(Boolean);

                if (offerItems.length === 0) return null;

                return (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-secondary-800">
                        Items with Offer
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsOffersModalOpen(true)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        Change Offer
                      </button>
                    </div>
                    {offerItems.map((item, index) => {
                      if (!item) return null;
                      const offerPrice = calculateOfferPrice(item.price, offer);

                      return (
                        <div
                          key={`offer-${index}`}
                          className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border-2 border-green-200"
                        >
                          {/* Item Image */}
                          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-primary-100 rounded-xl overflow-hidden flex-shrink-0">
                            {item.image ? (
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
                            <div className="text-sm text-secondary-500 mb-1">
                              Qty: {item.quantity} ×{" "}
                              {formatPriceWithCurrency(item.price, country)}
                            </div>
                            <div className="text-xs text-green-600 font-semibold mt-1">
                              Offer Applied
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-secondary-500 line-through">
                                {formatPrice(
                                  calculatePriceSync(
                                    item.price * item.quantity,
                                    country
                                  ),
                                  country
                                )}
                              </span>
                              <span className="text-lg font-bold text-green-600">
                                {formatPrice(
                                  calculatePriceSync(
                                    offerPrice * item.quantity,
                                    country
                                  ),
                                  country
                                )}
                              </span>
                              <span className="text-xs text-green-600 font-semibold">
                                Save:{" "}
                                {formatPrice(
                                  calculatePriceSync(
                                    (item.price - offerPrice) * item.quantity,
                                    country
                                  ),
                                  country
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Offers Modal */}
                          <ModalOffers
                            isOpen={isOffersModalOpen}
                            onClose={() => setIsOffersModalOpen(false)}
                            onSelectOffer={handleOfferSelect}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Regular Cart Items */}
              <div className="space-y-4 mb-6">
                {(() => {
                  // Create a map of offer quantities
                  const offerProductMap = new Map<string, number>();
                  cartState.offerSelectedProducts?.forEach((offerProduct) => {
                    const key = `${offerProduct.id}-${
                      offerProduct.color || ""
                    }`;
                    offerProductMap.set(key, offerProduct.quantity);
                  });

                  // Filter and map regular items (excluding offer quantities)
                  const regularItems = cartState.items
                    .map((item) => {
                      const key = `${item.id}-${item.color || ""}`;
                      const offerQuantity = offerProductMap.get(key) || 0;
                      const regularQuantity = item.quantity - offerQuantity;

                      if (regularQuantity <= 0) return null;

                      return {
                        ...item,
                        quantity: regularQuantity,
                      };
                    })
                    .filter(Boolean);

                  if (regularItems.length === 0) return null;

                  return (
                    <>
                      <h3 className="text-xl font-bold text-secondary-800 mb-4">
                        Regular Items
                      </h3>
                      {regularItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-4 p-4 bg-secondary-50 rounded-xl"
                        >
                          {/* Item Image */}
                          <div className="w-16 h-16 bg-gradient-to-br from-secondary-100 to-primary-100 rounded-xl overflow-hidden flex-shrink-0">
                            {item.image ? (
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
                            <div className="text-sm text-secondary-500 mb-1">
                              Qty: {item.quantity} × ${item.price}
                            </div>
                            {item.maxQuantity && (
                              <div className="text-sm text-secondary-500">
                                Stock: {item.maxQuantity} available
                                {item.quantity >= item.maxQuantity && (
                                  <span className="text-amber-600 ml-2 font-medium">
                                    Max quantity reached
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <span className="text-lg font-bold text-primary-600">
                              {formatPrice(
                                calculatePriceSync(
                                  item.price * item.quantity,
                                  country
                                ),
                                country
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>

              {/* Order Totals */}
              <div className="border-t border-secondary-100 pt-6 space-y-3">
                {(() => {
                  // Calculate original total (without offer discounts)
                  const originalTotal = cartState.items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  );

                  // Check if offer criteria is still met
                  const offer = cartState.selectedOffer || zustandOffer;
                  let hasOffer = false;

                  if (
                    offer &&
                    cartState.offerSelectedProducts &&
                    cartState.offerSelectedProducts.length > 0
                  ) {
                    // Check if offer criteria is met
                    const offerValue =
                      offer.value !== undefined && offer.value !== null
                        ? Number(offer.value)
                        : offer.minimum_quantity || 0;
                    const minimumValue = offer.minimum_value
                      ? Number(offer.minimum_value)
                      : 0;

                    const totalQuantity = cartState.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );
                    const totalPrice = cartState.items.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    );

                    // Check if criteria is met: quantity >= value OR price >= minimum_value
                    const meetsQuantityRequirement =
                      offerValue > 0 ? totalQuantity >= offerValue : true;
                    const meetsPriceRequirement =
                      minimumValue > 0 ? totalPrice >= minimumValue : true;
                    const criteriaMet =
                      meetsQuantityRequirement && meetsPriceRequirement;

                    hasOffer = criteriaMet;
                  }

                  // Calculate offer savings: items in offerSelectedProducts are FREE (price = 0)
                  // So we subtract the full original price of those items
                  let offerSavings = 0;
                  let totalOfferPriceToSubtract = 0;

                  if (hasOffer && offer) {
                    cartState.offerSelectedProducts.forEach((offerItem) => {
                      const originalItem = cartState.items.find(
                        (item) =>
                          item.id === offerItem.id &&
                          item.color === offerItem.color
                      );
                      if (originalItem) {
                        // Items selected for offer should be FREE (price = 0)
                        const offerPrice = 0;
                        const savingsPerItem = originalItem.price - offerPrice;
                        offerSavings += savingsPerItem * offerItem.quantity;
                        // Total to subtract = original price of offer items (since they're free)
                        totalOfferPriceToSubtract +=
                          originalItem.price * offerItem.quantity;
                      }
                    });
                  }

                  // Final total = Original total - (original price of offer items) + delivery
                  // Since offer items are free, we subtract their full original price
                  const finalTotal =
                    originalTotal - totalOfferPriceToSubtract + deliveryCharge;

                  return (
                    <>
                      {hasOffer && offerSavings > 0 && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-semibold">
                              Offer Savings:
                            </span>
                            <span className="font-bold text-green-600 text-lg">
                              -
                              {formatPrice(
                                calculatePriceSync(offerSavings, country),
                                country
                              )}
                            </span>
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Offer applied to selected items
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-secondary-600">Subtotal:</span>
                        <span className="font-semibold text-secondary-800">
                          {formatPrice(
                            calculatePriceSync(originalTotal, country),
                            country
                          )}
                        </span>
                      </div>
                      {hasOffer && offerSavings > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-secondary-600">
                            Offer Discount:
                          </span>
                          <span className="font-semibold text-green-600">
                            -
                            {formatPrice(
                              calculatePriceSync(offerSavings, country),
                              country
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-secondary-600">
                          Delivery Charge:
                        </span>
                        <span className="font-semibold text-secondary-800">
                          {formatPrice(
                            calculatePriceSync(deliveryCharge, country),
                            country
                          )}
                        </span>
                      </div>
                      <div className="border-t border-secondary-100 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-secondary-800">
                            Total:
                          </span>
                          <span className="text-2xl font-bold text-primary-600">
                            {formatPrice(
                              calculatePriceSync(finalTotal, country),
                              country
                            )}
                          </span>
                        </div>
                        {hasOffer && offerSavings > 0 && (
                          <div className="mt-2 text-right">
                            <span className="text-sm text-green-600 font-semibold">
                              You saved{" "}
                              {formatPrice(
                                calculatePriceSync(offerSavings, country),
                                country
                              )}{" "}
                              with this offer!
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Complete Order Button */}
              <form onSubmit={handleSubmit} className="mt-8">
                <button
                  type="submit"
                  disabled={isProcessing || !selectedAddressId}
                  className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    isProcessing || !selectedAddressId
                      ? "bg-secondary-300 text-secondary-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-glow hover:shadow-glow-lg"
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Order...</span>
                    </div>
                  ) : (
                    (() => {
                      const originalTotal = cartState.items.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      );

                      // Calculate total offer price to subtract: (offer price * quantity) for offer items
                      let totalOfferPrice = 0;
                      if (
                        cartState.selectedOffer &&
                        cartState.offerSelectedProducts &&
                        cartState.offerSelectedProducts.length > 0
                      ) {
                        cartState.offerSelectedProducts.forEach((offerItem) => {
                          const originalItem = cartState.items.find(
                            (item) =>
                              item.id === offerItem.id &&
                              item.color === offerItem.color
                          );
                          if (originalItem) {
                            // Items selected for offer should be FREE (price = 0)
                            const offerPrice = 0;
                            // Total offer price = offer price * quantity (this is what we subtract from total)
                            totalOfferPrice += offerPrice * offerItem.quantity;
                          }
                        });
                      }

                      // Final total = Original total - (offer price * quantity) + delivery
                      const finalTotal =
                        originalTotal - totalOfferPrice + deliveryCharge;
                      return `Complete Order - ${formatPrice(
                        calculatePriceSync(finalTotal, country),
                        country
                      )}`;
                    })()
                  )}
                </button>
              </form>

              {/* Security Info */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-6 text-secondary-500">
                  <div className="flex items-center space-x-2">
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="text-sm">Secure Order</span>
                  </div>
                  <div className="flex items-center space-x-2">
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="text-sm">SSL Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offers Modal */}
      <ModalOffers
        isOpen={isOffersModalOpen}
        onClose={() => setIsOffersModalOpen(false)}
        onSelectOffer={handleOfferSelect}
      />
    </div>
  );
}
