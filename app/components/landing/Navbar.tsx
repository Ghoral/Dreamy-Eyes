"use client";

import Image from "next/image";
import React, {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import ModalCart from "../modals/ModalCart";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { createSupabaseClient } from "../../services/supabase/client/supabaseBrowserClient";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { state: cartState } = useCart();
  const [navLinks, setNavLinks] = useState([
    { href: "/", label: "Home", isActive: false },
    { href: "/shop", label: "Shop", isActive: false },
    { href: "/about", label: "About", isActive: false },
    { href: "/contact", label: "Contact", isActive: false },
  ]);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Debug: Log cart state changes in Navbar
  useEffect(() => {
    console.log("Navbar - Cart state changed:", cartState);
  }, [cartState]);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsAccountDropdownOpen(false);
    router.push('/');
  };

  const closeOffcanvas = useCallback(() => {
    setIsOffcanvasOpen(false);
  }, []);

  useEffect(() => {
    if (isOffcanvasOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOffcanvasOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === "Escape" && isOffcanvasOpen) {
        closeOffcanvas();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOffcanvasOpen, closeOffcanvas]);

  const toggleOffcanvas = useCallback(() => {
    setIsOffcanvasOpen((prev) => !prev);
  }, []);

  const handleCartOpen = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const handleCartClose = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const handleLinkClick = useCallback(() => {
    if (window.innerWidth < 992) {
      closeOffcanvas();
    }
  }, [closeOffcanvas]);

  useLayoutEffect(() => {
    setNavLinks((prevNavLinks) => {
      const navItemIndex = prevNavLinks.findIndex(
        (item) => item.href === pathname
      );
      if (navItemIndex !== -1) {
        return prevNavLinks.map((item, index) => ({
          ...item,
          isActive: index === navItemIndex,
        }));
      }
      return prevNavLinks;
    });
  }, [pathname]);

  const handleClickNavItems = (value: string) => router.push(value);

  return (
    <>
      <nav
        id="header-nav"
        className={`navbar navbar-expand-lg py-3 position-fixed w-100 top-0 ${
          isScrolled ? "navbar-scrolled" : ""
        }`}
        role="navigation"
        aria-label="Main navigation"
        style={{
          zIndex: 1030,
          transition: "all 0.3s ease",
          backgroundColor: isScrolled
            ? "rgba(255, 255, 255, 0.95)"
            : "rgba(255, 255, 255, 0.98)",
          backdropFilter: isScrolled ? "blur(10px)" : "blur(5px)",
          boxShadow: isScrolled
            ? "0 2px 20px rgba(0,0,0,0.1)"
            : "0 1px 10px rgba(0,0,0,0.05)",
        }}
      >
        <div className="container">
          <Link
            className="navbar-brand fw-bold d-flex align-items-center"
            href="/"
            aria-label="Dreamy Eyes - Home"
          >
            <Image
              src="/images/main-logo.png"
              className="logo me-2"
              alt="Dreamy Eyes logo"
              width={40}
              height={40}
              priority
              sizes="40px"
            />
            <span className="text-primary">Dreamy Eyes</span>
          </Link>

          <button
            className={`navbar-toggler border-0 d-lg-none ${
              isOffcanvasOpen ? "active" : ""
            }`}
            type="button"
            onClick={toggleOffcanvas}
            aria-controls="bdNavbar"
            aria-expanded={isOffcanvasOpen}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {isOffcanvasOpen && (
            <div
              className="offcanvas-backdrop fade show d-lg-none"
              onClick={closeOffcanvas}
              style={{ zIndex: 1040 }}
            />
          )}

          <div
            className={`offcanvas offcanvas-end d-lg-none ${
              isOffcanvasOpen ? "show" : ""
            }`}
            tabIndex={-1}
            id="bdNavbar"
            aria-labelledby="bdNavbarOffcanvasLabel"
            style={{ zIndex: 1045 }}
          >
            <div className="offcanvas-header px-4 pb-3 border-bottom">
              <Link
                className="navbar-brand"
                href="/"
                aria-label="Dreamy Eyes - Home"
                onClick={handleLinkClick}
              >
                <Image
                  src="/images/main-logo.png"
                  className="logo"
                  alt="Dreamy Eyes logo"
                  width={120}
                  height={40}
                  priority
                  sizes="(max-width: 768px) 120px, 150px"
                />
              </Link>
              <button
                type="button"
                className="btn-close btn-close-enhanced"
                onClick={closeOffcanvas}
                aria-label="Close navigation menu"
              />
            </div>

            <div className="offcanvas-body p-0">
              <ul id="navbar" className="navbar-nav mobile-nav" role="menubar">
                {navLinks.map((link) => (
                  <li key={link.label} className="nav-item" role="none">
                    <Link
                      className={`nav-link px-4 py-3 ${
                        link.isActive ? "active" : ""
                      }`}
                      href={link.href}
                      role="menuitem"
                      aria-current={link.isActive ? "page" : undefined}
                      onClick={handleLinkClick}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mobile-user-actions border-top mt-auto p-4">
                <div className="d-flex gap-3 justify-content-center">
                  {user ? (
                    <div className="dropdown w-100">
                      <button
                        type="button"
                        className="btn btn-outline-dark btn-sm flex-fill dropdown-toggle"
                        aria-label="User account"
                        onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="bi bi-person me-2" aria-hidden="true" />
                        Profile
                      </button>
                      <ul className={`dropdown-menu ${isAccountDropdownOpen ? 'show' : ''}`} style={{ minWidth: '200px' }}>
                        <li>
                          <Link 
                            className="dropdown-item d-flex align-items-center gap-2" 
                            href="/profile"
                            onClick={() => {
                              setIsAccountDropdownOpen(false);
                              closeOffcanvas();
                            }}
                          >
                            <i className="bi bi-person-circle"></i>
                            Profile
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button 
                            className="dropdown-item d-flex align-items-center gap-2 text-danger" 
                            onClick={() => {
                              handleSignOut();
                              closeOffcanvas();
                            }}
                          >
                            <i className="bi bi-box-arrow-right"></i>
                            Sign Out
                          </button>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="btn btn-outline-dark btn-sm flex-fill"
                      onClick={closeOffcanvas}
                    >
                      <i className="bi bi-person me-2" aria-hidden="true" />
                      Sign In
                    </Link>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary btn-sm flex-fill"
                    aria-label="Shopping cart"
                    onClick={() => {
                      handleCartOpen();
                      closeOffcanvas();
                    }}
                  >
                    <i className="bi bi-cart-check me-2" aria-hidden="true" />
                    Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="collapse navbar-collapse d-none d-lg-flex justify-content-center flex-grow-1">
            <ul className="navbar-nav text-uppercase">
              {navLinks.map((link) => (
                <li key={link.label} className="nav-item">
                  <Link
                    className={`nav-link me-4 ${link.isActive ? "active" : ""}`}
                    href={link.href}
                    aria-current={link.isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="user-items d-none d-lg-flex">
            <ul className="d-flex justify-content-end list-unstyled mb-0 align-items-center">
              <li className="pe-3">
                <div className="dropdown">
                  <button
                    type="button"
                    className="btn btn-link p-2 text-dark position-relative dropdown-toggle"
                    aria-label="User account"
                    onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i
                      className="bi bi-person"
                      style={{ fontSize: 20 }}
                      aria-hidden="true"
                    />
                  </button>
                  <ul className={`dropdown-menu ${isAccountDropdownOpen ? 'show' : ''}`} style={{ minWidth: '200px' }}>
                    {user ? (
                      <>
                        <li>
                          <Link 
                            className="dropdown-item d-flex align-items-center gap-2" 
                            href="/profile"
                            onClick={() => setIsAccountDropdownOpen(false)}
                          >
                            <i className="bi bi-person-circle"></i>
                            Profile
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button 
                            className="dropdown-item d-flex align-items-center gap-2 text-danger" 
                            onClick={handleSignOut}
                          >
                            <i className="bi bi-box-arrow-right"></i>
                            Sign Out
                          </button>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <Link 
                            className="dropdown-item d-flex align-items-center gap-2" 
                            href="/login"
                            onClick={() => setIsAccountDropdownOpen(false)}
                          >
                            <i className="bi bi-box-arrow-in-right"></i>
                            Sign In
                          </Link>
                        </li>
                        <li>
                          <Link 
                            className="dropdown-item d-flex align-items-center gap-2" 
                            href="/register"
                            onClick={() => setIsAccountDropdownOpen(false)}
                          >
                            <i className="bi bi-person-plus"></i>
                            Register
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-link p-2 text-dark position-relative"
                  aria-label="Shopping cart"
                  onClick={handleCartOpen}
                >
                  <i
                    className="bi bi-cart-check"
                    style={{ fontSize: 20 }}
                    aria-hidden="true"
                  />
                  {cartState.itemCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                      {cartState.itemCount}
                      <span className="visually-hidden">items in cart</span>
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div style={{ height: "80px" }}></div>

      <ModalCart
        isOpen={isCartOpen}
        onCheckout={() => console.log("Checkout clicked")}
        onClose={handleCartClose}
        onViewCart={() => console.log("View cart clicked")}
      />

      <style jsx>{`
        .hamburger-menu {
          position: relative;
          width: 30px;
          height: 30px;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: all 0.3s ease;
        }

        .hamburger-line {
          width: 25px;
          height: 3px;
          background-color: #000;
          margin: 2px 0;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .navbar-toggler.active .hamburger-line:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .navbar-toggler.active .hamburger-line:nth-child(2) {
          opacity: 0;
        }

        .navbar-toggler.active .hamburger-line:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        .navbar-toggler:hover .hamburger-line {
          background-color: #007bff;
        }

        .navbar-scrolled {
          backdrop-filter: blur(15px);
        }

        .offcanvas {
          transition: transform 0.3s ease-in-out;
          width: 320px !important;
        }

        @media (min-width: 992px) {
          .offcanvas,
          .offcanvas-backdrop {
            display: none !important;
          }
        }

        .offcanvas-backdrop {
          background-color: rgba(0, 0, 0, 0.5);
        }

        .mobile-nav .nav-link {
          font-size: 1.1rem;
          font-weight: 500;
          color: #333;
          border-bottom: 1px solid #f8f9fa;
          transition: all 0.3s ease;
          position: relative;
        }

        .mobile-nav .nav-link:hover,
        .mobile-nav .nav-link.active {
          background-color: #f8f9fa;
        }

        .mobile-nav .nav-link.active::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 60%;
          background-color: #007bff;
        }

        .navbar-nav .nav-link {
          position: relative;
          transition: color 0.3s ease;
          font-weight: 500;
        }

        .navbar-nav .nav-link::after {
          content: "";
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -5px;
          left: 50%;
          transition: all 0.3s ease;
          transform: translateX(-50%);
          background-color: #007bff;
        }

        .navbar-nav .nav-link:hover::after,
        .navbar-nav .nav-link.active::after {
          width: 100%;
        }

        .btn-link {
          transition: all 0.2s ease;
        }

        .btn-link:hover {
          transform: translateY(-2px);
        }

        .logo {
          transition: transform 0.3s ease;
        }

        .navbar-brand:hover .logo {
          transform: scale(1.1);
        }
      `}</style>
    </>
  );
};

export default Navbar;
