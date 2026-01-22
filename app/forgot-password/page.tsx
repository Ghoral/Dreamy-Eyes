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
    <div className="min-h-screen bg-secondary-50 pt-44 pb-20 relative overflow-hidden">
      {/* Background Soft Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute top-0 right-0 w-[50%] h-[70%] bg-primary-200/40 blur-[150px] rounded-full translate-x-1/2 translate-y-[-10%]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[70%] bg-accent-200/40 blur-[150px] rounded-full translate-x-[-1/2] translate-y-10" />
      </div>

      <div className="max-w-[1500px] mx-auto px-6 relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">

        {/* The Boutique Recovery Section */}
        <div className="w-full max-w-xl bg-white border border-secondary-100 rounded-[3rem] p-8 md:p-16 shadow-[0_30px_80px_rgba(0,0,0,0.03)] overflow-hidden relative">

          {/* Internal Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-50/50 blur-[100px] pointer-events-none" />

          {/* Heading Section */}
          <div className="relative z-10 flex flex-col items-center text-center mb-12">
            <span className="text-primary-500 font-black tracking-[0.4em] uppercase text-[10px] mb-3">Reset Password</span>
            <h1 className="text-3xl md:text-5xl font-black text-secondary-900 tracking-tighter leading-none mb-4">
              FORGOT <span className="text-secondary-400 font-serif italic font-normal">PASSWORD</span>
            </h1>
            <p className="text-secondary-500 font-serif italic text-lg leading-relaxed">
              Enter your email to receive a reset link.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="relative z-10 mb-8 bg-red-50 border border-red-100 rounded-2xl p-4 animate-in slide-in-from-top duration-500">
              <div className="flex items-center gap-3 text-red-600">
                <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-black">!</span>
                <span className="text-[11px] font-black uppercase tracking-widest">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="relative z-10 mb-8 bg-green-50 border border-green-100 rounded-2xl p-4 animate-in slide-in-from-top duration-500">
              <div className="flex items-center gap-3 text-green-600">
                <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-black">✓</span>
                <span className="text-[11px] font-black uppercase tracking-widest leading-relaxed">{success}</span>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSendReset} className="relative z-10 space-y-8">
              {/* Email Field */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em]">Email Address</label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full bg-secondary-50 border border-secondary-100 rounded-2xl px-6 py-5 font-black text-secondary-900 placeholder:text-secondary-200 focus:outline-none focus:border-primary-500 transition-all duration-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`h-20 w-full rounded-3xl font-black text-xs uppercase tracking-[0.4em] transition-all duration-700 relative overflow-hidden group ${isLoading
                  ? "bg-secondary-100 text-secondary-400 cursor-not-allowed"
                  : "bg-primary-500 text-white shadow-[0_20px_40px_rgba(195,78,138,0.2)] hover:shadow-[0_25px_60px_rgba(195,78,138,0.4)] active:scale-[0.98]"
                  }`}
              >
                <div className="relative z-10">
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </div>
                {!isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                )}
              </button>
            </form>
          )}

          {/* Login Link */}
          <div className="pt-8 text-center relative z-10">
            <Link
              href="/login"
              className="inline-block py-4 px-10 border border-secondary-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-secondary-900 hover:bg-secondary-50 hover:border-secondary-300 transition-all duration-500"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
