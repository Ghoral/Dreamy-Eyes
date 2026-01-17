"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "../../context/CartContext";
import ModalCart from "../modals/ModalCart";
import { createSupabaseClient } from "../../services/supabase/client/supabaseBrowserClient";
import { useUserCountry } from "../../hooks/useUserCountry";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { state: cartState, setOffer } = useCart();
  const { country } = useUserCountry();

  // Certain pages should always have the "scrolled" (solid/dark) navbar style
  const isWhitePage = [
    "/login",
    "/register",
    "/checkout",
    "/forgot-password",
    "/reset-password",
    "/profile",
    "/shipping-address"
  ].includes(pathname) || /^\/[^/]+$/.test(pathname); // Matches dynamic [id] product pages (single slug)
  // const shouldShowDarkNav = isScrolled || (pathname !== "/" && isWhitePage);
  const shouldShowDarkNav = true; // Force dark mode for visibility on light theme

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const supabase = createSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
    const supabase = createSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setIsAuthenticated(!!session?.user));
    return () => subscription.unsubscribe();
  }, []);

  const cartItemCount = cartState.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-4 md:px-12 py-4 ${shouldShowDarkNav
          ? "bg-white/80 backdrop-blur-2xl shadow-glow md:shadow-none py-4"
          : "bg-transparent py-6"
          }`}
      >
        <div className="max-w-[1800px] mx-auto">
          <div className="flex justify-between items-center">
            {/* Menu Button (Mobile) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden p-2 rounded-full transition-colors ${shouldShowDarkNav ? "text-secondary-900" : "text-white"}`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>

            {/* Nav Links (Desktop Left) */}
            <div className="hidden lg:flex items-center gap-10">
              {["Home", "About"].map((item) => (
                <Link
                  key={item}
                  href={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
                  className={`text-sm font-black tracking-widest uppercase transition-all duration-300 hover:text-primary-500 ${shouldShowDarkNav ? "text-secondary-900" : "text-white"
                    }`}
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 transition-transform hover:scale-110 duration-500">
              <div className={`flex flex-col items-center transition-all duration-500 ${shouldShowDarkNav ? "scale-90" : "scale-100"}`}>
                <span className={`text-3xl md:text-4xl font-black tracking-tighter uppercase font-serif drop-shadow-md ${shouldShowDarkNav ? "text-secondary-900" : "text-white"
                  }`}>
                  Dreamy <span className="text-primary-500">Eyes</span>
                </span>
                <div className={`h-0.5 w-12 bg-primary-500 transition-all duration-500 ${shouldShowDarkNav ? "opacity-100" : "opacity-0"}`} />
              </div>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-4 md:gap-8">
              {/* Desktop Applied Offer Info */}
              {cartState.selectedOffer && (
                <div className={`hidden md:flex items-center gap-2 pl-3 md:pl-4 pr-2 py-1 md:py-1.5 rounded-full border transition-all duration-500 group/offer ${shouldShowDarkNav ? "bg-primary-50 border-primary-100 shadow-sm" : "bg-white/10 border-white/20 backdrop-blur-md"
                  }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary-500 rounded-full animate-pulse" />
                    <span className={`text-[9px] md:text-[10px] font-black tracking-widest uppercase ${shouldShowDarkNav ? "text-primary-600" : "text-white"
                      }`}>
                      {cartState.selectedOffer.name || cartState.selectedOffer.title || "OFFER ACTIVE"}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOffer(null, []);
                    }}
                    className={`p-1 rounded-full transition-all duration-300 ${shouldShowDarkNav ? "hover:bg-primary-100 text-primary-400" : "hover:bg-white/20 text-white/50"}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsCartModalOpen(true)}
                className={`relative group transition-transform hover:scale-110 ${shouldShowDarkNav ? "text-secondary-900" : "text-white"}`}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`hidden md:block transition-transform hover:scale-110 ${shouldShowDarkNav ? "text-secondary-900" : "text-white"}`}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </button>
            </div>
          </div>

          {/* Mobile Offer Badge - Dedicated centered row */}
          {cartState.selectedOffer && (
            <div className="md:hidden mt-4 flex justify-center animate-in fade-in slide-in-from-top-2 duration-500">
              <div className={`flex items-center gap-3 pl-4 pr-2 py-1.5 rounded-full border ${shouldShowDarkNav ? "bg-primary-50 border-primary-100 shadow-sm" : "bg-white/10 border-white/20 backdrop-blur-md"
                }`}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                  <span className={`text-[9px] font-black tracking-widest uppercase ${shouldShowDarkNav ? "text-primary-600" : "text-white"
                    }`}>
                    {cartState.selectedOffer.name || cartState.selectedOffer.title || "OFFER ACTIVE"}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOffer(null, []);
                  }}
                  className={`p-1 rounded-full transition-all duration-300 ${shouldShowDarkNav ? "hover:bg-primary-100 text-primary-400" : "hover:bg-white/20 text-white/50"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Sidebar Navigation */}
      <div className={`fixed inset-0 z-[60] transition-opacity duration-500 ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`absolute top-0 left-0 bottom-0 w-full max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-soft-spring ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <span className="text-2xl font-black tracking-tighter text-secondary-900">DREAMY EYES</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-secondary-50 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex flex-col gap-8">
              {["Home", "About", "Contact"].map((item) => (
                <Link
                  key={item}
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-4xl font-black text-secondary-900 hover:text-primary-500 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className="mt-auto pt-12 border-t border-secondary-100 flex gap-6">
            </div>
          </div>
        </div>
      </div>

      <ModalCart
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        onViewCart={() => { setIsCartModalOpen(false); router.push("/checkout"); }}
        onCheckout={() => { setIsCartModalOpen(false); router.push("/checkout"); }}
      />

      {isProfileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setIsProfileMenuOpen(false)}>
          <div
            className="absolute top-20 right-12 w-64 bg-white rounded-3xl shadow-2xl border border-secondary-50 py-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {isAuthenticated ? (
              <>
                <Link href="/profile" className="flex items-center px-6 py-4 hover:bg-secondary-50 transition-colors font-black text-secondary-900">
                  <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  PROFILE
                </Link>
                <button onClick={async () => { await createSupabaseClient().auth.signOut(); setIsAuthenticated(false); setIsProfileMenuOpen(false); router.push('/login'); }} className="w-full flex items-center px-6 py-4 hover:bg-red-50 text-red-500 transition-colors font-black">
                  <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  LOGOUT
                </button>
              </>
            ) : (
              <Link href="/login" className="flex items-center px-6 py-4 hover:bg-primary-50 text-primary-600 transition-colors font-black">
                <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                SIGN IN
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
