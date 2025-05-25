"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css/bundle";

export default function BillboardCarousel() {
  return (
    <section
      id="billboard"
      className="position-relative d-flex align-items-center py-5 bg-light-gray"
      style={{
        backgroundImage: "url(/images/banner-image-bg.jpg)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        height: "800px",
      }}
    >
      {/* Navigation Buttons */}
      <div className="position-absolute end-0 pe-0 pe-xxl-5 me-0 me-xxl-5 swiper-button-next main-slider-button-next">
        <svg
          className="chevron-forward-circle d-flex justify-content-center align-items-center p-2"
          width="80"
          height="80"
        >
          <use xlinkHref="#alt-arrow-right-outline"></use>
        </svg>
      </div>
      <div className="position-absolute start-0 ps-0 ps-xxl-5 ms-0 ms-xxl-5 swiper-button-prev main-slider-button-prev">
        <svg
          className="chevron-back-circle d-flex justify-content-center align-items-center p-2"
          width="80"
          height="80"
        >
          <use xlinkHref="#alt-arrow-left-outline"></use>
        </svg>
      </div>

      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={{
          nextEl: ".main-slider-button-next",
          prevEl: ".main-slider-button-prev",
        }}
        autoplay={{ delay: 5000 }}
        loop={true}
        className="main-swiper w-100"
      >
        <SwiperSlide>
          <div className="container">
            <div className="row d-flex flex-column-reverse flex-md-row align-items-center">
              <div className="col-md-5 offset-md-1 mt-5 mt-md-0 text-center text-md-start">
                <div className="banner-content">
                  <h2>The Fine Print Book Collection</h2>
                  <p>Best Offer Save 30%. Grab it now!</p>
                  <a href="index.html" className="btn mt-3">
                    Shop Collection
                  </a>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="image-holder">
                  <img
                    src="/images/banner-image2.png"
                    className="img-fluid"
                    alt="banner"
                  />
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="container">
            <div className="row d-flex flex-column-reverse flex-md-row align-items-center">
              <div className="col-md-5 offset-md-1 mt-5 mt-md-0 text-center text-md-start">
                <div className="banner-content">
                  <h2>How Innovation works</h2>
                  <p>Discount available. Grab it now!</p>
                  <a href="index.html" className="btn mt-3">
                    Shop Product
                  </a>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="image-holder">
                  <img
                    src="/images/banner-image1.png"
                    className="img-fluid"
                    alt="banner"
                  />
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="container">
            <div className="row d-flex flex-column-reverse flex-md-row align-items-center">
              <div className="col-md-5 offset-md-1 mt-5 mt-md-0 text-center text-md-start">
                <div className="banner-content">
                  <h2>Your Heart is the Sea</h2>
                  <p>Limited stocks available. Grab it now!</p>
                  <a href="index.html" className="btn mt-3">
                    Shop Collection
                  </a>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="image-holder">
                  <img
                    src="/images/banner-image.png"
                    className="img-fluid"
                    alt="banner"
                  />
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>
  );
}
