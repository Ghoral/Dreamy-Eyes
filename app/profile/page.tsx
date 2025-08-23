"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  mobile_number: string;
}

interface Address {
  id: number;
  user_id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [addressForm, setAddressForm] = useState({
    id: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    isPrimary: false,
  });
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Load profile
      const { data: profileData } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Load addresses
      const { data: addressesData } = await (supabase as any)
        .from('address')
        .select('*')
        .eq('user_id', user.id);

      if (profileData) {
        setProfile(profileData);
        setEditForm({
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          phone: profileData.mobile_number || "",
        });
      }

      if (addressesData && addressesData.length > 0) {
        setAddresses(addressesData);
      }
    } catch (error) {
      setError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          mobile_number: editForm.phone,
        })
        .eq('id', user.id);

      if (error) {
        setError("Failed to update profile");
        return;
      }

      setProfile(prev => prev ? {
        ...prev,
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        mobile_number: editForm.phone,
      } : null);
      setIsEditing(false);
    } catch (error) {
      setError("Failed to update profile");
    }
  };

  const handleAddressSubmit = async () => {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Note: The address table doesn't have an isPrimary field in the schema
      // We'll skip the primary address logic since it's not supported in the current schema

      if (addressForm.id) {
        // Update existing address
        const { error } = await (supabase as any)
          .from('address')
          .update({
            street: addressForm.street,
            city: addressForm.city,
            state: addressForm.state,
            zip: addressForm.zip,
            country: addressForm.country,
          })
          .eq('id', addressForm.id);

        if (error) {
          setError("Failed to update address");
          return;
        }
      } else {
        // Create new address
        const { error } = await (supabase as any)
          .from('address')
          .insert({
            user_id: user.id,
            street: addressForm.street,
            city: addressForm.city,
            state: addressForm.state,
            zip: addressForm.zip,
            country: addressForm.country,
          });

        if (error) {
          setError("Failed to add address");
          return;
        }
      }

      // Reload addresses
      loadProfile();
      setIsAddingAddress(false);
      resetAddressForm();
    } catch (error) {
      setError("Failed to save address");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const supabase = createSupabaseClient();
      const { error } = await (supabase as any)
        .from('address')
        .delete()
        .eq('id', addressId);

      if (error) {
        setError("Failed to delete address");
        return;
      }

      // Reload addresses
      loadProfile();
    } catch (error) {
      setError("Failed to delete address");
    }
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm({
      id: address.id,
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      isPrimary: false, // Not in schema, but keeping for UI consistency
    });
    setIsAddingAddress(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      id: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      isPrimary: false,
    });
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h3>Profile not found</h3>
          <Link href="/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container">
        <div className="row">
          {/* Profile Section */}
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "80px", height: "80px" }}>
                    <i className="bi bi-person text-white" style={{ fontSize: "2rem" }}></i>
                  </div>
                  <h4 className="fw-bold mb-1">{profile.first_name} {profile.last_name}</h4>
                  <p className="text-muted mb-0">{profile.email}</p>
                </div>

                {!isEditing ? (
                  <div className="mb-3">
                    <p className="mb-1"><strong>Phone:</strong> {profile.mobile_number || "Not provided"}</p>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <div className="mb-3">
                    <div className="mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="First Name"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Last Name"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                    <div className="mb-2">
                      <input
                        type="tel"
                        className="form-control form-control-sm"
                        placeholder="Phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleProfileUpdate}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold mb-0">My Addresses</h4>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      resetAddressForm();
                      setIsAddingAddress(true);
                    }}
                  >
                    <i className="bi bi-plus me-1"></i>
                    Add New Address
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Add/Edit Address Form */}
                {isAddingAddress && (
                  <div className="card mb-4 border">
                    <div className="card-body">
                      <h5 className="card-title mb-3">
                        {addressForm.id ? "Edit Address" : "Add New Address"}
                      </h5>
                      <div className="mb-3">
                        <label className="form-label">Street Address</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Street Address"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="City"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">State/Province</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="State/Province"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">ZIP/Postal Code</label>
                          <input
                              type="text"
                              className="form-control"
                              placeholder="ZIP/Postal Code"
                              value={addressForm.zip}
                              onChange={(e) => setAddressForm(prev => ({ ...prev, zip: e.target.value }))}
                            />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Country</label>
                        <select
                          className="form-select"
                          value={addressForm.country}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
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
                      {/* Note: Primary Address feature removed as it's not in the schema */}
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary"
                          onClick={handleAddressSubmit}
                        >
                          {addressForm.id ? "Update Address" : "Add Address"}
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => setIsAddingAddress(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing Addresses */}
                {addresses.length > 0 ? (
                  <div className="row g-3">
                    {addresses.map((address) => (
                      <div key={address.id} className="col-12">
                        <div className="card border">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h6 className="mb-1 fw-semibold">{address.street}</h6>
                                <p className="mb-1 text-muted">
                                  {address.city}, {address.state} {address.zip}
                                </p>
                                <p className="mb-0 text-muted">{address.country}</p>
                              </div>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => handleEditAddress(address)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteAddress(address.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted mb-0">You don't have any saved addresses yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
