"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";
import { PhoneNumberUtil, PhoneNumberType } from "google-libphonenumber";
import { useUserCountry } from "../hooks/useUserCountry";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "+977 ",
    country: "Nepal",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const router = useRouter();
  const { country: ipCountry } = useUserCountry();
  const [invalidDomains, setInvalidDomains] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  useEffect(() => {
    if (!ipCountry) return;
    const detected =
      ipCountry.toLowerCase() === "india" ? "India" : "Nepal";
    setFormData((prev) => ({
      ...prev,
      country: detected,
      phone: detected === "India" ? "+91 " : "+977 ",
    }));
  }, [ipCountry]);

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
      }
    };
    loadInvalidDomains();
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneTouched(true);
    const inputValue = e.target.value;
    const digitsOnly = inputValue.replace(/\D/g, "");

    setFormData((prev) => {
      const isIndia = prev.country === "India";
      const prefix = isIndia ? "+91 " : "+977 ";
      const countryCode = isIndia ? "91" : "977";
      let numberDigits = digitsOnly;
      if (numberDigits.startsWith(countryCode)) {
        numberDigits = numberDigits.slice(countryCode.length);
      }
      numberDigits = numberDigits.slice(0, 10);
      const formatted = prefix + numberDigits;
      return {
        ...prev,
        phone: formatted,
      };
    });
    setError("");
  };

  const isEmailDomainAllowed = (email: string) => {
    const domain = email.trim().split("@")[1]?.toLowerCase() || "";
    if (!domain) return false;
    const whitelist = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
    if (whitelist.includes(domain)) return true;
    return !invalidDomains.some((bad) => domain === bad || domain.endsWith("." + bad));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setFormData((prev) => {
      const cleanedPhone = prev.phone.replace(/\D/g, '');
      let formattedPhone = prev.phone;
      let numberWithoutCode = '';

      if (cleanedPhone.startsWith('91')) {
        numberWithoutCode = cleanedPhone.substring(2);
      } else if (cleanedPhone.startsWith('977')) {
        numberWithoutCode = cleanedPhone.substring(3);
      } else if (cleanedPhone.length > 0) {
        numberWithoutCode = cleanedPhone;
      }

      if (numberWithoutCode.length > 0) {
        if (newCountry === "India") {
          if (numberWithoutCode[0] >= '6' && numberWithoutCode[0] <= '9') {
            const validNumber = numberWithoutCode.substring(0, 10);
            formattedPhone = `+91 ${validNumber}`;
          } else {
            formattedPhone = '+91 ';
            setError("Please enter a valid phone number");
          }
        } else {
          if (numberWithoutCode[0] === '9' || numberWithoutCode[0] === '8') {
            const validNumber = numberWithoutCode.substring(0, 10);
            formattedPhone = `+977 ${validNumber}`;
          } else {
            formattedPhone = '+977 ';
            setError("Please enter a valid phone number");
          }
        }
      } else {
        formattedPhone = newCountry === "India" ? '+91 ' : '+977 ';
      }

      return {
        ...prev,
        country: newCountry,
        phone: formattedPhone,
      };
    });
  };

  const isPhoneValid = () => {
    if (!formData.phone || !formData.phone.trim()) return false;
    if (!formData.phone.startsWith('+')) return false;

    const cleanedPhone = formData.phone.replace(/\D/g, '');
    let numberWithoutCode = '';

    if (formData.country === "India") {
      if (!formData.phone.startsWith('+91')) return false;
      if (cleanedPhone.length !== 12) return false;
      numberWithoutCode = cleanedPhone.substring(2);
      if (numberWithoutCode.length !== 10 || (numberWithoutCode[0] < '6' || numberWithoutCode[0] > '9')) return false;
    } else if (formData.country === "Nepal") {
      if (!formData.phone.startsWith('+977')) return false;
      if (cleanedPhone.length !== 13) return false;
      numberWithoutCode = cleanedPhone.substring(3);
      if (numberWithoutCode.length !== 10 || (numberWithoutCode[0] !== '9' && numberWithoutCode[0] !== '8')) return false;
    }

    if (numberWithoutCode.length > 0) {
      const firstDigit = numberWithoutCode[0];
      if (numberWithoutCode.split('').every(digit => digit === firstDigit)) return false;
    }

    try {
      const phoneUtil = PhoneNumberUtil.getInstance();
      const countryCode = formData.country === "India" ? "IN" : "NP";
      const number = phoneUtil.parseAndKeepRawInput(formData.phone, countryCode);
      if (!phoneUtil.isValidNumber(number)) return false;
      const numberType = phoneUtil.getNumberType(number);
      if (numberType !== PhoneNumberType.MOBILE && numberType !== PhoneNumberType.FIXED_LINE_OR_MOBILE) return false;
      return true;
    } catch (error) {
      return false;
    }
  };

  const validateForm = () => {
    if (!formData.firstName || formData.firstName.length < 2) {
      setError("First name must be at least 2 characters");
      return false;
    }
    if (!formData.lastName || formData.lastName.length < 2) {
      setError("Last name must be at least 2 characters");
      return false;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!isEmailDomainAllowed(formData.email)) {
      setError("Email domain is not allowed");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError("Password must contain uppercase, lowercase, and a number");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!isPhoneValid()) {
      setError("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneTouched(true);
    if (!isPhoneValid() || !validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const supabase = createSupabaseClient();
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            mobile_number: formData.phone,
            country: formData.country.toLowerCase(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (user) {
        router.push("/login?message=Account created successfully! Please check your email to verify your account.");
      }
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

      <div className="max-w-[1500px] mx-auto px-6 relative z-10 flex flex-col items-center justify-center pt-10">

        {/* The Boutique Entry Section */}
        <div className="w-full max-w-2xl bg-white border border-secondary-100 rounded-[3rem] p-8 md:p-16 shadow-[0_30px_80px_rgba(0,0,0,0.03)] overflow-hidden relative">

          {/* Internal Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-50/50 blur-[100px] pointer-events-none" />

          {/* Heading Section */}
          <div className="relative z-10 flex flex-col items-center text-center mb-12">
            <span className="text-primary-500 font-black tracking-[0.4em] uppercase text-[10px] mb-3">Welcome</span>
            <h1 className="text-4xl md:text-6xl font-black text-secondary-900 tracking-tighter leading-none mb-4">
              CREATE <span className="text-secondary-400 font-serif italic font-normal">ACCOUNT</span>
            </h1>
            <p className="text-secondary-500 font-serif italic text-lg leading-relaxed">
              Create your account to start shopping.
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-8">

            {/* Name Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em]">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter first name"
                  className="w-full bg-secondary-50 border border-secondary-100 rounded-2xl px-6 py-4 font-black text-secondary-900 placeholder:text-secondary-200 focus:outline-none focus:border-primary-500 transition-all duration-500"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em]">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter last name"
                  className="w-full bg-secondary-50 border border-secondary-100 rounded-2xl px-6 py-4 font-black text-secondary-900 placeholder:text-secondary-200 focus:outline-none focus:border-primary-500 transition-all duration-500"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em]">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="name@example.com"
                className="w-full bg-secondary-50 border border-secondary-100 rounded-2xl px-6 py-5 font-black text-secondary-900 placeholder:text-secondary-200 focus:outline-none focus:border-primary-500 transition-all duration-500"
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em]">Phone Number</label>
              <div className="flex gap-4">
                <div className="flex-shrink-0 relative">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleCountryChange}
                    className="h-16 w-28 bg-secondary-50 border border-secondary-100 rounded-2xl px-4 font-black text-secondary-900 appearance-none focus:outline-none focus:border-primary-500"
                  >
                    <option value="Nepal">🇳🇵 NP</option>
                    <option value="India">🇮🇳 IN</option>
                  </select>
                </div>
                <div className="flex-1 group">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onBlur={() => setPhoneTouched(true)}
                    required
                    placeholder={formData.country === "India" ? "+91 9876543210" : "+977 9876543210"}
                    className={`w-full bg-secondary-50 border h-16 rounded-2xl px-6 font-black text-secondary-900 placeholder:text-secondary-200 focus:outline-none focus:border-primary-500 transition-all ${phoneTouched && !isPhoneValid() ? 'border-red-300 bg-red-50/50' : 'border-secondary-100'}`}
                  />
                </div>
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em]">Password</label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Create password"
                    className="w-full bg-secondary-50 border border-secondary-100 rounded-2xl px-6 py-4 font-black text-secondary-900 focus:outline-none focus:border-primary-500"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-300 hover:text-secondary-900 transition-colors">
                    {showPassword ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.3em]">Confirm Password</label>
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Repeat password"
                    className="w-full bg-secondary-50 border border-secondary-100 rounded-2xl px-6 py-4 font-black text-secondary-900 focus:outline-none focus:border-primary-500"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-300 hover:text-secondary-900 transition-colors">
                    {showConfirmPassword ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`h-20 w-full rounded-3xl font-black text-xs uppercase tracking-[0.4em] transition-all duration-700 relative overflow-hidden group mt-4 ${isLoading
                ? "bg-secondary-100 text-secondary-400 cursor-not-allowed"
                : "bg-primary-500 text-white shadow-[0_20px_40px_rgba(195,78,138,0.2)] hover:shadow-[0_25px_60px_rgba(195,78,138,0.4)] active:scale-[0.98]"
                }`}
            >
              <div className="relative z-10">
                {isLoading ? "Creating Account..." : "Create Account"}
              </div>
              {!isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              )}
            </button>

            {/* Login Link */}
            <div className="pt-8 text-center">
              <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-4">Already have an account?</p>
              <Link
                href="/login"
                className="inline-block py-4 px-10 border border-secondary-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-secondary-900 hover:bg-secondary-50 hover:border-secondary-300 transition-all duration-500"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="my-12 flex flex-wrap justify-center items-center gap-8 text-secondary-300">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span className="text-[9px] font-black uppercase tracking-widest">Biometric Readiness Available</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span className="text-[9px] font-black uppercase tracking-widest">Identity Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
