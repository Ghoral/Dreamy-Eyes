import Image from "next/image";
import React from "react";

const Navbar = () => {
  return (
    <nav id="header-nav" className="navbar navbar-expand-lg py-3">
      <div className="container">
        <a className="navbar-brand" href="index.html">
          Dreamy Eyes
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarToggleExternalContent"
          aria-controls="navbarToggleExternalContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="offcanvas offcanvas-end"
          tabIndex={-1}
          id="bdNavbar"
          aria-labelledby="bdNavbarOffcanvasLabel"
        >
          <div className="offcanvas-header px-4 pb-0">
            <a className="navbar-brand" href="index.html">
              <Image
                src="/images/main-logo.png"
                className="logo"
                alt="main-logo"
                width={500}
                height={500}
              />
            </a>
            <button
              type="button"
              className="btn-close btn-close-black"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
              data-bs-target="#bdNavbar"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul
              id="navbar"
              className="navbar-nav text-uppercase justify-content-start justify-content-lg-center align-items-start align-items-lg-center flex-grow-1"
            >
              <li className="nav-item">
                <a className="nav-link me-4 active" href="index.html">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link me-4" href="index.html">
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link me-4" href="index.html">
                  Shop
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link me-4" href="index.html">
                  Blogs
                </a>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link me-4 dropdown-toggle"
                  data-bs-toggle="dropdown"
                  href="#"
                  role="button"
                  aria-expanded="false"
                >
                  Pages
                </a>
                <ul className="dropdown-menu animate slide border">
                  <li>
                    <a href="index.html" className="dropdown-item fw-light">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="index.html" className="dropdown-item fw-light">
                      Shop
                    </a>
                  </li>
                  <li>
                    <a href="index.html" className="dropdown-item fw-light">
                      Single Product
                    </a>
                  </li>
                  <li>
                    <a href="index.html" className="dropdown-item fw-light">
                      Cart
                    </a>
                  </li>
                  <li>
                    <a href="index.html" className="dropdown-item fw-light">
                      Checkout
                    </a>
                  </li>
                  <li>
                    <a href="index.html" className="dropdown-item fw-light">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="index.html" className="dropdown-item fw-light">
                      Single Post
                    </a>
                  </li>
                  <li>
                    <a href="index.html" className="dropdown-item fw-light">
                      Contact
                    </a>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <a className="nav-link me-4" href="index.html">
                  Contact
                </a>
              </li>
            </ul>
            <div className="user-items d-flex">
              <ul className="d-flex justify-content-end list-unstyled mb-0">
                <li className="search-item pe-3">
                  <a href="#" className="search-button">
                    <svg className="search">
                      <use xlinkHref="#search"></use>
                    </svg>
                  </a>
                </li>
                <li className="pe-3">
                  <a
                    href="#"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                  >
                    <svg className="user">
                      <use xlinkHref="#user"></use>
                    </svg>
                  </a>

                  <div
                    className="modal fade"
                    id="exampleModal"
                    tabIndex={-1}
                    aria-labelledby="exampleModalLabel"
                    aria-hidden="true"
                  >
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header border-bottom-0">
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          ></button>
                        </div>
                        <div className="modal-body">
                          <div className="tabs-listing">
                            <nav>
                              <div
                                className="nav nav-tabs d-flex justify-content-center"
                                id="nav-tab"
                                role="tablist"
                              >
                                <button
                                  className="nav-link text-capitalize active"
                                  id="nav-sign-in-tab"
                                  data-bs-toggle="tab"
                                  data-bs-target="#nav-sign-in"
                                  type="button"
                                  role="tab"
                                  aria-controls="nav-sign-in"
                                  aria-selected="true"
                                >
                                  Sign In
                                </button>
                                <button
                                  className="nav-link text-capitalize"
                                  id="nav-register-tab"
                                  data-bs-toggle="tab"
                                  data-bs-target="#nav-register"
                                  type="button"
                                  role="tab"
                                  aria-controls="nav-register"
                                  aria-selected="false"
                                >
                                  Register
                                </button>
                              </div>
                            </nav>
                            <div className="tab-content" id="nav-tabContent">
                              <div
                                className="tab-pane fade active show"
                                id="nav-sign-in"
                                role="tabpanel"
                                aria-labelledby="nav-sign-in-tab"
                              >
                                <div className="form-group py-3">
                                  <label className="mb-2" htmlFor="sign-in">
                                    Username or email address *
                                  </label>
                                  <input
                                    type="text"
                                    min="2"
                                    name="username"
                                    placeholder="Your Username"
                                    className="form-control w-100 rounded-3 p-3"
                                    required
                                  />
                                </div>
                                <div className="form-group pb-3">
                                  <label className="mb-2" htmlFor="sign-in">
                                    Password *
                                  </label>
                                  <input
                                    type="password"
                                    min="2"
                                    name="password"
                                    placeholder="Your Password"
                                    className="form-control w-100 rounded-3 p-3"
                                    required
                                  />
                                </div>
                                <label className="py-3">
                                  <input type="checkbox" className="d-inline" />
                                  <span className="label-body">
                                    Remember me
                                  </span>
                                  <span className="label-body">
                                    <a href="#" className="fw-bold">
                                      Forgot Password
                                    </a>
                                  </span>
                                </label>
                                <button
                                  type="submit"
                                  name="submit"
                                  className="btn btn-dark w-100 my-3"
                                >
                                  Login
                                </button>
                              </div>
                              <div
                                className="tab-pane fade"
                                id="nav-register"
                                role="tabpanel"
                                aria-labelledby="nav-register-tab"
                              >
                                <div className="form-group py-3">
                                  <label className="mb-2" htmlFor="register">
                                    Your email address *
                                  </label>
                                  <input
                                    type="text"
                                    min="2"
                                    name="username"
                                    placeholder="Your Email Address"
                                    className="form-control w-100 rounded-3 p-3"
                                    required
                                  />
                                </div>
                                <div className="form-group pb-3">
                                  <label className="mb-2" htmlFor="sign-in">
                                    Password *
                                  </label>
                                  <input
                                    type="password"
                                    min="2"
                                    name="password"
                                    placeholder="Your Password"
                                    className="form-control w-100 rounded-3 p-3"
                                    required
                                  />
                                </div>
                                <label className="py-3">
                                  <input type="checkbox" className="d-inline" />
                                  <span className="label-body">
                                    I agree to the{" "}
                                    <a href="#" className="fw-bold">
                                      Privacy Policy
                                    </a>
                                  </span>
                                </label>
                                <button
                                  type="submit"
                                  name="submit"
                                  className="btn btn-dark w-100 my-3"
                                >
                                  Register
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="wishlist-dropdown dropdown pe-3">
                  <a
                    href="#"
                    className="dropdown-toggle"
                    data-bs-toggle="dropdown"
                    role="button"
                    aria-expanded="false"
                  >
                    <svg className="wishlist">
                      <use xlinkHref="#heart"></use>
                    </svg>
                  </a>
                  <div className="dropdown-menu animate slide dropdown-menu-start dropdown-menu-lg-end p-3">
                    <h4 className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-primary">Your wishlist</span>
                      <span className="badge bg-primary rounded-pill">2</span>
                    </h4>
                    <ul className="list-group mb-3">
                      <li className="list-group-item bg-transparent d-flex justify-content-between lh-sm">
                        <div>
                          <h5>
                            <a href="index.html">The Emerald Crown</a>
                          </h5>
                          <small>Special discounted price.</small>
                          <a
                            href="#"
                            className="d-block fw-medium text-capitalize mt-2"
                          >
                            Add to cart
                          </a>
                        </div>
                        <span className="text-primary">$2000</span>
                      </li>
                      <li className="list-group-item bg-transparent d-flex justify-content-between lh-sm">
                        <div>
                          <h5>
                            <a href="index.html">The Last Enchantment</a>
                          </h5>
                          <small>Perfect for enlightened people.</small>
                          <a
                            href="#"
                            className="d-block fw-medium text-capitalize mt-2"
                          >
                            Add to cart
                          </a>
                        </div>
                        <span className="text-primary">$400</span>
                      </li>
                      <li className="list-group-item bg-transparent d-flex justify-content-between">
                        <span className="text-capitalize">
                          <b>Total (USD)</b>
                        </span>
                        <strong>$1470</strong>
                      </li>
                    </ul>
                    <div className="d-flex flex-wrap justify-content-center">
                      <a
                        href="#"
                        className="w-100 btn btn-dark mb-1"
                        type="submit"
                      >
                        Add all to cart
                      </a>
                      <a
                        href="index.html"
                        className="w-100 btn btn-primary"
                        type="submit"
                      >
                        View cart
                      </a>
                    </div>
                  </div>
                </li>
                <li className="cart-dropdown dropdown">
                  <a
                    href="index.html"
                    className="dropdown-toggle"
                    data-bs-toggle="dropdown"
                    role="button"
                    aria-expanded="false"
                  >
                    <svg className="cart">
                      <use xlinkHref="#cart"></use>
                    </svg>
                    {/* <span className="fs-6 fw-light">(02)</span> */}
                  </a>
                  <div className="dropdown-menu animate slide dropdown-menu-start dropdown-menu-lg-end p-3">
                    <h4 className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-primary">Your cart</span>
                      <span className="badge bg-primary rounded-pill">2</span>
                    </h4>
                    <ul className="list-group mb-3">
                      <li className="list-group-item bg-transparent d-flex justify-content-between lh-sm">
                        <div>
                          <h5>
                            <a href="index.html">Secrets of the Alchemist</a>
                          </h5>
                          <small>High quality in good price.</small>
                        </div>
                        <span>$870</span>
                      </li>
                      <li className="list-group-item bg-transparent d-flex justify-content-between lh-sm">
                        <div>
                          <h5>
                            <a href="index.html">Quest for the Lost City</a>
                          </h5>
                          <small>Professional Quest for the Lost City.</small>
                        </div>
                        <span className="text-primary">$600</span>
                      </li>
                      <li className="list-group-item bg-transparent d-flex justify-content-between">
                        <span className="text-capitalize">
                          <b>Total (USD)</b>
                        </span>
                        <strong>$1470</strong>
                      </li>
                    </ul>
                    <div className="d-flex flex-wrap justify-content-center">
                      <a
                        href="index.html"
                        className="w-100 btn btn-dark mb-1"
                        type="submit"
                      >
                        View Cart
                      </a>
                      <a
                        href="index.html"
                        className="w-100 btn btn-primary"
                        type="submit"
                      >
                        Go to checkout
                      </a>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
