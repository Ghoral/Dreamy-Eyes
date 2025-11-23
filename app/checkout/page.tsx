"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createSupabaseClient,
  supabaseBrowserClient,
} from "../services/supabase/client/supabaseBrowserClient";
import { generateUniqueCode } from "../util";
import { MESSAGES } from "../constant/message";

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
  const { state: cartState, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "pre_payment">("cash_on_delivery");
  const [transactionId, setTransactionId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string>("");
  const [deliveryCharge, setDeliveryCharge] = useState<number>(250); // Default delivery charge
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      if (error) {
        console.error("Error loading delivery charge:", error);
        // Keep default value if fetch fails
        return;
      }

      if (data && data.delivery_charge) {
        setDeliveryCharge(parseFloat(data.delivery_charge) || 250);
      }
    } catch (error) {
      console.error("Error fetching delivery charge:", error);
      // Keep default value if fetch fails
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

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      setPaymentScreenshot(null);
      setPaymentScreenshotUrl("");
      return;
    }

    console.log("File selected:", file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file");
      setPaymentScreenshot(null);
      setPaymentScreenshotUrl("");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      setPaymentScreenshot(null);
      setPaymentScreenshotUrl("");
      return;
    }

    // Set the file in state
    setPaymentScreenshot(file);
    setError(""); // Clear any previous errors
    console.log("Screenshot set in state:", file.name, "File object:", file);

    // Create preview URL for display
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentScreenshotUrl(reader.result as string);
      console.log("Preview URL created");
    };
    reader.readAsDataURL(file);
  };

  const uploadScreenshotToStorage = async (file: File, orderNumber: string): Promise<string | null> => {
    try {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${orderNumber}_payment.${fileExt}`;
      const filePath = `payment-screenshots/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('payment') // Bucket name is 'payment'
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Upload error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        return null;
      }

      // Return only the storage key/path (not full URL) since bucket is private
      // Format: payment-screenshots/{user_id}/{order_number}_payment.{ext}
      return filePath;
    } catch (error) {
      console.error("Error uploading screenshot:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for file in input if state is not set (fallback)
    let screenshotFile = paymentScreenshot;
    if (!screenshotFile && fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
      screenshotFile = fileInputRef.current.files[0];
      console.log("Found file in input ref:", screenshotFile.name);
    }
    
    console.log("Form submitted", {
      selectedAddressId,
      paymentMethod,
      transactionId,
      hasScreenshot: !!paymentScreenshot,
      hasScreenshotFromRef: !!screenshotFile,
      fileInputFiles: fileInputRef.current?.files?.length || 0,
    });

    if (!selectedAddressId || selectedAddressId <= 0) {
      setError("Please select a shipping address");
      return;
    }

    // Validate pre-payment requirements - BOTH transaction ID AND screenshot are required
    if (paymentMethod === "pre_payment") {
      const hasTransactionId = transactionId.trim().length > 0;
      const hasScreenshot = !!screenshotFile;
      
      if (!hasTransactionId) {
        setError("Transaction ID is required for pre-payment");
        return;
      }
      
      if (!hasScreenshot) {
        setError("Payment screenshot is required for pre-payment");
        return;
      }
      
      console.log("Pre-payment validation passed", {
        hasTransactionId,
        hasScreenshot,
        transactionId: transactionId.trim(),
        screenshotFile: screenshotFile?.name
      });
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
      let paymentUrl = "";

      // Upload screenshot FIRST (required for pre-payment)
      if (screenshotFile) {
        console.log("Uploading screenshot on submit:", screenshotFile.name);
        try {
          const uploadedUrl = await uploadScreenshotToStorage(screenshotFile, order_number);
          if (uploadedUrl) {
            paymentUrl = uploadedUrl;
            console.log("Screenshot uploaded successfully, storage key:", uploadedUrl);
          } else {
            console.error("Screenshot upload returned null");
            setError("Screenshot upload failed. Please try uploading the screenshot again.");
            setIsProcessing(false);
            return;
          }
        } catch (uploadError: any) {
          console.error("Screenshot upload error:", uploadError);
          setError(`Screenshot upload failed: ${uploadError.message || "Unknown error"}. Please try uploading again.`);
          setIsProcessing(false);
          return;
        }
      }
      
      // Final validation: we need BOTH transaction ID AND successful screenshot upload
      if (paymentMethod === "pre_payment") {
        if (!transactionId.trim()) {
          setError("Transaction ID is required");
          setIsProcessing(false);
          return;
        }
        if (!paymentUrl) {
          setError("Payment screenshot upload is required");
          setIsProcessing(false);
          return;
        }
      }

      // Create order
      const { data: orderData, error: orderError } =
        await supabaseBrowserClient.rpc("create_orders_and_update_stock", {
          p_address_id: selectedAddressId,
          p_order_number: order_number,
          p_items: cartState.items,
          p_payment_method: paymentMethod,
          p_transaction_id: transactionId.trim() || null,
          p_payment_url: paymentUrl || null,
        });

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw new Error(orderError.message || "Failed to create order");
      }

      // Clear cart
      clearCart();
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
                    onChange={(e) => setPaymentMethod(e.target.value as "cash_on_delivery")}
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
                    <div className="flex items-start space-x-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === "cash_on_delivery"
                          ? "border-primary-500 bg-primary-500"
                          : "border-secondary-300"
                      }`}>
                        {paymentMethod === "cash_on_delivery" && (
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-secondary-800 text-lg">
                            Cash on Delivery
                          </h3>
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                            Pay on Delivery
                          </span>
                        </div>
                        <p className="text-secondary-600 text-sm">
                          Pay with cash when your order is delivered. Delivery charge of ${deliveryCharge.toFixed(2)} will be included.
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
                    onChange={(e) => setPaymentMethod(e.target.value as "pre_payment")}
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
                    <div className="flex items-start space-x-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === "pre_payment"
                          ? "border-primary-500 bg-primary-500"
                          : "border-secondary-300"
                      }`}>
                        {paymentMethod === "pre_payment" && (
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-secondary-800 text-lg">
                            Pre Payment
                          </h3>
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                            Pay Now
                          </span>
                        </div>
                        <p className="text-secondary-600 text-sm mb-4">
                          Pay in advance via bank transfer or payment gateway. Delivery charge of ${deliveryCharge.toFixed(2)} will be included.
                        </p>

                        {/* Pre Payment Fields */}
                        {paymentMethod === "pre_payment" && (
                          <div className="mt-4 space-y-4 pt-4 border-t border-secondary-200">
                            {/* Transaction ID */}
                            <div>
                              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                                Transaction ID <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => {
                                  setTransactionId(e.target.value);
                                  setError(""); // Clear error when user types
                                }}
                                placeholder="Enter your transaction ID"
                                required
                                className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                              />
                              <p className="text-xs text-secondary-500 mt-1">
                                Enter the transaction ID from your payment receipt
                              </p>
                            </div>

                            {/* Payment Screenshot */}
                            <div>
                              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                                Payment Screenshot <span className="text-red-500">*</span>
                              </label>
                              <div className="space-y-2">
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleScreenshotUpload}
                                  required
                                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                />
                                {paymentScreenshotUrl && (
                                  <div className="relative mt-2">
                                    <img
                                      src={paymentScreenshotUrl}
                                      alt="Payment screenshot"
                                      className="w-full max-w-xs rounded-xl border border-secondary-200"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPaymentScreenshot(null);
                                        setPaymentScreenshotUrl("");
                                        if (fileInputRef.current) {
                                          fileInputRef.current.value = "";
                                        }
                                      }}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-secondary-500 mt-1">
                                Upload a screenshot of your payment confirmation (Required)
                              </p>
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

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartState.items.map((item, index) => (
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
                            style={{ backgroundColor: item.colorHex || "#ccc" }}
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
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="border-t border-secondary-100 pt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-secondary-600">Subtotal:</span>
                  <span className="font-semibold text-secondary-800">
                    ${cartState.totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-600">Delivery Charge:</span>
                  <span className="font-semibold text-secondary-800">
                    ${deliveryCharge.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-600">Tax (8%):</span>
                  <span className="font-semibold text-secondary-800">
                    ${(cartState.totalPrice * 0.08).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-secondary-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-secondary-800">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-primary-600">
                      ${(cartState.totalPrice * 1.08 + deliveryCharge).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Complete Order Button */}
              <form onSubmit={handleSubmit} className="mt-8" noValidate>
                <button
                  type="submit"
                  disabled={isProcessing || !selectedAddressId}
                  onClick={(e) => {
                    console.log("Button clicked", {
                      isProcessing,
                      selectedAddressId,
                      paymentMethod,
                      transactionId,
                      hasScreenshot: !!paymentScreenshot,
                    });
                  }}
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
                    `Complete Order - $${(cartState.totalPrice * 1.08 + deliveryCharge).toFixed(2)}`
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
    </div>
  );
}
