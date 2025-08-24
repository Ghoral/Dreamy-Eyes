"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";

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

export default function ShippingAddressPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    isPrimary: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const supabase = createSupabaseClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data: addressesData, error: addressesError } = await (
        supabase as any
      )
        .from("address")
        .select("*")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false });

      if (addressesError) {
        setError("Failed to load addresses");
        return;
      }

      setAddresses(addressesData || []);
    } catch (error) {
      setError("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setAddressForm({
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      isPrimary: false,
    });
    setEditingAddress(null);
    setIsAddingAddress(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const supabase = createSupabaseClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("User not authenticated");
        return;
      }

      // If setting as primary, update all other addresses to not be primary
      if (addressForm.isPrimary) {
        await (supabase as any)
          .from("address")
          .update({ is_primary: false })
          .eq("user_id", user.id);
      }

      if (editingAddress) {
        // Update existing address
        const { error: updateError } = await (supabase as any)
          .from("address")
          .update({
            street: addressForm.street,
            city: addressForm.city,
            state: addressForm.state,
            zip: addressForm.zip,
            country: addressForm.country,
            is_primary: addressForm.isPrimary,
          })
          .eq("id", editingAddress.id);

        if (updateError) {
          setError("Failed to update address");
          return;
        }

        setSuccess("Address updated successfully!");
      } else {
        // Create new address
        const { error: insertError } = await (supabase as any)
          .from("address")
          .insert({
            user_id: user.id,
            street: addressForm.street,
            city: addressForm.city,
            state: addressForm.state,
            zip: addressForm.zip,
            country: addressForm.country,
            is_primary: addressForm.isPrimary,
          });

        if (insertError) {
          setError("Failed to add address");
          return;
        }

        setSuccess("Address added successfully!");

        // Mark profile as complete when first address is added
        const { data: addressesData } = await (supabase as any)
          .from("address")
          .select("id")
          .eq("user_id", user.id);

        if (addressesData && addressesData.length === 1) {
          // This is the first address, mark profile as complete
          await (supabase as any).from("profiles").upsert({
            id: user.id,
            profile_completed: true,
            updated_at: new Date().toISOString(),
          });
        }
      }

      // Reload addresses and reset form
      await loadAddresses();
      resetForm();
    } catch (error) {
      setError("Failed to save address");
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      isPrimary: address.is_primary,
    });
    setIsAddingAddress(true);
  };

  const handleDelete = async (addressId: number) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const supabase = createSupabaseClient();
      const { error } = await (supabase as any)
        .from("address")
        .delete()
        .eq("id", addressId);

      if (error) {
        setError("Failed to delete address");
        return;
      }

      setSuccess("Address deleted successfully!");
      await loadAddresses();
    } catch (error) {
      setError("Failed to delete address");
    }
  };

  const handleSetPrimary = async (addressId: number) => {
    try {
      const supabase = createSupabaseClient();

      // Update all other addresses to not be primary
      await (supabase as any)
        .from("address")
        .update({ is_primary: false })
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      // Update the selected address to be primary
      const { error } = await (supabase as any)
        .from("address")
        .update({ is_primary: true })
        .eq("id", addressId);

      if (error) {
        setError("Failed to set primary address");
        return;
      }

      setSuccess("Primary address updated successfully!");
      await loadAddresses();
    } catch (error) {
      setError("Failed to set primary address");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600 text-lg">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 pt-28 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-secondary-800 mb-4">
            Shipping Addresses
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            Manage your delivery addresses for quick and easy checkout
          </p>
        </div>

        {/* Messages */}
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
                  d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3 text-green-700">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">{success}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Address Form */}
          <div>
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-secondary-800">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={addressForm.street}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={addressForm.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 mb-2">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={addressForm.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter state"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 mb-2">
                      ZIP/Postal Code *
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={addressForm.zip}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter ZIP code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 mb-2">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={addressForm.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select Country</option>
                      <option value="India">India</option>
                      <option value="Nepal">Nepal</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isPrimary"
                    id="isPrimary"
                    checked={addressForm.isPrimary}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-primary-600 border-secondary-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <label
                    htmlFor="isPrimary"
                    className="text-sm font-semibold text-secondary-700"
                  >
                    Set as primary address
                  </label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-lg"
                  >
                    {editingAddress ? "Update Address" : "Add Address"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-white border-2 border-secondary-300 text-secondary-700 hover:bg-secondary-50 hover:border-secondary-400 font-semibold rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Address List */}
          <div>
            <div className="bg-white rounded-3xl shadow-soft p-8 border border-secondary-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
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
                    Your Addresses
                  </h2>
                </div>
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors duration-300"
                >
                  <svg
                    className="w-4 h-4 mr-2 inline"
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
                  Add New
                </button>
              </div>

              {addresses.length === 0 ? (
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-800 mb-2">
                    No addresses yet
                  </h3>
                  <p className="text-secondary-600 mb-6">
                    Add your first shipping address to get started
                  </p>
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors duration-300"
                  >
                    Add First Address
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        address.is_primary
                          ? "border-primary-500 bg-primary-50"
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
                            {address.is_primary && (
                              <span className="bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-secondary-600 mb-1">
                            {address.city}, {address.state} {address.zip}
                          </p>
                          <p className="text-secondary-500">
                            {address.country}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          {!address.is_primary && (
                            <button
                              onClick={() => handleSetPrimary(address.id)}
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors duration-200"
                              title="Set as primary"
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(address)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors duration-200"
                            title="Edit address"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(address.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200"
                            title="Delete address"
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back to Profile */}
        <div className="text-center mt-12">
          <Link
            href="/profile"
            className="inline-flex items-center px-6 py-3 bg-white border-2 border-secondary-300 text-secondary-700 hover:bg-secondary-50 hover:border-secondary-400 font-semibold rounded-xl transition-all duration-300"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
