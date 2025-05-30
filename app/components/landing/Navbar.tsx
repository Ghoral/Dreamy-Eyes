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

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [navLinks, setNavLinks] = useState([
    { href: "/", label: "Home", isActive: false },
    { href: "/shop", label: "Shop", isActive: false },
    { href: "/about", label: "About", isActive: false },
    { href: "/contact", label: "Contact", isActive: false },
  ]);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const closeOffcanvas = useCallback(() => {
    setIsOffcanvasOpen(false);
    setIsDropdownOpen(false);
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

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
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
    const navItemIndex = navLinks.findIndex((item) => item.href === pathname);
    if (navItemIndex !== -1) {
      const temp = navLinks.map((item, index) => {
        if (index === navItemIndex) {
          return {
            ...item,
            isActive: true,
          };
        }
        return { ...item, isActive: false };
      });

      setNavLinks(temp);
    }
  }, [pathname]);

  const handleClickNavItems = (value: string) => router.push(value);

  console.log("navlinks", navLinks);

  return (
    <>
      <nav
        id="header-nav"
        className="navbar navbar-expand-lg py-3 position-relative"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container">
          <a
            className="navbar-brand fw-bold"
            href="/"
            aria-label="Dreamy Eyes - Home"
          >
            Dreamy Eyes
          </a>

          <button
            className={`navbar-toggler hamburger-menu d-lg-none ${
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
              <a
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
              </a>
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
                      href={link.href}
                      role="menuitem"
                      onClick={handleLinkClick}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mobile-user-actions border-top mt-auto p-4">
                <div className="d-flex gap-3 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm flex-fill"
                    aria-label="User account"
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-person me-2" aria-hidden="true" />
                    Account
                  </button>
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
                  <a
                    className={`nav-link me-4 ${
                      link?.isActive ? "active" : ""
                    }`}
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="user-items d-none d-lg-flex">
            <ul className="d-flex justify-content-end list-unstyled mb-0">
              <li className="pe-3">
                <button
                  type="button"
                  className="btn btn-link p-2 text-dark"
                  aria-label="User account"
                  onClick={() => handleClickNavItems("/login")}
                >
                  <i
                    className="bi bi-person"
                    style={{ fontSize: 20 }}
                    aria-hidden="true"
                  />
                </button>
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
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                    2<span className="visually-hidden">items in cart</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

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

        .hamburger-menu.active .hamburger-line:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .hamburger-menu.active .hamburger-line:nth-child(2) {
          opacity: 0;
        }

        .hamburger-menu.active .hamburger-line:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        .hamburger-menu:hover .hamburger-line {
          background-color: #007bff;
        }

        /* Enhanced Offcanvas Styles */
        .offcanvas {
          transition: transform 0.3s ease-in-out;
          width: 320px !important;
        }

        /* Hide offcanvas on desktop */
        @media (min-width: 992px) {
          .offcanvas,
          .offcanvas-backdrop {
            display: none !important;
          }
        }

        .offcanvas-backdrop {
          background-color: rgba(0, 0, 0, 0.5);
        }

        /* Mobile Navigation Styles */
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

        /* Enhanced Dropdown Styles */
        .dropdown-enhanced .dropdown-toggle {
          font-size: 1.1rem;
          font-weight: 500;
          color: #333;
          border-bottom: 1px solid #f8f9fa;
          transition: all 0.3s ease;
        }

        .dropdown-enhanced .dropdown-toggle:hover {
          color: #007bff;
          background-color: #f8f9fa;
        }

        .dropdown-menu-enhanced {
          background-color: #f8f9fa;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .dropdown-menu-enhanced.show {
          max-height: 400px;
        }

        .dropdown-item-enhanced {
          display: block;
          color: #666;
          text-decoration: none;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          border-bottom: 1px solid #e9ecef;
        }

        .dropdown-item-enhanced:hover {
          color: #007bff;
          background-color: #e9ecef;
        }

        /* Enhanced Close Button */
        .btn-close-enhanced {
          background-size: 1.2em;
          opacity: 0.8;
          transition: all 0.2s ease;
        }

        .btn-close-enhanced:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        /* Mobile User Actions */
        .mobile-user-actions {
          background-color: #f8f9fa;
        }

        /* Desktop Navigation Improvements */
        @media (min-width: 992px) {
          .navbar-nav .nav-link {
            position: relative;
            transition: color 0.3s ease;
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
          }

          .navbar-nav .nav-link:hover::after,
          .navbar-nav .nav-link.active::after {
            width: 100%;
          }

          .dropdown-menu {
            border: none;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
          }
        }

        /* Smooth Animations */
        * {
          -webkit-tap-highlight-color: transparent;
        }

        .nav-link,
        .btn {
          transition: all 0.2s ease;
        }
      `}</style>
    </>
  );
};

export default Navbar;
