"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { supabaseBrowserClient } from "../services/supabase/client/supabaseBrowserClient";

const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  phone: Yup.string()
    .matches(/^[0-9+\-\s()]+$/, "Invalid phone number format")
    .min(10, "Phone number must be at least 10 digits")
    .required("Phone number is required"),
});

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: any
  ) => {
    setIsLoading(true);
    setError("");

    try {
      // Check if email already exists
      const { data: existingProfile } = await supabaseBrowserClient
        .from("profiles")
        .select("email")
        .eq("email", values.email)
        .single();

      if (existingProfile) {
        setError(
          "Email already exists. Please use a different email or try logging in."
        );
        setIsLoading(false);
        setSubmitting(false);
        return;
      }

      // Create user account
      const {
        data: { user },
        error: signUpError,
      } = await supabaseBrowserClient.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      
    
      // Redirect to login page with message about adding shipping address
      router.push(
        "/login?message=Registration successful! Please check your email to verify your account. You'll need to add your shipping address after logging in."
      );
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary mb-2">Create Account</h2>
                  <p className="text-muted">Join us and start shopping today</p>
                  <p className="text-muted small">You'll be asked to add your shipping address after registration</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Registration Form */}
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form>
                      {/* Personal Information */}
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label
                            htmlFor="firstName"
                            className="form-label fw-semibold"
                          >
                            First Name *
                          </label>
                          <Field
                            type="text"
                            className={`form-control ${
                              errors.firstName && touched.firstName
                                ? "is-invalid"
                                : ""
                            }`}
                            id="firstName"
                            name="firstName"
                            placeholder="Enter your first name"
                          />
                          <ErrorMessage
                            name="firstName"
                            component="div"
                            className="invalid-feedback d-block"
                          />
                        </div>
                        <div className="col-md-6">
                          <label
                            htmlFor="lastName"
                            className="form-label fw-semibold"
                          >
                            Last Name *
                          </label>
                          <Field
                            type="text"
                            className={`form-control ${
                              errors.lastName && touched.lastName
                                ? "is-invalid"
                                : ""
                            }`}
                            id="lastName"
                            name="lastName"
                            placeholder="Enter your last name"
                          />
                          <ErrorMessage
                            name="lastName"
                            component="div"
                            className="invalid-feedback d-block"
                          />
                        </div>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label
                            htmlFor="email"
                            className="form-label fw-semibold"
                          >
                            Email Address *
                          </label>
                          <Field
                            type="email"
                            className={`form-control ${
                              errors.email && touched.email ? "is-invalid" : ""
                            }`}
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="invalid-feedback d-block"
                          />
                        </div>
                        <div className="col-md-6">
                          <label
                            htmlFor="phone"
                            className="form-label fw-semibold"
                          >
                            Phone Number *
                          </label>
                          <Field
                            type="tel"
                            className={`form-control ${
                              errors.phone && touched.phone ? "is-invalid" : ""
                            }`}
                            id="phone"
                            name="phone"
                            placeholder="Enter your phone number"
                          />
                          <ErrorMessage
                            name="phone"
                            component="div"
                            className="invalid-feedback d-block"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label
                            htmlFor="password"
                            className="form-label fw-semibold"
                          >
                            Password *
                          </label>
                          <div className="input-group">
                            <Field
                              type={showPassword ? "text" : "password"}
                              className={`form-control ${
                                errors.password && touched.password
                                  ? "is-invalid"
                                  : ""
                              }`}
                              id="password"
                              name="password"
                              placeholder="Create a password"
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <i
                                className={`bi ${
                                  showPassword ? "bi-eye-slash" : "bi-eye"
                                }`}
                              ></i>
                            </button>
                          </div>
                          <ErrorMessage
                            name="password"
                            component="div"
                            className="invalid-feedback d-block"
                          />
                        </div>
                        <div className="col-md-6">
                          <label
                            htmlFor="confirmPassword"
                            className="form-label fw-semibold"
                          >
                            Confirm Password *
                          </label>
                          <div className="input-group">
                            <Field
                              type={showConfirmPassword ? "text" : "password"}
                              className={`form-control ${
                                errors.confirmPassword &&
                                touched.confirmPassword
                                  ? "is-invalid"
                                  : ""
                              }`}
                              id="confirmPassword"
                              name="confirmPassword"
                              placeholder="Confirm your password"
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              <i
                                className={`bi ${
                                  showConfirmPassword
                                    ? "bi-eye-slash"
                                    : "bi-eye"
                                }`}
                              ></i>
                            </button>
                          </div>
                          <ErrorMessage
                            name="confirmPassword"
                            component="div"
                            className="invalid-feedback d-block"
                          />
                        </div>
                      </div>

                      {/* Address Information section removed */}

                      {/* Submit Button */}
                      <div className="d-grid mb-4">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg py-3 fw-semibold"
                          disabled={isLoading || isSubmitting}
                        >
                          {isLoading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Creating Account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </button>
                      </div>

                      {/* Terms and Conditions */}
                      <div className="text-center mb-4">
                        <small className="text-muted">
                          By creating an account, you agree to our{" "}
                          <Link href="/terms" className="text-decoration-none">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/privacy"
                            className="text-decoration-none"
                          >
                            Privacy Policy
                          </Link>
                        </small>
                      </div>

                      {/* Sign In Link */}
                      <div className="text-center">
                        <p className="mb-0 text-muted">
                          Already have an account?{" "}
                          <Link
                            href="/login"
                            className="text-decoration-none fw-semibold"
                          >
                            Sign in here
                          </Link>
                        </p>
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
