"use client";

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";
import { generateUniqueCode } from "../util";

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

  useEffect(() => {
    loadUserAddresses();
  }, []);

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
    console.log("e", e);

    if (!selectedAddressId || selectedAddressId <= 0) {
      setError("Please select a shipping address");
      return;
    }

    setIsProcessing(true);

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

      const { error } = await supabase.rpc("create_orders_and_update_stock", {
        p_user_id: user.id,
        p_address_id: selectedAddressId.toString(),
        p_order_number: order_number,
        p_items: cartState.items as any,
      });

      if (error) {
        return;
      }
      clearCart();
      router.push("/checkout/success");
    } catch (error) {
      console.error("Error creating order:", error);
      setError("There was an error processing your order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartState.items.length === 0) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="text-center">
          <h2 className="mb-4">Your cart is empty</h2>
          <p className="text-muted mb-4">
            Add some items to your cart before checkout
          </p>
          <Link href="/shop" className="btn btn-primary btn-lg">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container py-5">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/" className="text-decoration-none text-muted">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/shop" className="text-decoration-none text-muted">
                Shop
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Checkout
            </li>
          </ol>
        </nav>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h3 className="fw-bold mb-4">Shipping Address</h3>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Stock Adjustment Warning */}
                {cartState.items.some(
                  (item) =>
                    item.maxQuantity && item.quantity >= item.maxQuantity
                ) && (
                  <div className="alert alert-warning" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Some items in your cart have been automatically adjusted to
                    match available stock. Please review your order before
                    proceeding.
                  </div>
                )}

                {/* Address Selection */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Select Shipping Address
                  </label>
                  <div className="row g-3">
                    {addresses.map((address) => (
                      <div key={address.id} className="col-12">
                        <div
                          className={`card border ${
                            selectedAddressId === address.id
                              ? "border-primary"
                              : ""
                          }`}
                        >
                          {address.is_primary && (
                            <div className="position-absolute top-0 end-0 mt-2 me-2">
                              <span className="badge bg-success">Primary</span>
                            </div>
                          )}
                          <div className="card-body">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="addressSelection"
                                id={`address-${address.id}`}
                                value={address.id}
                                checked={selectedAddressId === address.id}
                                onChange={(e) =>
                                  setSelectedAddressId(Number(e.target.value))
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`address-${address.id}`}
                              >
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <p className="mb-1 fw-semibold">
                                      {address.street}
                                    </p>
                                    <p className="mb-1 text-muted">
                                      {address.city}, {address.state}{" "}
                                      {address.zip}
                                    </p>
                                    <p className="mb-0 text-muted">
                                      {address.country}
                                    </p>
                                  </div>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Address Link */}
                <div className="text-center mb-4">
                  <Link
                    href="/shipping-address"
                    className="btn btn-outline-primary"
                  >
                    <i className="bi bi-plus me-2"></i>
                    Add New Address
                  </Link>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h3 className="fw-bold mb-4">Order Summary</h3>

                {/* Stock Adjustment Warning */}
                {cartState.items.some(
                  (item) =>
                    item.maxQuantity && item.quantity >= item.maxQuantity
                ) && (
                  <div
                    className="alert alert-warning alert-sm mb-3"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <small>
                      Some quantities have been adjusted to match available
                      stock
                    </small>
                  </div>
                )}

                {/* Cart Items */}
                <div className="mb-4">
                  {cartState.items.map((item, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center mb-3 pb-3 border-bottom"
                    >
                      <div className="flex-shrink-0 me-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="rounded"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-semibold">{item.title}</h6>
                        {item.color && (
                          <small className="text-muted d-block">
                            Color: {item.color}
                          </small>
                        )}
                        <small className="text-muted">
                          Qty: {item.quantity} × ${item.price}
                        </small>
                        {item.maxQuantity && (
                          <small className="text-muted d-block">
                            Stock: {item.maxQuantity} available
                            {item.quantity >= item.maxQuantity && (
                              <span className="text-warning ms-2">
                                <i className="bi bi-exclamation-triangle"></i>{" "}
                                Max quantity reached
                              </span>
                            )}
                          </small>
                        )}
                      </div>
                      <div className="text-end">
                        <span className="fw-bold">
                          ${item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="border-top pt-3 mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${cartState.totalPrice}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping:</span>
                    <span className="text-success">Free</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax:</span>
                    <span>${(cartState.totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total:</span>
                    <span>${(cartState.totalPrice * 1.08).toFixed(2)}</span>
                  </div>
                </div>

                {/* Complete Order Button */}
                <form onSubmit={handleSubmit}>
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg py-3 fw-semibold"
                      disabled={isProcessing || !selectedAddressId}
                    >
                      {isProcessing ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Processing Order...
                        </>
                      ) : (
                        `Complete Order - $${cartState.totalPrice}`
                      )}
                    </button>
                  </div>
                </form>

                {/* Security Info */}
                <div className="mt-4 text-center">
                  <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-2">
                    <i className="bi bi-shield-check"></i>
                    <small>Secure Order</small>
                  </div>
                  <div className="d-flex align-items-center justify-content-center gap-2 text-muted">
                    <i className="bi bi-lock"></i>
                    <small>SSL Encrypted</small>
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
