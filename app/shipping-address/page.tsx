"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";

// Validation schema for shipping address form
const validationSchema = Yup.object({
  address: Yup.string()
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must be less than 100 characters")
    .required("Street address is required"),
  city: Yup.string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be less than 50 characters")
    .required("City is required"),
  state: Yup.string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must be less than 50 characters")
    .required("State/Province is required"),
  zipCode: Yup.string()
    .matches(/^[0-9]{5,6}$/, "Invalid zip/postal code format (5-6 digits)")
    .required("Zip/Postal code is required"),
  country: Yup.string()
    .oneOf(["Nepal", "India"], "Please select either Nepal or India")
    .required("Country is required"),
});

// Country options
const countryOptions = [
  { value: "Nepal", label: "Nepal" },
  { value: "India", label: "India" },
];

export default function ShippingAddressPage() {
  const [initialValues, setInitialValues] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Nepal", // Default to Nepal
    is_primary: false, // Add is_primary field with default false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Check if profile already complete
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData && profileData.profile_completed) {
        // Profile is already complete, redirect to home
        router.push("/");
        return;
      }

      // Check if user already has addresses
      const { data: addressesData } = await supabase
        .from('address')
        .select('*')
        .eq('user_id', user.id);

      // No need to pre-fill form with profile data anymore
      // since we're only collecting address information

      // If user has an address, pre-fill with the first one
      if (addressesData && addressesData.length > 0) {
        const firstAddress = addressesData[0];
        setInitialValues(prev => ({
          ...prev,
          address: firstAddress.street || "",
          city: firstAddress.city || "",
          state: firstAddress.state || "",
          zipCode: firstAddress.zip || "",
          country: firstAddress.country || "",
        }));
      }
    } catch (error) {
      setError("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  // Define interface for form values
  interface ShippingAddressFormValues {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    is_primary: boolean;
  }

  // Define type for Formik submission handler
  const handleSubmit = async (values: ShippingAddressFormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    setError("");
    setSuccess("");

    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Mark profile as complete
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          profile_completed: true
        })
        .eq('id', user.id);

      if (profileUpdateError) {
        setError("Failed to update profile: " + profileUpdateError.message);
        return;
      }

      // If this is set as primary, update all other addresses to not be primary
      if (values.is_primary) {
        await supabase
          .from('address')
          .update({ is_primary: false })
          .eq('user_id', user.id);
      }

      // Insert address into address table
      const { error: addressError } = await supabase
        .from('address')
        .insert({
          user_id: user.id,
          street: values.address,
          city: values.city,
          state: values.state,
          zip: values.zipCode,
          country: values.country,
          is_primary: values.is_primary
        });

      if (addressError) {
        setError("Failed to save address: " + addressError.message);
        return;
      }

      setSuccess("Shipping address saved successfully!");
      
      // Redirect to home page after short delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary mb-2">Add Shipping Address</h2>
                  <p className="text-muted">Please provide your shipping address to complete your profile</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    {success}
                  </div>
                )}

                {/* Shipping Address Form */}
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form>
                      <div className="row g-3">
                        {/* Country */}
                        <div className="col-md-6">
                          <label htmlFor="country" className="form-label fw-semibold">Country</label>
                          <Field
                            as="select"
                            className={`form-select ${touched.country && errors.country ? 'is-invalid' : ''}`}
                            id="country"
                            name="country"
                          >
                            <option value="">Select a country</option>
                            {countryOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage name="country" component="div" className="invalid-feedback" />
                        </div>

                        {/* Street Address */}
                        <div className="col-12">
                          <label htmlFor="address" className="form-label fw-semibold">Street Address</label>
                          <Field
                            type="text"
                            className={`form-control ${touched.address && errors.address ? 'is-invalid' : ''}`}
                            id="address"
                            name="address"
                            placeholder="Enter your street address"
                          />
                          <ErrorMessage name="address" component="div" className="invalid-feedback" />
                        </div>

                        {/* City */}
                        <div className="col-md-6">
                          <label htmlFor="city" className="form-label fw-semibold">City</label>
                          <Field
                            type="text"
                            className={`form-control ${touched.city && errors.city ? 'is-invalid' : ''}`}
                            id="city"
                            name="city"
                            placeholder="Enter your city"
                          />
                          <ErrorMessage name="city" component="div" className="invalid-feedback" />
                        </div>

                        {/* State/Province */}
                        <div className="col-md-3">
                          <label htmlFor="state" className="form-label fw-semibold">State/Province</label>
                          <Field
                            type="text"
                            className={`form-control ${touched.state && errors.state ? 'is-invalid' : ''}`}
                            id="state"
                            name="state"
                            placeholder="Enter your state"
                          />
                          <ErrorMessage name="state" component="div" className="invalid-feedback" />
                        </div>

                        {/* Zip/Postal Code */}
                        <div className="col-md-3">
                          <label htmlFor="zipCode" className="form-label fw-semibold">Zip/Postal Code</label>
                          <Field
                            type="text"
                            className={`form-control ${touched.zipCode && errors.zipCode ? 'is-invalid' : ''}`}
                            id="zipCode"
                            name="zipCode"
                            placeholder="Enter your zip code"
                          />
                          <ErrorMessage name="zipCode" component="div" className="invalid-feedback" />
                        </div>

                        {/* Primary Address Checkbox */}
                        <div className="col-12 mt-3">
                          <div className="form-check">
                            <Field
                              type="checkbox"
                              className="form-check-input"
                              id="is_primary"
                              name="is_primary"
                            />
                            <label className="form-check-label" htmlFor="is_primary">
                              Set as primary address
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="d-grid mt-4">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg py-3 fw-semibold"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Saving...
                            </>
                          ) : (
                            "Save Shipping Address"
                          )}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}