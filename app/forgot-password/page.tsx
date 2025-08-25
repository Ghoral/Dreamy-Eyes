"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(
          "We sent a secure link to your email. Open it to set a new password."
        );
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 pt-28 pb-8">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-secondary-800 mb-2">
              Forgot Password
            </h1>
            <p className="text-secondary-600">
              Enter your email address and we'll send you a reset link.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center space-x-3 text-red-700">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center space-x-3 text-green-700">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm font-medium">{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSendReset} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-3">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-secondary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 border border-secondary-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                isLoading
                  ? "bg-secondary-300 text-secondary-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-glow hover:shadow-glow-lg"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending link...</span>
                </div>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
