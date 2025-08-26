"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import ModalCart from "../modals/ModalCart";
import { createSupabaseClient } from "../../services/supabase/client/supabaseBrowserClient";

const Navbar = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { state: cartState } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openCartModal = () => {
    setIsCartModalOpen(true);
  };

  const closeCartModal = () => {
    setIsCartModalOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      const supabase = createSupabaseClient();
      await supabase.auth.signOut();
      setIsProfileMenuOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const cartItemCount = cartState.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-soft"
            : "bg-white/98 backdrop-blur-sm shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-3 group transition-transform duration-300 hover:scale-105"
            >
              <div className="relative w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-2 shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                <Image
                  src="/images/logo.png"
                  alt="Dreamy Eyes Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                  Dreamy Eyes
                </span>
                <span className="text-xs text-secondary-500 font-medium -mt-1">
                  Contact Lenses
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="relative text-secondary-700 font-medium hover:text-primary-500 transition-colors duration-300 group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            {/* Right Side - Cart, Profile & Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              <button
                onClick={openCartModal}
                className="relative p-3 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 transition-all duration-300 group"
              >
                <svg
                  className="w-6 h-6 text-primary-600 group-hover:text-primary-700 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Profile/Account Icon */}
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="p-3 rounded-full bg-gradient-to-r from-secondary-50 to-secondary-100 hover:from-secondary-100 hover:to-secondary-200 transition-all duration-300 group"
                >
                  <svg
                    className="w-6 h-6 text-secondary-600 group-hover:text-secondary-700 transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-secondary-100 py-2 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-3 text-secondary-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile
                    </Link>
                    <Link
                      href="/shipping-address"
                      className="flex items-center px-4 py-3 text-secondary-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Addresses
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center px-4 py-3 text-secondary-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Orders
                    </Link>
                    <div className="border-t border-secondary-100 my-2"></div>
                    <button
                      className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                      onClick={handleLogout}
                    >
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg bg-secondary-50 hover:bg-secondary-100 transition-colors duration-300"
                aria-label="Toggle mobile menu"
              >
                <svg
                  className={`w-6 h-6 text-secondary-600 transition-transform duration-300 ${
                    isMobileMenuOpen ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-white border-t border-secondary-100 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 text-secondary-700 font-medium hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all duration-300"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-secondary-100 space-y-2">
                <button
                  onClick={() => {
                    closeMobileMenu();
                    openCartModal();
                  }}
                  className="w-full flex items-center justify-between py-3 px-4 bg-primary-50 text-primary-700 font-semibold rounded-lg hover:bg-primary-100 transition-colors duration-300"
                >
                  <span>View Cart</span>
                  {cartItemCount > 0 && (
                    <span className="bg-primary-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                      {cartItemCount}
                    </span>
                  )}
                </button>
                <Link
                  href="/profile"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 text-secondary-700 font-medium hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all duration-300"
                >
                  Profile
                </Link>
                <Link
                  href="/shipping-address"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 text-secondary-700 font-medium hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all duration-300"
                >
                  Addresses
                </Link>
                <Link
                  href="/orders"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 text-secondary-700 font-medium hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all duration-300"
                >
                  Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Modal */}
      <ModalCart
        isOpen={isCartModalOpen}
        onClose={closeCartModal}
        onViewCart={() => {
          closeCartModal();
          window.location.href = "/checkout";
        }}
        onCheckout={() => {
          closeCartModal();
          window.location.href = "/checkout";
        }}
      />

      {/* Click outside to close profile menu */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
