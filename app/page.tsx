"use client";

import TikTokCarousel from "./components/landing/TikTokCarousel";
import ItemListing from "./components/landing/ItemListing";
import ProductItems from "./components/landing/ProductItems";
import BillboardCarousel from "./components/landing/Swiper";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <header id="header" className="site-header">
        <div className="top-info border-bottom d-none d-md-block ">
          <div className="container-fluid">
            <div className="row g-0">
              <div className="col-md-4">
                <p className="fs-6 my-2 text-center">
                  Need any help? Call us <span>112233344455</span>
                </p>
              </div>
              <div className="col-md-4 border-start border-end">
                <p className="fs-6 my-2 text-center">
                  Summer sale discount off 60% off! Shop Now
                </p>
              </div>
              <div className="col-md-4">
                <p className="fs-6 my-2 text-center">
                  2-3 business days delivery & free returns
                </p>
              </div>
            </div>
          </div>
        </div>

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
                                <div
                                  className="tab-content"
                                  id="nav-tabContent"
                                >
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
                                      <input
                                        type="checkbox"
                                        className="d-inline"
                                      />
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
                                      <label
                                        className="mb-2"
                                        htmlFor="register"
                                      >
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
                                      <input
                                        type="checkbox"
                                        className="d-inline"
                                      />
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
                          <span className="badge bg-primary rounded-pill">
                            2
                          </span>
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
                          <span className="badge bg-primary rounded-pill">
                            2
                          </span>
                        </h4>
                        <ul className="list-group mb-3">
                          <li className="list-group-item bg-transparent d-flex justify-content-between lh-sm">
                            <div>
                              <h5>
                                <a href="index.html">
                                  Secrets of the Alchemist
                                </a>
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
                              <small>
                                Professional Quest for the Lost City.
                              </small>
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
      </header>
      <BillboardCarousel />
      <section id="company-services" className="pb-0" style={{ marginTop: 48 }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6 pb-3 pb-lg-0">
              <div className="icon-box d-flex">
                <div className="icon-box-icon pe-3 pb-3">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        d="M7.50626 15.2647C7.61657 15.6639 8.02965 15.8982 8.4289 15.7879C8.82816 15.6776 9.06241 15.2645 8.9521 14.8652L7.50626 15.2647ZM6.07692 7.27442L6.79984 7.0747V7.0747L6.07692 7.27442ZM4.7037 5.91995L4.50319 6.64265L4.7037 5.91995ZM3.20051 4.72457C2.80138 4.61383 2.38804 4.84762 2.2773 5.24675C2.16656 5.64589 2.40035 6.05923 2.79949 6.16997L3.20051 4.72457ZM20.1886 15.7254C20.5895 15.6213 20.8301 15.2118 20.7259 14.8109C20.6217 14.41 20.2123 14.1695 19.8114 14.2737L20.1886 15.7254ZM10.1978 17.5588C10.5074 18.6795 9.82778 19.8618 8.62389 20.1747L9.00118 21.6265C10.9782 21.1127 12.1863 19.1239 11.6436 17.1594L10.1978 17.5588ZM8.62389 20.1747C7.41216 20.4896 6.19622 19.7863 5.88401 18.6562L4.43817 19.0556C4.97829 21.0107 7.03196 22.1383 9.00118 21.6265L8.62389 20.1747ZM5.88401 18.6562C5.57441 17.5355 6.254 16.3532 7.4579 16.0403L7.08061 14.5885C5.10356 15.1023 3.89544 17.0911 4.43817 19.0556L5.88401 18.6562ZM7.4579 16.0403C8.66962 15.7254 9.88556 16.4287 10.1978 17.5588L11.6436 17.1594C11.1035 15.2043 9.04982 14.0768 7.08061 14.5885L7.4579 16.0403ZM8.9521 14.8652L6.79984 7.0747L5.354 7.47414L7.50626 15.2647L8.9521 14.8652ZM4.90421 5.19725L3.20051 4.72457L2.79949 6.16997L4.50319 6.64265L4.90421 5.19725ZM6.79984 7.0747C6.54671 6.15847 5.8211 5.45164 4.90421 5.19725L4.50319 6.64265C4.92878 6.76073 5.24573 7.08223 5.354 7.47414L6.79984 7.0747ZM11.1093 18.085L20.1886 15.7254L19.8114 14.2737L10.732 16.6332L11.1093 18.085Z"
                        fill="#ff3333"
                      ></path>{" "}
                      <path
                        d="M19.1647 6.2358C18.6797 4.48023 18.4372 3.60244 17.7242 3.20319C17.0113 2.80394 16.1062 3.03915 14.2962 3.50955L12.3763 4.00849C10.5662 4.47889 9.66119 4.71409 9.24954 5.40562C8.8379 6.09714 9.0804 6.97492 9.56541 8.73049L10.0798 10.5926C10.5648 12.3481 10.8073 13.2259 11.5203 13.6252C12.2333 14.0244 13.1384 13.7892 14.9484 13.3188L16.8683 12.8199C18.6784 12.3495 19.5834 12.1143 19.995 11.4227C20.2212 11.0429 20.2499 10.6069 20.1495 10"
                        stroke="#ff3333"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      ></path>{" "}
                    </g>
                  </svg>
                </div>
                <div className="icon-box-content">
                  <h4 className="card-title mb-1 text-capitalize text-dark">
                    Free delivery
                  </h4>
                  <p>Consectetur adipi elit lorem ipsum dolor sit amet.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 pb-3 pb-lg-0">
              <div className="icon-box d-flex">
                <div className="icon-box-icon pe-3 pb-3">
                  <svg
                    fill="#ff3333"
                    height="200px"
                    width="200px"
                    version="1.1"
                    id="Layer_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xlinkHref="http://www.w3.org/1999/xlink"
                    viewBox="0 0 512.001 512.001"
                    xmlSpace="preserve"
                    stroke="#ff3333"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <g>
                        {" "}
                        <g>
                          {" "}
                          <g>
                            {" "}
                            <path d="M331.881,138.479l-41.577-6.042l-18.593-37.675c-6.413-12.995-25.004-13.003-31.421,0l-18.593,37.675l-41.577,6.042 c-14.34,2.084-20.093,19.761-9.709,29.882l30.086,29.325l-7.102,41.409c-2.449,14.282,12.585,25.216,25.42,18.469l37.188-19.551 l37.188,19.551c12.782,6.724,27.879-4.118,25.418-18.469l-7.102-41.409l30.086-29.325 C351.967,158.247,346.23,140.564,331.881,138.479z M278.072,210.032c-23.589-12.401-19.839-12.776-44.144,0 c4.503-26.246,6.033-22.806-13.641-41.984c27.141-3.944,23.919-2.049,35.713-25.946c11.815,23.94,8.578,22.003,35.713,25.946 C272.595,186.684,273.437,183.006,278.072,210.032z"></path>{" "}
                            <path d="M509.618,404.762l-105.84-183.328C437.21,121,362.258,16.569,256,16.569c-106.281,0-181.197,104.464-147.778,204.863 L2.382,404.762c-7.441,12.888,3.632,28.647,18.289,26l68.417-12.37l23.488,65.441c5.021,13.986,24.184,15.794,31.661,2.842 l92.32-159.904c12.954,1.605,25.922,1.605,38.884,0l92.32,159.904c7.476,12.95,26.64,11.149,31.661-2.842l23.488-65.441 l68.417,12.37C505.976,433.407,517.065,417.66,509.618,404.762z M132.79,436.426l-15.732-43.831 c-2.89-8.051-11.174-12.845-19.607-11.321l-45.833,8.287l75.192-130.243c17.889,26.661,43.956,47.345,74.314,58.75 L132.79,436.426z M143.757,216.688C112.446,137.602,170.649,51.607,256,51.607c85.417,0,143.537,86.038,112.244,165.08 C327.705,319.048,183.623,317.357,143.757,216.688z M414.549,381.273c-8.422-1.521-16.715,3.264-19.607,11.321l-15.732,43.831 l-68.335-118.36c29.649-11.209,55.037-30.548,74.314-58.75l75.192,130.243L414.549,381.273z"></path>{" "}
                          </g>{" "}
                        </g>{" "}
                      </g>{" "}
                    </g>
                  </svg>
                </div>
                <div className="icon-box-content">
                  <h4 className="card-title mb-1 text-capitalize text-dark">
                    Quality guarantee
                  </h4>
                  <p>Dolor sit amet orem ipsu mcons ectetur adipi elit.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 pb-3 pb-lg-0">
              <div className="icon-box d-flex">
                <div className="icon-box-icon pe-3 pb-3">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#ff3333"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        d="M8 8H8.01M11.5858 4.58579L19.5858 12.5858C20.3668 13.3668 20.3668 14.6332 19.5858 15.4142L15.4142 19.5858C14.6332 20.3668 13.3668 20.3668 12.5858 19.5858L4.58579 11.5858C4.21071 11.2107 4 10.702 4 10.1716V6C4 4.89543 4.89543 4 6 4H10.1716C10.702 4 11.2107 4.21071 11.5858 4.58579Z"
                        stroke="#ff3333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                    </g>
                  </svg>
                </div>
                <div className="icon-box-content">
                  <h4 className="card-title mb-1 text-capitalize text-dark">
                    Daily offers
                  </h4>
                  <p>Amet consectetur adipi elit loreme ipsum dolor sit.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 pb-3 pb-lg-0">
              <div className="icon-box d-flex">
                <div className="icon-box-icon pe-3 pb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlSpace="preserve"
                    id="_x32_"
                    fill="#f33"
                    viewBox="0 0 512 512"
                  >
                    <g id="SVGRepo_iconCarrier">
                      <style>{".st0{fill:#f33}"}</style>
                      <path
                        d="M335.859 68.875s4.656-12.469 29.734-28.297c24.063-15.172 5.594-36.141-29.734-28.422C311.469 17.469 319.75 0 285.547 0s-25.922 17.469-50.313 12.156c-35.328-7.719-53.797 13.25-29.734 28.422 25.078 15.828 29.734 28.297 29.734 28.297h100.625zM432.063 224.453c0-7.141-4.234-13.281-10.328-16.109 6.094-2.844 10.344-8.969 10.344-16.109 0-7.156-4.25-13.297-10.344-16.125 6.078-2.828 10.328-8.953 10.328-16.125 0-9.828-7.969-17.797-17.813-17.797h-59.375c-9.828 0-17.813 7.969-17.813 17.797 0 7.172 4.25 13.297 10.344 16.125-6.094 2.828-10.344 8.969-10.344 16.125 0 7.141 4.25 13.266 10.344 16.109-6.094 2.828-10.344 8.969-10.344 16.109 0 7.156 4.25 13.297 10.344 16.109-6.094 2.844-10.344 8.969-10.344 16.125 0 9.844 7.984 17.813 17.813 17.813h59.375c9.828 0 17.813-7.969 17.813-17.813 0-7.156-4.25-13.281-10.328-16.109 6.078-2.828 10.328-8.969 10.328-16.125zM346.203 89.641h-113.25c-48.969 0-62.656 38.328-100.578 38.328V249.61l16.578-.766c126.688-9.813 115.625-119.188 115.625-119.188h71.094c40.016 0 42.125-40.015 10.531-40.015zM64.703 113.75h50.563v164.281H64.703zM309.906 368.781c3.984-2.813 5.984-7.266 5.984-13.391 0-6.344-1.797-10.859-5.391-13.563-3.594-2.688-9.219-4.047-16.859-4.047h-15.89V373h14.641c7.687 0 13.531-1.406 17.515-4.219zM314.938 393.266c-1.797-1.484-4.094-2.641-6.906-3.422s-6.203-1.172-10.188-1.172H277.75v35.719h20.172c4.219 0 7.734-.516 10.578-1.516 2.828-1.016 5.109-2.359 6.813-4.047 1.719-1.688 2.953-3.641 3.703-5.891.766-2.25 1.141-4.641 1.141-7.172 0-2.641-.422-5.016-1.266-7.109-.828-2.109-2.157-3.906-3.953-5.39z"
                        className="st0"
                      />
                      <path
                        d="M432.891 288.344c-5.469 3.219-11.828 5.125-18.641 5.125h-59.375c-20.266 0-36.766-16.5-36.766-36.781a36.373 36.373 0 0 1 3.766-16.109 36.373 36.373 0 0 1 0-32.234 36.379 36.379 0 0 1 0-32.234 36.614 36.614 0 0 1-3.766-16.125c0-3.969.641-7.781 1.813-11.359h-36.75c-1.703 18.797-7.984 47.141-28.594 71.813-22.453 26.844-55.891 42.531-99.313 46.813-14.125 27.375-24.203 56.891-24.203 86.625 0 87.328 70.797 158.125 158.109 158.125 87.328 0 158.125-70.797 158.125-158.125.001-22.253-5.671-44.347-14.405-65.534zm-90.438 132.25c-1.969 4.391-4.828 8.156-8.594 11.344-3.75 3.172-8.391 5.656-13.906 7.453-5.484 1.797-11.781 2.688-18.859 2.688h-2.484v12.328h-19.25v-12.328h-32.219v-9.891c0-2.922-.188-4.672 2.609-5.281.25-.047.609-.094 1.063-.188.469-.094 1.297-.234 2.516-.453 1.203-.219-.344-.516 1.766-.891v-88.422c-2.109-.359-.563-.656-1.766-.875-1.219-.234-2.047-.359-2.516-.453-.453-.078-.813-.156-1.063-.188-2.797-.594-2.609-2.359-2.609-5.281v-9.891h32.219v-13.172h19.25v13.281c5.875.25 11.031.969 15.453 2.156 5.656 1.516 10.297 3.688 13.906 6.5 3.625 2.797 6.281 6.188 7.953 10.188 1.703 3.984 2.531 8.469 2.531 13.469 0 2.875-.406 5.609-1.25 8.219a24.38 24.38 0 0 1-3.922 7.344c-1.781 2.266-4.016 4.328-6.75 6.188-2.719 1.844-6.234 4.719-6.234 4.719 16.734 3.75 25.109 12.797 25.109 27.125 0 5.156-.984 9.937-2.953 14.312z"
                        className="st0"
                      />
                    </g>
                  </svg>
                </div>
                <div className="icon-box-content">
                  <h4 className="card-title mb-1 text-capitalize text-dark">
                    100% secure payment
                  </h4>
                  <p>Rem Lopsum dolor sit amet, consectetur adipi elit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ItemListing />
      <TikTokCarousel />
      <ProductItems />
      {/* <section
        id="limited-offer"
        className="padding-large"
        style={{
          backgroundImage: "url(images/banner-image-bg-1.jpg)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          height: "800px",
        }}
      >
        <div className="container">
          <div className="row d-flex align-items-center">
            <div className="col-md-6 text-center">
              <div className="image-holder">
                <img
                  src="images/banner-image3.png"
                  className="img-fluid"
                  alt="banner"
                />
              </div>
            </div>
            <div className="col-md-5 offset-md-1 mt-5 mt-md-0 text-center text-md-start">
              <h2>30% Discount on all items. Hurry Up !!!</h2>
              <div
                id="countdown-clock"
                className="text-dark d-flex align-items-center my-3"
              >
                <div className="time d-grid pe-3">
                  <span className="days fs-1 fw-normal"></span>
                  <small>Days</small>
                </div>
                <span className="fs-1 text-primary">:</span>
                <div className="time d-grid pe-3 ps-3">
                  <span className="hours fs-1 fw-normal"></span>
                  <small>Hrs</small>
                </div>
                <span className="fs-1 text-primary">:</span>
                <div className="time d-grid pe-3 ps-3">
                  <span className="minutes fs-1 fw-normal"></span>
                  <small>Min</small>
                </div>
                <span className="fs-1 text-primary">:</span>
                <div className="time d-grid ps-3">
                  <span className="seconds fs-1 fw-normal"></span>
                  <small>Sec</small>
                </div>
              </div>
              <a href="index.html" className="btn mt-3">
                Shop Collection
              </a>
            </div>
          </div>
        </div>
      </section> */}
      {/* <section id="categories" className="padding-large pt-0">
        <div className="container">
          <div className="section-title overflow-hidden mb-4">
            <h3 className="d-flex align-items-center">Categories</h3>
          </div>
          <div className="row">
            <div className="col-md-4">
              <a
                href="index.html"
                className="card mb-4 border-0 rounded-3 position-relative text-decoration-none"
              >
                <img
                  src="images/category1.jpg"
                  className="img-fluid rounded-3"
                  alt="Romance category"
                />
                <h6 className="position-absolute bottom-0 bg-primary m-4 py-2 px-3 rounded-3 text-white">
                  Romance
                </h6>
              </a>
            </div>
            <div className="col-md-4">
              <a
                href="index.html"
                className="card text-center mb-4 border-0 rounded-3 position-relative text-decoration-none"
              >
                <img
                  src="images/category2.jpg"
                  className="img-fluid rounded-3"
                  alt="Lifestyle category"
                />
                <h6 className="position-absolute bottom-0 bg-primary m-4 py-2 px-3 rounded-3 text-white">
                  Lifestyle
                </h6>
              </a>
            </div>
            <div className="col-md-4">
              <a
                href="index.html"
                className="card text-center mb-4 border-0 rounded-3 position-relative text-decoration-none"
              >
                <img
                  src="images/category3.jpg"
                  className="img-fluid rounded-3"
                  alt="Recipe category"
                />
                <h6 className="position-absolute bottom-0 bg-primary m-4 py-2 px-3 rounded-3 text-white">
                  Recipe
                </h6>
              </a>
            </div>
          </div>
        </div>
      </section> */}

      {/* <CustomerReviewsSection /> */}
      {/* <br />
      <section id="instagram">
        <div className="container">
          <div className="text-center mb-4">
            <h3>Instagram</h3>
          </div>
          <div className="row">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="col-md-2">
                <figure className="instagram-item position-relative rounded-3">
                  <a
                    href="https://templatesjungle.com/"
                    className="image-link position-relative"
                  >
                    <div className="icon-overlay position-absolute d-flex justify-content-center">
                      <svg className="instagram">
                        <use xlinkHref="#instagram"></use>
                      </svg>
                    </div>
                    <img
                      src={`images/insta-item${num}.jpg`}
                      alt="instagram"
                      className="img-fluid rounded-3 insta-image"
                    />
                  </a>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <footer id="footer" className="padding-large">
        <div className="container">
          <div className="row">
            <div className="footer-top-area">
              <div className="row d-flex flex-wrap justify-content-between">
                <div className="col-lg-3 col-sm-6 pb-3">
                  <div className="footer-menu">
                    Dreamy Eyes
                    <p>
                      Nisi, purus vitae, ultrices nunc. Sit ac sit suscipit
                      hendrerit. Gravida massa volutpat aenean odio erat nullam
                      fringilla.
                    </p>
                    <div className="social-links">
                      <ul className="d-flex list-unstyled">
                        {[
                          "facebook",
                          "instagram",
                          "twitter",
                          "linkedin",
                          "youtube",
                        ].map((icon) => (
                          <li key={icon}>
                            <a href="#">
                              <svg className={icon}>
                                <use xlinkHref={`#${icon}`} />
                              </svg>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-lg-2 col-sm-6 pb-3">
                  <div className="footer-menu text-capitalize">
                    <h5 className="widget-title pb-2">Quick Links</h5>
                    <ul className="menu-list list-unstyled text-capitalize">
                      {["Home", "About", "Shop", "Blogs", "Contact"].map(
                        (item) => (
                          <li key={item} className="menu-item mb-1">
                            <a href="#">{item}</a>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                <div className="col-lg-3 col-sm-6 pb-3">
                  <div className="footer-menu text-capitalize">
                    <h5 className="widget-title pb-2">Help & Info Help</h5>
                    <ul className="menu-list list-unstyled">
                      {[
                        "Track Your Order",
                        "Returns Policies",
                        "Shipping + Delivery",
                        "Contact Us",
                        "Faqs",
                      ].map((item) => (
                        <li key={item} className="menu-item mb-1">
                          <a href="#">{item}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="col-lg-3 col-sm-6 pb-3">
                  <div className="footer-menu contact-item">
                    <h5 className="widget-title text-capitalize pb-2">
                      Contact Us
                    </h5>
                    <p>
                      Do you have any queries or suggestions?{" "}
                      <a
                        href="mailto:yourinfo@gmail.com"
                        className="text-decoration-underline"
                      >
                        yourinfo@gmail.com
                      </a>
                    </p>
                    <p>
                      If you need support? Just give us a call.{" "}
                      <a
                        href="tel:+551112223344"
                        className="text-decoration-underline"
                      >
                        +55 111 222 333 44
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <hr />
      <div id="footer-bottom" className="mb-2">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between">
            <div className="ship-and-payment d-flex gap-md-5 flex-wrap"></div>
            <div className="copyright">
              <p>© Copyright {new Date().getFullYear()} Dreamy Eyes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
