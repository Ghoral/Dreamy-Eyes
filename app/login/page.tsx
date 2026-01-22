"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [invalidDomains, setInvalidDomains] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  useEffect(() => {
    const loadInvalidDomains = async () => {
      try {
        const res = await fetch("/invalid-domains");
        if (!res.ok) return;
        const text = await res.text();
        if (text.trim().toLowerCase().startsWith("<!doctype html") || text.includes("<html")) {
          return;
        }
        const list = text
          .split("\n")
          .map((d) => d.trim().toLowerCase())
          .filter((d) => d.length > 0 && !d.startsWith("#") && !d.includes(" ") && d.includes("."));
        setInvalidDomains(list);
      } catch (e) {
        console.error("Failed to load invalid domains:", e);
      }
    };
    loadInvalidDomains();
  }, []);

  const isEmailDomainAllowed = (email: string) => {
    const domain = email.trim().split("@")[1]?.toLowerCase() || "";
    if (!domain) return false;
    const whitelist = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
    if (whitelist.includes(domain)) return true;
    return !invalidDomains.some((bad) => domain === bad || domain.endsWith("." + bad));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = formData.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!isEmailDomainAllowed(email)) {
      setError("Email domain is not allowed");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("profile_completed")
          .eq("id", user.id)
          .single();

        if (!profileData || profileData.profile_completed !== true) {
          router.push("/shipping-address");
          return;
        }
      }

      setTimeout(() => {
        router.push("/");
      }, 100);
    } catch (error) {
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

        {/* The Boutique Entry Section */}
        <div className="w-full max-w-xl bg-white border border-secondary-100 rounded-[3rem] p-8 md:p-16 shadow-[0_30px_80px_rgba(0,0,0,0.03)] overflow-hidden relative">

          {/* Internal Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-50/50 blur-[100px] pointer-events-none" />

          {/* Heading Section */}
          <div className="relative z-10 flex flex-col items-center text-center mb-12">
            <span className="text-primary-500 font-black tracking-[0.4em] uppercase text-[10px] mb-3">Welcome</span>
            <h1 className="text-4xl md:text-6xl font-black text-secondary-900 tracking-tighter leading-none mb-4">
              SIGN <span className="text-secondary-400 font-serif italic font-normal">IN</span>
            </h1>
            <p className="text-secondary-500 font-serif italic text-lg leading-relaxed">
              Sign in to your account to continue shopping.
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
            {/* Email Field */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em]">Email Address</label>
              </div>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="name@example.com"
                  className="w-full bg-secondary-50 border border-secondary-100 rounded-2xl px-6 py-5 font-black text-secondary-900 placeholder:text-secondary-200 focus:outline-none focus:border-primary-500 transition-all duration-500 group-hover:border-secondary-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em]">Password</label>
                <Link href="/forgot-password" className="text-[9px] font-black text-secondary-400 hover:text-primary-500 uppercase tracking-widest transition-colors">Forgot Password?</Link>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-secondary-50 border border-secondary-100 rounded-2xl px-6 py-5 font-black text-secondary-900 placeholder:text-secondary-200 focus:outline-none focus:border-primary-500 transition-all duration-500 group-hover:border-secondary-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-secondary-300 hover:text-secondary-900 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
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
                {isLoading ? "Signing In..." : "Sign In"}
              </div>
              {!isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              )}
            </button>

            {/* Register Link */}
            <div className="pt-8 text-center">
              <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-4">Don't have an account?</p>
              <Link
                href="/register"
                className="inline-block py-4 px-10 border border-secondary-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-secondary-900 hover:bg-secondary-50 hover:border-secondary-300 transition-all duration-500"
              >
                Create Account
              </Link>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-12 flex items-center gap-8 text-secondary-300">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span className="text-[9px] font-black uppercase tracking-widest">End-to-End Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span className="text-[9px] font-black uppercase tracking-widest">Secure Credentials Vault</span>
          </div>
        </div>
      </div>
    </div>
  );
}
