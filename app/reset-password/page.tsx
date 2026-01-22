"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setError("Invalid or expired link. Request a new reset link.");
      }
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}/.test(newPassword)) {
      setError(
        "Password must be 6+ chars and include upper, lower, and a number"
      );
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password updated! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
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

        {/* The Boutique Reset Section */}
        <div className="w-full max-w-xl bg-white border border-secondary-100 rounded-[3rem] p-8 md:p-16 shadow-[0_30px_80px_rgba(0,0,0,0.03)] overflow-hidden relative">

          {/* Internal Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-50/50 blur-[100px] pointer-events-none" />

          {/* Heading Section */}
          <div className="relative z-10 flex flex-col items-center text-center mb-12">
            <span className="text-primary-500 font-black tracking-[0.4em] uppercase text-[10px] mb-3">Update Password</span>
            <h1 className="text-3xl md:text-5xl font-black text-secondary-900 tracking-tighter leading-none mb-4">
              SET <span className="text-secondary-400 font-serif italic font-normal">PASSWORD</span>
            </h1>
            <p className="text-secondary-500 font-serif italic text-lg leading-relaxed">
              Define your new password to regain access.
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
              <div className="flex items-center gap-3 text-green-700">
                <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-black">✓</span>
                <span className="text-[11px] font-black uppercase tracking-widest leading-relaxed">{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleReset} className="relative z-10 space-y-8">
            {/* New Password Field */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em]">New Password</label>
              <div className="relative group">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Create new password"
                  className="w-full bg-secondary-50 border border-secondary-100 rounded-2xl px-6 py-4 font-black text-secondary-900 focus:outline-none focus:border-primary-500 transition-all duration-500"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-300 hover:text-secondary-900 transition-colors">
                  {showNewPassword ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em]">Confirm Password</label>
              <div className="relative group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className="w-full bg-secondary-50 border border-secondary-100 rounded-2xl px-6 py-4 font-black text-secondary-900 focus:outline-none focus:border-primary-500 transition-all duration-500"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-300 hover:text-secondary-900 transition-colors">
                  {showConfirmPassword ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                </button>
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
                {isLoading ? "Updating..." : "Update Password"}
              </div>
              {!isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              )}
            </button>
          </form>

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
