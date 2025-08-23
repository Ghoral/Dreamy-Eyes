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
  country: string;
  city: string;
  state: string;
  zip: string;
  street: string;
  mobile_number: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
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

      if (profileData) {
        setProfile(profileData);
        setEditForm({
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          phone: profileData.mobile_number || "",
          address: profileData.street || "",
          city: profileData.city || "",
          state: profileData.state || "",
          zipCode: profileData.zip || "",
          country: profileData.country || "",
        });
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
          street: editForm.address,
          city: editForm.city,
          state: editForm.state,
          zip: editForm.zipCode,
          country: editForm.country,
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
        street: editForm.address,
        city: editForm.city,
        state: editForm.state,
        zip: editForm.zipCode,
        country: editForm.country,
      } : null);
      setIsEditing(false);
    } catch (error) {
      setError("Failed to update profile");
    }
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
                    <p className="mb-1"><strong>Address:</strong> {profile.street || "Not provided"}</p>
                    <p className="mb-1"><strong>City:</strong> {profile.city || "Not provided"}</p>
                    <p className="mb-1"><strong>State:</strong> {profile.state || "Not provided"}</p>
                    <p className="mb-1"><strong>ZIP:</strong> {profile.zip || "Not provided"}</p>
                    <p className="mb-1"><strong>Country:</strong> {profile.country || "Not provided"}</p>
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
                    <div className="mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Street Address"
                        value={editForm.address}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div className="mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="City"
                        value={editForm.city}
                        onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="State"
                          value={editForm.state}
                          onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="ZIP Code"
                          value={editForm.zipCode}
                          onChange={(e) => setEditForm(prev => ({ ...prev, zipCode: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="mb-2">
                      <select
                        className="form-select form-select-sm"
                        value={editForm.country}
                        onChange={(e) => setEditForm(prev => ({ ...prev, country: e.target.value }))}
                      >
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
                  <h4 className="fw-bold mb-0">My Address</h4>
                  {/* The "Add New Address" button is removed as per the new structure */}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Add New Address Form */}
                {/* This section is removed as per the new structure */}

                {/* Existing Addresses */}
                {/* This section is removed as per the new structure */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
