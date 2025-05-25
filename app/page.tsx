"use client";

import BestSellingItems from "./components/landing/BestSelling";
import CustomerReviewsSection from "./components/landing/CustomerReview";
import BillboardCarousel from "./components/landing/Swiper";

export default function Home() {
  return (
    <div>
      <header id="header" className="site-header">
        <div className="top-info border-bottom d-none d-md-block ">
          <div className="container-fluid">
            <div className="row g-0">
              <div className="col-md-4">
                <p className="fs-6 my-2 text-center">
                  Need any help? Call us <a href="#">112233344455</a>
                </p>
              </div>
              <div className="col-md-4 border-start border-end">
                <p className="fs-6 my-2 text-center">
                  Summer sale discount off 60% off!{" "}
                  <a className="text-decoration-underline" href="index.html">
                    Shop Now
                  </a>
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
              <img src="images/main-logo.png" className="logo" />
            </a>
            <button
              className="navbar-toggler d-flex d-lg-none order-3 p-2"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#bdNavbar"
              aria-controls="bdNavbar"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <svg className="navbar-icon">
                <use xlinkHref="#navbar-icon"></use>
              </svg>
            </button>
            <div
              className="offcanvas offcanvas-end"
              tabIndex={-1}
              id="bdNavbar"
              aria-labelledby="bdNavbarOffcanvasLabel"
            >
              <div className="offcanvas-header px-4 pb-0">
                <a className="navbar-brand" href="index.html">
                  <img src="images/main-logo.png" className="logo" />
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
                        <span className="fs-6 fw-light">(02)</span>
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
                            <span className="text-primary">$870</span>
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
      <section id="company-services" className="padding-large pb-0">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6 pb-3 pb-lg-0">
              <div className="icon-box d-flex">
                <div className="icon-box-icon pe-3 pb-3">
                  <svg className="cart-outline">
                    <use xlinkHref="#cart-outline" />
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
                  <svg className="quality">
                    <use xlinkHref="#quality" />
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
                  <svg className="price-tag">
                    <use xlinkHref="#price-tag" />
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
                  <svg className="shield-plus">
                    <use xlinkHref="#shield-plus" />
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

      <BestSellingItems />

      <section
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
      </section>

      <section id="items-listing" className="padding-large">
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-4 mb-lg-0 col-lg-3">
              <div className="featured border rounded-3 p-4">
                <div className="section-title overflow-hidden mb-5 mt-2">
                  <h3 className="d-flex flex-column mb-0">Featured</h3>
                </div>
                <div className="items-lists">
                  <div className="item d-flex">
                    <img
                      src="images/product-item2.png"
                      className="img-fluid shadow-sm"
                      alt="product item"
                    />
                    <div className="item-content ms-3">
                      <h6 className="mb-0 fw-bold">
                        <a href="index.html">Echoes of the Ancients</a>
                      </h6>
                      <div className="review-content d-flex">
                        <p className="my-2 me-2 fs-6 text-black-50">
                          Lauren Asher
                        </p>
                        <div className="rating text-warning d-flex align-items-center">
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                        </div>
                      </div>
                      <span className="price text-primary fw-bold mb-2 fs-5">
                        $870
                      </span>
                    </div>
                  </div>
                  <hr className="gray-400" />
                  <div className="item d-flex">
                    <img
                      src="images/product-item1.png"
                      className="img-fluid shadow-sm"
                      alt="product item"
                    />
                    <div className="item-content ms-3">
                      <h6 className="mb-0 fw-bold">
                        <a href="index.html">The Midnight Garden</a>
                      </h6>
                      <div className="review-content d-flex">
                        <p className="my-2 me-2 fs-6 text-black-50">
                          Lauren Asher
                        </p>
                        <div className="rating text-warning d-flex align-items-center">
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                        </div>
                      </div>
                      <span className="price text-primary fw-bold mb-2 fs-5">
                        $870
                      </span>
                    </div>
                  </div>
                  <hr />
                  <div className="item d-flex">
                    <img
                      src="images/product-item3.png"
                      className="img-fluid shadow-sm"
                      alt="product item"
                    />
                    <div className="item-content ms-3">
                      <h6 className="mb-0 fw-bold">
                        <a href="index.html">Shadow of the Serpent</a>
                      </h6>
                      <div className="review-content d-flex">
                        <p className="my-2 me-2 fs-6 text-black-50">
                          Lauren Asher
                        </p>
                        <div className="rating text-warning d-flex align-items-center">
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                        </div>
                      </div>
                      <span className="price text-primary fw-bold mb-2 fs-5">
                        $870
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4 mb-lg-0 col-lg-3">
              <div className="latest-items border rounded-3 p-4">
                <div className="section-title overflow-hidden mb-5 mt-2">
                  <h3 className="d-flex flex-column mb-0">Latest items</h3>
                </div>
                <div className="items-lists">
                  <div className="item d-flex">
                    <img
                      src="images/product-item4.png"
                      className="img-fluid shadow-sm"
                      alt="product item"
                    />
                    <div className="item-content ms-3">
                      <h6 className="mb-0 fw-bold">
                        <a href="index.html">Whispering Winds</a>
                      </h6>
                      <div className="review-content d-flex">
                        <p className="my-2 me-2 fs-6 text-black-50">
                          Lauren Asher
                        </p>
                        <div className="rating text-warning d-flex align-items-center">
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                        </div>
                      </div>
                      <span className="price text-primary fw-bold mb-2 fs-5">
                        $870
                      </span>
                    </div>
                  </div>
                  <hr className="gray-400" />
                  <div className="item d-flex">
                    <img
                      src="images/product-item5.png"
                      className="img-fluid shadow-sm"
                      alt="product item"
                    />
                    <div className="item-content ms-3">
                      <h6 className="mb-0 fw-bold">
                        <a href="index.html">The Forgotten Realm</a>
                      </h6>
                      <div className="review-content d-flex">
                        <p className="my-2 me-2 fs-6 text-black-50">
                          Lauren Asher
                        </p>
                        <div className="rating text-warning d-flex align-items-center">
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                        </div>
                      </div>
                      <span className="price text-primary fw-bold mb-2 fs-5">
                        $870
                      </span>
                    </div>
                  </div>
                  <hr />
                  <div className="item d-flex">
                    <img
                      src="images/product-item6.png"
                      className="img-fluid shadow-sm"
                      alt="product item"
                    />
                    <div className="item-content ms-3">
                      <h6 className="mb-0 fw-bold">
                        <a href="index.html">Moonlit Secrets</a>
                      </h6>
                      <div className="review-content d-flex">
                        <p className="my-2 me-2 fs-6 text-black-50">
                          Lauren Asher
                        </p>
                        <div className="rating text-warning d-flex align-items-center">
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                        </div>
                      </div>
                      <span className="price text-primary fw-bold mb-2 fs-5">
                        $870
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4 mb-lg-0 col-lg-3">
              <div className="best-reviewed border rounded-3 p-4">
                <div className="section-title overflow-hidden mb-5 mt-2">
                  <h3 className="d-flex flex-column mb-0">Best reviewed</h3>
                </div>
                <div className="items-lists">
                  <div className="item d-flex">
                    <img
                      src="images/product-item7.png"
                      className="img-fluid shadow-sm"
                      alt="product item"
                    />
                    <div className="item-content ms-3">
                      <h6 className="mb-0 fw-bold">
                        <a href="index.html">The Crystal Key</a>
                      </h6>
                      <div className="review-content d-flex">
                        <p className="my-2 me-2 fs-6 text-black-50">
                          Lauren Asher
                        </p>
                        <div className="rating text-warning d-flex align-items-center">
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                        </div>
                      </div>
                      <span className="price text-primary fw-bold mb-2 fs-5">
                        $870
                      </span>
                    </div>
                  </div>
                  <hr className="gray-400" />
                  <div className="item d-flex">
                    <img
                      src="images/product-item8.png"
                      className="img-fluid shadow-sm"
                      alt="product item"
                    />
                    <div className="item-content ms-3">
                      <h6 className="mb-0 fw-bold">
                        <a href="index.html">Windswept Shores</a>
                      </h6>
                      <div className="review-content d-flex">
                        <p className="my-2 me-2 fs-6 text-black-50">
                          Lauren Asher
                        </p>
                        <div className="rating text-warning d-flex align-items-center">
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                        </div>
                      </div>
                      <span className="price text-primary fw-bold mb-2 fs-5">
                        $870
                      </span>
                    </div>
                  </div>
                  <hr />
                  <div className="item d-flex">
                    <img
                      src="images/product-item9.png"
                      className="img-fluid shadow-sm"
                      alt="product item"
                    />
                    <div className="item-content ms-3">
                      <h6 className="mb-0 fw-bold">
                        <a href="index.html">Lost Horizons</a>
                      </h6>
                      <div className="review-content d-flex">
                        <p className="my-2 me-2 fs-6 text-black-50">
                          Lauren Asher
                        </p>
                        <div className="rating text-warning d-flex align-items-center">
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                        </div>
                      </div>
                      <span className="price text-primary fw-bold mb-2 fs-5">
                        $870
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4 mb-lg-0 col-lg-3">
              <div className="top-sellers border rounded-3 p-4">
                <div className="section-title overflow-hidden mb-5 mt-2">
                  <h3 className="d-flex flex-column mb-0">Top sellers</h3>
                </div>
                <div className="items-lists">
                  <div className="item d-flex">
                    <img
                      src="images/product-item10.png"
                      className="img-fluid shadow-sm"
                      alt="product item"
                    />
                    <div className="item-content ms-3">
                      <h6 className="mb-0 fw-bold">
                        <a href="index.html">Sunset Dreams</a>
                      </h6>
                      <div className="review-content d-flex">
                        <p className="my-2 me-2 fs-6 text-black-50">
                          Lauren Asher
                        </p>
                        <div className="rating text-warning d-flex align-items-center">
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                        </div>
                      </div>
                      <span className="price text-primary fw-bold mb-2 fs-5">
                        $870
                      </span>
                    </div>
                  </div>
                  <hr className="gray-400" />
                  <div className="item d-flex">
                    <img
                      src="images/product-item11.png"
                      className="img-fluid shadow-sm"
                      alt="product item"
                    />
                    <div className="item-content ms-3">
                      <h6 className="mb-0 fw-bold">
                        <a href="index.html">Emerald Horizon</a>
                      </h6>
                      <div className="review-content d-flex">
                        <p className="my-2 me-2 fs-6 text-black-50">
                          Lauren Asher
                        </p>
                        <div className="rating text-warning d-flex align-items-center">
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                        </div>
                      </div>
                      <span className="price text-primary fw-bold mb-2 fs-5">
                        $870
                      </span>
                    </div>
                  </div>
                  <hr />
                  <div className="item d-flex">
                    <img
                      src="images/product-item12.png"
                      className="img-fluid shadow-sm"
                      alt="product item"
                    />
                    <div className="item-content ms-3">
                      <h6 className="mb-0 fw-bold">
                        <a href="index.html">Crimson Echo</a>
                      </h6>
                      <div className="review-content d-flex">
                        <p className="my-2 me-2 fs-6 text-black-50">
                          Lauren Asher
                        </p>
                        <div className="rating text-warning d-flex align-items-center">
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                          <svg className="star star-fill">
                            <use xlinkHref="#star-fill"></use>
                          </svg>
                        </div>
                      </div>
                      <span className="price text-primary fw-bold mb-2 fs-5">
                        $870
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="padding-large pt-0">
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
      </section>

      <CustomerReviewsSection />
      <section id="latest-posts" className="padding-large">
        <div className="container">
          <div className="section-title d-md-flex justify-content-between align-items-center mb-4">
            <h3 className="d-flex align-items-center">Latest posts</h3>
            <a href="index.html" className="btn">
              View All
            </a>
          </div>
          <div className="row">
            <div className="col-md-3 posts mb-4">
              <img
                src="images/post-item1.jpg"
                alt="post image"
                className="img-fluid rounded-3"
              />
              <a href="blog.html" className="fs-6 text-primary">
                Books
              </a>
              <h4 className="card-title mb-2 text-capitalize text-dark">
                <a href="index.html">
                  10 Must-Read Books of the Year: Our Top Picks!
                </a>
              </h4>
              <p className="mb-2">
                Dive into the world of cutting-edge technology with our latest
                blog post, where we highlight five essential gadge.
                <span>
                  <a
                    className="text-decoration-underline text-black-50"
                    href="index.html"
                  >
                    Read More
                  </a>
                </span>
              </p>
            </div>
            <div className="col-md-3 posts mb-4">
              <img
                src="images/post-item2.jpg"
                alt="post image"
                className="img-fluid rounded-3"
              />
              <a href="blog.html" className="fs-6 text-primary">
                Books
              </a>
              <h4 className="card-title mb-2 text-capitalize text-dark">
                <a href="index.html">
                  The Fascinating Realm of Science Fiction
                </a>
              </h4>
              <p className="mb-2">
                Explore the intersection of technology and sustainability in our
                latest blog post. Learn about the innovative
                <span>
                  <a
                    className="text-decoration-underline text-black-50"
                    href="index.html"
                  >
                    Read More
                  </a>
                </span>
              </p>
            </div>
            <div className="col-md-3 posts mb-4">
              <img
                src="images/post-item3.jpg"
                alt="post image"
                className="img-fluid rounded-3"
              />
              <a href="blog.html" className="fs-6 text-primary">
                Books
              </a>
              <h4 className="card-title mb-2 text-capitalize text-dark">
                <a href="index.html">Finding Love in the Pages of a Book</a>
              </h4>
              <p className="mb-2">
                Stay ahead of the curve with our insightful look into the
                rapidly evolving landscape of wearable technology.
                <span>
                  <a
                    className="text-decoration-underline text-black-50"
                    href="index.html"
                  >
                    Read More
                  </a>
                </span>
              </p>
            </div>
            <div className="col-md-3 posts mb-4">
              <img
                src="images/post-item4.jpg"
                alt="post image"
                className="img-fluid rounded-3"
              />
              <a href="blog.html" className="fs-6 text-primary">
                Books
              </a>
              <h4 className="card-title mb-2 text-capitalize text-dark">
                <a href="index.html">
                  Reading for Mental Health: How Books Can Heal and Inspire
                </a>
              </h4>
              <p className="mb-2">
                In today's remote work environment, productivity is key.
                Discover the top apps and tools that can help you stay
                <span>
                  <a
                    className="text-decoration-underline text-black-50"
                    href="index.html"
                  >
                    Read More
                  </a>
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

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
      </section>

      <footer id="footer" className="padding-large">
        <div className="container">
          <div className="row">
            <div className="footer-top-area">
              <div className="row d-flex flex-wrap justify-content-between">
                <div className="col-lg-3 col-sm-6 pb-3">
                  <div className="footer-menu">
                    <img
                      src="images/main-logo.png"
                      alt="logo"
                      className="img-fluid mb-2"
                    />
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
            <div className="ship-and-payment d-flex gap-md-5 flex-wrap">
              <div className="shipping d-flex">
                <p>We ship with:</p>
                <div className="card-wrap ps-2">
                  <img src="images/dhl.png" alt="DHL" />
                  <img src="images/shippingcard.png" alt="Shipping Card" />
                </div>
              </div>
              <div className="payment-method d-flex">
                <p>Payment options:</p>
                <div className="card-wrap ps-2">
                  <img src="images/visa.jpg" alt="Visa" />
                  <img src="images/mastercard.jpg" alt="MasterCard" />
                  <img src="images/paypal.jpg" alt="PayPal" />
                </div>
              </div>
            </div>
            <div className="copyright">
              <p>
                © Copyright 2024 Bookly. HTML Template by{" "}
                <a
                  href="https://templatesjungle.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TemplatesJungle
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
