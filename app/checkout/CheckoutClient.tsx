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
  fetchExchangeRate,
} from "../util";
import { useOfferStore } from "../store/offerStore";
import ModalOffers from "../components/modals/ModalOffers";
import ModalAccessories from "../components/modals/ModalAccessories";
import { Offer } from "../context/CartContext";
import { useUserCountry } from "../hooks/useUserCountry";
import { get_enabled_offers } from "../api/offers";
import { get_detail } from "../api/detail";

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

export default function CheckoutClient({
  initialDeliveryCharges,
  hasError = false
}: {
  initialDeliveryCharges: { inside: number; outside: number; inr: number };
  hasError?: boolean;
}) {
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
  const [customerId, setCustomerId] = useState("");
  const [customerIdImage, setCustomerIdImage] = useState<File | null>(null);
  const [customerIdPreview, setCustomerIdPreview] = useState<string | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [isAccessoriesModalOpen, setIsAccessoriesModalOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOffer, setPendingOffer] = useState<Offer | null>(null);
  const [pendingSelectedProducts, setPendingSelectedProducts] = useState<any[]>(
    []
  );
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);

  const [deliveryCharges, setDeliveryCharges] = useState<{
    inside: number;
    outside: number;
    inr: number;
  }>(initialDeliveryCharges);
  const [deliveryLocation, setDeliveryLocation] = useState<"inside" | "outside">(
    "inside"
  );

  useEffect(() => {
    loadUserAddresses();
    loadAvailableOffers();
  }, []);

  const loadAvailableOffers = async () => {
    try {
      const response = await get_enabled_offers();
      if (response.status && response.data) {
        setAvailableOffers(response.data);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    try {
      if (cartState.items.length > 0) {
        const seen =
          typeof window !== "undefined"
            ? localStorage.getItem("seen-accessories-checkout")
            : null;
        if (!seen) {
          setIsAccessoriesModalOpen(true);
          if (typeof window !== "undefined") {
            localStorage.setItem("seen-accessories-checkout", "true");
          }
        }
      }
    } catch { }
  }, [cartState.items.length]);


  useEffect(() => {
    const isNepal = country?.toLowerCase() === "nepal" || country?.toLowerCase() === "np";

    if (isNepal) {
      const charge = deliveryLocation === "inside" ? deliveryCharges.inside : deliveryCharges.outside;
      setDeliveryCharge(charge);
    } else {
      setDeliveryCharge(deliveryCharges.inr);
    }
  }, [country, deliveryLocation, deliveryCharges]);

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
        return null;
      }

      return data.path;
    } catch (error) {
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

  const handleCustomerIdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomerIdImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomerIdPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOfferSelect = (offer: Offer, selectedProducts: any[]) => {
    const currentOffer = cartState.selectedOffer || zustandOffer;
    if (currentOffer && currentOffer.id !== offer.id) {
      setPendingOffer(offer);
      setPendingSelectedProducts(selectedProducts);
      setShowConfirmDialog(true);
      setIsOffersModalOpen(false);
      return;
    }
    setOffer(offer, selectedProducts);
    router.push("/");
  };

  const confirmOfferChange = () => {
    if (pendingOffer) {
      clearCart();
      clearOffer();
      setOffer(pendingOffer, []);
      setShowConfirmDialog(false);
      setPendingOffer(null);
      setPendingSelectedProducts([]);
      router.push("/");
    }
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

      const { data: addressesData } = await (supabase as any)
        .from("address")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_primary", true);

      if (addressesData && addressesData.length > 0) {
        setAddresses(addressesData as Address[]);
        setSelectedAddressId(addressesData[0].id);
      } else {
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
    const hasNonAccessoryItems =
      (cartState.normalItems && cartState.normalItems.length > 0) ||
      (cartState.offerItems && cartState.offerItems.length > 0);
    if (!hasNonAccessoryItems) {
      setError("Add at least one product to complete order");
      return;
    }

    if (paymentMethod === "cash_on_delivery") {
      if (!customerId.trim()) {
        setError("Transaction ID is required for Cash on Delivery");
        return;
      }
      if (!customerIdImage) {
        setError("Payment evidence is required for Cash on Delivery");
        return;
      }
    }

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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const order_number = generateUniqueCode();

      let paymentUrl: string | null = null;
      if (paymentMethod === "pre_payment" && paymentScreenshot) {
        paymentUrl = await uploadScreenshotToStorage(paymentScreenshot);
        if (!paymentUrl) {
          throw new Error("Failed to upload payment screenshot");
        }
      }

      let customerIdUrl: string | null = null;
      if (paymentMethod === "cash_on_delivery" && customerIdImage) {
        customerIdUrl = await uploadScreenshotToStorage(customerIdImage);
        if (!customerIdUrl) {
          throw new Error("Failed to upload customer ID image");
        }
      }

      const offerId = cartState.selectedOffer?.id || null;
      const offerProducts =
        cartState.offerItems || cartState.offerSelectedProducts || [];

      const countryParam = (country || "nepal").toLowerCase();
      const conversionRate =
        countryParam === "india" ? await fetchExchangeRate() : 1;
      const accessoryPayload = (() => {
        const items = cartState.accessoryItems || [];
        const byId = new Map<number, number>();
        items.forEach((a) => {
          const idNum =
            typeof a.id === "string" ? Number(a.id) : (a.id as number);
          if (!Number.isFinite(idNum)) return;
          const qty = Math.max(1, Number(a.quantity) || 1);
          byId.set(idNum, (byId.get(idNum) || 0) + qty);
        });
        return Array.from(byId.entries()).map(([id, quantity]) => ({
          id,
          quantity,
        }));
      })();
      const orderItems = [
        ...(cartState.normalItems || []),
        ...(cartState.offerItems || []),
      ].map((i) => {
        const { p_type, ...rest } = i as any;
        return p_type ? { ...rest, p_type } : rest;
      });
      const payload = {
        p_address_id: selectedAddressId,
        p_order_number: order_number,
        p_items: orderItems,
        p_payment_method: paymentMethod,
        p_transaction_id:
          paymentMethod === "pre_payment" ? transactionId : (paymentMethod === "cash_on_delivery" ? customerId : null),
        p_payment_url: paymentMethod === "pre_payment" ? paymentUrl : (paymentMethod === "cash_on_delivery" ? customerIdUrl : null),
        p_country: countryParam,
        p_conversion_rate: conversionRate,
        p_offer_id: offerId,
        p_offer_products:
          offerProducts && offerProducts.length > 0 ? offerProducts : null,
        p_accessories:
          accessoryPayload.length > 0 ? accessoryPayload : null,
        p_delivery_charge: deliveryCharge,
      };

      const { data: orderData, error: orderError } =
        await supabaseBrowserClient.rpc("create_orders_and_update_stock", payload);

      if (orderError) {
        throw new Error(orderError.message || "Failed to create order");
      }

      clearOffer();
      clearCart();
      if (typeof window !== "undefined") {
        localStorage.setItem("checkout_completed", "true");
      }
      router.push(`/checkout/success?order=${order_number}`);
    } catch (error: any) {
      setError(error.message || "Failed to process order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_20px_rgba(195,78,138,0.2)]"></div>
          <p className="text-secondary-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 pt-44 pb-20 relative overflow-hidden">
      {/* Background Cinematic Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute top-0 right-0 w-[50%] h-[70%] bg-primary-200/40 blur-[150px] rounded-full translate-x-1/2 translate-y-[-10%]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[70%] bg-accent-200/40 blur-[150px] rounded-full translate-x-[-1/2] translate-y-10" />
      </div>

      <div className="max-w-[1500px] mx-auto px-6 relative z-10">

        {/* Header Section */}
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="text-primary-500 font-black tracking-[0.4em] uppercase text-[10px] mb-3">Order</span>
          <h1 className="text-5xl md:text-8xl font-black text-secondary-900 tracking-tighter leading-none mb-4">
            CHECK<span className="text-secondary-400 font-serif italic font-normal">OUT</span>
          </h1>
          <p className="text-secondary-500 font-serif italic text-xl">Complete your purchase below.</p>
        </div>

        {/* Offer Availability Notice */}
        {!cartState.selectedOffer && !zustandOffer && availableOffers.length > 0 && (
          <div className="max-w-4xl mx-auto mb-12 bg-secondary-900 border border-secondary-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden group animate-in slide-in-from-top duration-700">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 shadow-glow">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase mb-1">Exclusive Privileges <span className="text-primary-400 font-serif italic font-normal lowercase">Available</span></h3>
                  <p className="text-secondary-400 text-xs font-medium uppercase tracking-widest mt-2 leading-relaxed">We noticed you haven't applied an offer. View our exclusive vaults to unlock special pricing.</p>
                </div>
              </div>
              <button
                onClick={() => setIsOffersModalOpen(true)}
                className="px-8 py-4 bg-white text-secondary-900 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-primary-500 hover:text-white transition-all duration-500 whitespace-nowrap"
              >
                Claim Privilege
              </button>
            </div>
          </div>
        )}

        {/* Error Stage */}
        {error && (
          <div className="max-w-4xl mx-auto mb-12 bg-red-50 border border-red-100 rounded p-6 animate-in slide-in-from-top duration-700">
            <div className="flex items-center gap-4 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 font-bold">!</div>
              <span className="font-black uppercase tracking-widest text-[11px]">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Left Column - User Directives */}
          <div className="lg:col-span-7 space-y-12">

            {/* Shipping Module */}
            <div className="bg-white border border-secondary-100 rounded p-10 shadow-[0_30px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-700">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <span className="text-primary-500 font-black tracking-[0.4em] uppercase text-[10px] mb-1">Destinations</span>
                  <h2 className="text-3xl font-black text-secondary-900 tracking-tighter">SHIPPING <span className="text-secondary-400 font-serif italic font-normal">ADDRESS</span></h2>
                </div>
                <Link href="/shipping-address" className="text-[10px] font-black text-secondary-400 hover:text-primary-500 uppercase tracking-widest transition-colors">+ New Address</Link>
              </div>

              {addresses.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-secondary-100 rounded text-center">
                  <p className="text-secondary-400 font-black uppercase tracking-widest text-[10px] mb-6">No logistics data found</p>
                  <Link href="/shipping-address" className="px-8 py-4 bg-secondary-900 text-white font-black text-[10px] uppercase tracking-widest rounded hover:bg-primary-500 transition-all">Define Destination</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="relative group">
                      <input
                        type="radio"
                        id={`address-${address.id}`}
                        name="addressSelection"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`address-${address.id}`}
                        className={`block p-8 rounded border-2 cursor-pointer transition-all duration-500 ${selectedAddressId === address.id
                          ? "border-primary-500 bg-primary-50 shadow-[0_15px_30px_rgba(195,78,138,0.1)]"
                          : "border-secondary-50 bg-white hover:border-secondary-200"
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-3 h-3 rounded-full ${selectedAddressId === address.id ? "bg-primary-500 animate-pulse shadow-[0_0_10px_rgba(195,78,138,0.5)]" : "bg-secondary-200"}`} />
                              <span className="font-black text-secondary-900 uppercase tracking-tight text-lg">{address.street}</span>
                            </div>
                            <p className="text-secondary-500 font-medium text-sm ml-6">{address.city}, {address.state} {address.zip}</p>
                            <p className="text-secondary-400 uppercase tracking-widest text-[9px] ml-6 mt-1">{address.country}</p>
                          </div>
                          {address.is_primary && (
                            <span className="text-[9px] font-black text-primary-500 border border-primary-200 px-3 py-1 rounded-full uppercase tracking-widest">Primary</span>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Module */}
            <div className="bg-white border border-secondary-100 rounded p-10 shadow-[0_30px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-700">
              <div className="flex flex-col mb-8">
                <span className="text-primary-500 font-black tracking-[0.4em] uppercase text-[10px] mb-1">Payments</span>
                <h2 className="text-3xl font-black text-secondary-900 tracking-tighter">PAYMENT <span className="text-secondary-400 font-serif italic font-normal">METHOD</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: "cash_on_delivery", label: "Cash on Delivery", desc: "Settle on arrival" },
                  { id: "pre_payment", label: "Online Payment", desc: "Prior clearing" }
                ].map((method) => (
                  <div key={method.id} className="relative">
                    <input
                      type="radio"
                      id={method.id}
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="sr-only"
                    />
                    <label
                      htmlFor={method.id}
                      className={`block p-8 rounded border-2 cursor-pointer transition-all duration-500 ${paymentMethod === method.id
                        ? "border-primary-500 bg-primary-50 shadow-[0_15px_30px_rgba(195,78,138,0.1)]"
                        : "border-secondary-50 bg-white hover:border-secondary-200 outline-none"
                        }`}
                    >
                      <div className={`w-10 h-10 rounded flex items-center justify-center mb-6 transition-all duration-500 ${paymentMethod === method.id ? "bg-primary-500 text-white shadow-glow" : "bg-secondary-50 text-secondary-400"}`}>
                        {method.id === "cash_on_delivery" ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        )}
                      </div>
                      <span className={`block font-black uppercase tracking-tight text-lg mb-1 ${paymentMethod === method.id ? "text-secondary-900" : "text-secondary-400"}`}>{method.label}</span>
                      <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">{method.desc}</p>
                    </label>
                  </div>
                ))}
              </div>

              {/* Delivery Location Selection for Nepal - PRE-PAYMENT SELECTION */}
              {(country?.toLowerCase() === "nepal" || country?.toLowerCase() === "np") && (
                <div className="mt-10 pt-10 border-t border-secondary-50">
                  <div className="flex flex-col mb-4">
                    <span className="text-primary-500 font-black tracking-[0.4em] uppercase text-[9px] mb-1">Logistics</span>
                    <h3 className="text-xl font-black text-secondary-900 tracking-tight uppercase">Delivery Area</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: "inside", label: "Inside Ring Road", charge: deliveryCharges.inside },
                      { id: "outside", label: "Outside Ring Road", charge: deliveryCharges.outside }
                    ].map((loc) => (
                      <div key={loc.id} className="relative">
                        <input
                          type="radio"
                          id={`delivery-loc-${loc.id}`}
                          name="deliveryLocation"
                          value={loc.id}
                          checked={deliveryLocation === loc.id}
                          onChange={(e) => setDeliveryLocation(e.target.value as any)}
                          className="sr-only"
                        />
                        <label
                          htmlFor={`delivery-loc-${loc.id}`}
                          className={`block p-6 rounded border-2 cursor-pointer transition-all duration-500 ${deliveryLocation === loc.id
                            ? "border-primary-500 bg-primary-50 shadow-[0_10px_20_rgba(195,78,138,0.1)]"
                            : "border-secondary-50 bg-white hover:border-secondary-100"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-black uppercase tracking-tight text-sm ${deliveryLocation === loc.id ? "text-secondary-900" : "text-secondary-400"}`}>
                              {loc.label}
                            </span>
                            <span className={`text-xs font-black ${deliveryLocation === loc.id ? "text-primary-500" : "text-secondary-300"}`}>
                              {formatPrice(loc.charge, "nepal")}
                            </span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cash on Delivery Fields */}
              {paymentMethod === "cash_on_delivery" && (
                <div className="mt-8 space-y-6 pt-8 border-t border-secondary-50 animate-in slide-in-from-right duration-700">
                  <div className="bg-primary-50 border border-primary-100 p-6 rounded flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 text-primary-500 font-bold">!</div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary-900 mb-1">Advance Payment Required</h4>
                      <p className="text-secondary-500 text-xs font-medium leading-relaxed">Please note that <span className="text-secondary-900 font-bold">Delivery Charges</span> must be paid in advance to confirm your Cash on Delivery order.</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em] mb-3 block">Transaction ID <span className="text-primary-500">*</span></label>
                    <input
                      type="text"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      placeholder="e.g. TXN-123456"
                      className="w-full bg-secondary-50 border border-secondary-100 rounded px-6 py-4 font-black text-secondary-900 placeholder:text-secondary-200 focus:outline-none focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em] mb-3 block">Settlement Evidence <span className="text-primary-500">*</span></label>
                    <div className="flex flex-col gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCustomerIdImageChange}
                        className="block w-full text-xs text-secondary-400 file:mr-4 file:py-3 file:px-6 file:rounded file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-secondary-900 file:text-white hover:file:bg-primary-500 transition-all"
                      />
                      {customerIdPreview && (
                        <div className="relative rounded overflow-hidden border border-secondary-100 aspect-video bg-white">
                          <img src={customerIdPreview} alt="payment evidence" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Prepayment Fields */}
              {paymentMethod === "pre_payment" && (
                <div className="mt-8 space-y-6 pt-8 border-t border-secondary-50 animate-in slide-in-from-right duration-700">
                  <div>
                    <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em] mb-3 block">Transaction ID <span className="text-primary-500">*</span></label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. TXN-998877"
                      className="w-full bg-secondary-50 border border-secondary-100 rounded px-6 py-4 font-black text-secondary-900 placeholder:text-secondary-200 focus:outline-none focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em] mb-3 block">Settlement Evidence <span className="text-primary-500">*</span></label>
                    <div className="flex flex-col gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="block w-full text-xs text-secondary-400 file:mr-4 file:py-3 file:px-6 file:rounded file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-secondary-900 file:text-white hover:file:bg-primary-500 transition-all"
                      />
                      {screenshotPreview && (
                        <div className="relative rounded overflow-hidden border border-secondary-100 aspect-video bg-white">
                          <img src={screenshotPreview} alt="payment proof" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Secure Ledger */}
          <div className="lg:col-span-5 space-y-12">
            {/* Accessories Prompt */}
            <div className="bg-white border border-secondary-100 rounded p-10 shadow-[0_20px_40px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center gap-8 group mb-12">
              <div className="flex-1">
                <span className="text-primary-500 font-black tracking-[0.4em] uppercase text-[10px] mb-1 block">Enhance Outcome</span>
                <h3 className="text-xl font-black text-secondary-900 uppercase tracking-tight mb-2">COMPLETE YOUR LOOK</h3>
                <p className="text-secondary-400 text-xs font-medium">Curated tools for professional lens application.</p>
              </div>
              <button onClick={() => setIsAccessoriesModalOpen(true)} className="px-10 py-5 bg-secondary-900 text-white font-black text-[10px] uppercase tracking-widest rounded hover:bg-primary-500 transition-all duration-500">Browse Craft</button>
            </div>

            <div className="bg-secondary-900 rounded p-10 text-white shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

              <div className="flex flex-col mb-10 relative z-10">
                <span className="text-primary-400 font-black tracking-[0.4em] uppercase text-[10px] mb-1">Summary</span>
                <h2 className="text-3xl font-black text-white tracking-tighter">ORDER <span className="text-primary-400 font-serif italic font-normal">SUMMARY</span></h2>
              </div>

              {/* Items List */}
              <div className="space-y-6 mb-10 relative z-10 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {[...(cartState.normalItems || []), ...(cartState.offerItems || []), ...(cartState.accessoryItems || [])].map((item, idx) => (
                  <div key={idx} className="flex gap-4 border-b border-white/5 pb-4 last:border-0">
                    <div className="w-12 h-12 rounded border border-white/10 overflow-hidden flex-shrink-0 bg-white/5">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] opacity-20">DE</div>}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[10px] font-black uppercase tracking-tight text-white mb-1 leading-tight">{item.title}</h4>
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Qty: {item.quantity}</span>
                        <span className="text-xs font-black text-primary-400 tracking-tighter">{formatPrice(calculatePriceSync(item.price * item.quantity, country), country)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Math */}
              <div className="space-y-4 pt-6 relative z-10">
                {(() => {
                  const allCartItems = [
                    ...(cartState.normalItems || []),
                    ...(cartState.offerItems || []),
                    ...(cartState.accessoryItems || [])
                  ];

                  const rawItemsTotalNPR = allCartItems.reduce((s, i) => s + (i.price * i.quantity), 0);
                  const offer = cartState.selectedOffer || zustandOffer;
                  let savingsNPR = 0;

                  if (offer && (cartState.offerItems || []).length > 0) {
                    (cartState.offerItems || []).forEach(oi => {
                      savingsNPR += (oi.price - calculateOfferPrice(oi.price, offer)) * oi.quantity;
                    });
                  }

                  const subtotalNPR = rawItemsTotalNPR - savingsNPR;
                  const isIndia = country?.toLowerCase() === "india" || country?.toLowerCase() === "in";

                  const subtotalConverted = calculatePriceSync(subtotalNPR, country);
                  const deliveryConverted = isIndia ? deliveryCharge : calculatePriceSync(deliveryCharge, country);
                  const finalTotal = subtotalConverted + deliveryConverted;

                  return (
                    <>
                      {/* Breakdown */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                          <span>Items Subtotal</span>
                          <span className="text-white">{formatPrice(calculatePriceSync(rawItemsTotalNPR, country), country)}</span>
                        </div>

                        {savingsNPR > 0 && (
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-green-400">
                            <span>Vault Savings</span>
                            <span>-{formatPrice(calculatePriceSync(savingsNPR, country), country)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                          <span>Delivery Charge</span>
                          <span className="text-white">{formatPrice(deliveryConverted, country)}</span>
                        </div>
                      </div>

                      {/* The Big Divider */}
                      <div className="h-[1px] w-full bg-white/10 my-8" />

                      {/* Final Total */}
                      <div className="flex justify-between items-end mb-10">
                        <div className="flex flex-col">
                          <span className="text-primary-400 font-black tracking-[0.4em] uppercase text-[9px] mb-1">Grand</span>
                          <span className="text-[14px] font-black uppercase tracking-[0.2em] text-white">TOTAL PRICE</span>
                        </div>
                        <span className="text-5xl font-black text-white tracking-tighter leading-none shadow-text">{formatPrice(finalTotal, country)}</span>
                      </div>

                      {hasError && (
                        <div className="mt-6 p-6 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-700">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-black">!</div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">System Sync Error</span>
                          </div>
                          <p className="text-[11px] font-medium text-white/70 leading-relaxed italic">
                            We are currently unable to synchronize core delivery logistics. Please contact our support vault to finalize your order:
                            <a
                              href={`mailto:support@dreamyeyes.com?subject=Checkout%20Logistics%20Sync%20Error&body=Hello%20Dreamy%20Eyes%20Support,%0D%0A%0D%0AI%20am%20seeing%20a%20logistics%20sync%20error%20on%20the%20checkout%20page.%20Please%20help%20me%20finalize%20my%20order.%0D%0A%0D%0ACountry:%20${country || 'Unknown'}`}
                              className="block mt-2 text-primary-400 font-black underline decoration-primary-400/30"
                            >
                              support@dreamyeyes.com
                            </a>
                          </p>
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="mt-6">
                        <button
                          type="submit"
                          disabled={hasError || isProcessing || !selectedAddressId || !((cartState.normalItems?.length > 0) || (cartState.offerItems?.length > 0))}
                          className={`w-full h-20 rounded font-black text-xs uppercase tracking-[0.4em] transition-all duration-700 relative overflow-hidden group ${hasError || isProcessing || !selectedAddressId || !((cartState.normalItems?.length > 0) || (cartState.offerItems?.length > 0))
                            ? "bg-white/5 text-white/20 cursor-not-allowed"
                            : "bg-primary-500 text-white shadow-[0_20px_40px_rgba(195,78,138,0.3)] hover:shadow-[0_25px_60px_rgba(195,78,138,0.5)] active:scale-[0.98]"
                            }`}
                        >
                          <div className="relative z-10">
                            {isProcessing ? "Processing Vault..." : "CONFIRM ORDER"}
                          </div>
                          {!isProcessing && !hasError && selectedAddressId && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          )}
                        </button>
                      </form>
                    </>
                  );
                })()}
              </div>
            </div>

          </div>
        </div>
      </div>

      <ModalOffers
        isOpen={isOffersModalOpen}
        onClose={() => setIsOffersModalOpen(false)}
        onSelectOffer={handleOfferSelect}
      />
      <ModalAccessories
        isOpen={isAccessoriesModalOpen}
        onClose={() => setIsAccessoriesModalOpen(false)}
      />

      {/* Confirmation Dialog */}
      {
        showConfirmDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="bg-white rounded p-12 max-w-lg w-full shadow-2xl border border-secondary-100 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mb-8 font-black text-2xl animate-bounce">!</div>
              <h3 className="text-2xl font-black text-secondary-900 uppercase tracking-tight mb-4">Reset Collection?</h3>
              <p className="text-secondary-500 font-medium mb-10 leading-relaxed italic">Synchronizing a new offer requires clearing the current vault. Proceed with reset?</p>
              <div className="flex gap-4 w-full">
                <button onClick={() => setShowConfirmDialog(false)} className="flex-1 py-5 bg-secondary-50 text-secondary-900 font-black text-[10px] uppercase tracking-widest rounded hover:bg-secondary-100 transition-all">Cancel</button>
                <button onClick={confirmOfferChange} className="flex-1 py-5 bg-red-500 text-white font-black text-[10px] uppercase tracking-widest rounded shadow-xl hover:bg-red-600 transition-all">Yes, Reset</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
