"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { TikTokEmbed } from "react-social-media-embed";
import "swiper/css/bundle";

export default function TikTokCarousel() {
  return (
    <section
      id="best-selling-items"
      className="position-relative"
      style={{ marginTop: 32 }}
    >
      <div className="container">
        <div className="section-title d-md-flex justify-content-between align-items-center ">
          <h3 className="d-flex align-items-center">Watch our TikToks</h3>
          <a href="index.html" className="btn">
            View All
          </a>
        </div>

        {/* Swiper navigation buttons */}
        <div className="position-absolute top-50 end-0 pe-0 pe-xxl-5 me-0 me-xxl-5 swiper-button-next product-slider-button-next">
          <svg
            className="chevron-forward-circle d-flex justify-content-center align-items-center p-2"
            width="80"
            height="80"
          >
            <use xlinkHref="#alt-arrow-right-outline" />
          </svg>
        </div>
        <div className="position-absolute top-50 start-0 ps-0 ps-xxl-5 ms-0 ms-xxl-5 swiper-button-prev product-slider-button-prev">
          <svg
            className="chevron-back-circle d-flex justify-content-center align-items-center p-2"
            width="80"
            height="80"
          >
            <use xlinkHref="#alt-arrow-left-outline" />
          </svg>
        </div>

        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".product-slider-button-next",
            prevEl: ".product-slider-button-prev",
          }}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            576: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
          width={1600}
          height={500}
        >
          {[
            {
              image: "/images/product-item1.png",
              title: "House of Sky Breath",
              author: "Lauren Asher",
              price: "870",
              discount: "10% off",
            },
            {
              image: "/images/product-item2.png",
              title: "Heartland Stars",
              author: "Lauren Asher",
              price: "870",
            },
            {
              image: "/images/product-item3.png",
              title: "Heavenly Bodies",
              author: "Lauren Asher",
              price: "870",
            },
            {
              image: "/images/product-item4.png",
              title: "His Saving Grace",
              author: "Lauren Asher",
              price: "870",
              discount: "10% off",
            },
            {
              image: "/images/product-item5.png",
              title: "My Dearest Darkest",
              author: "Lauren Asher",
              price: "870",
            },
          ].map((item, index) => (
            <SwiperSlide key={index}>
              <div className="card position-relative p-4 border rounded-3">
                <TikTokEmbed
                  url="https://www.tiktok.com/@epicgardening/video/7055411162212633903"
                  height={500}
                />
                {/* {item.discount && (
                  <div className="position-absolute">
                    <p className="bg-primary py-1 px-3 fs-6 text-white rounded-2">
                      {item.discount}
                    </p>
                  </div>
                )}
                <img
                  src={item.image}
                  className="img-fluid shadow-sm"
                  alt="product item"
                />
                <h6 className="mt-4 mb-0 fw-bold">{item.title}</h6>
                <div className="review-content d-flex">
                  <p className="my-2 me-2 fs-6 text-black-50">{item.author}</p>
                  <div className="rating text-warning d-flex align-items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="star star-fill">
                        <use xlinkHref="#star-fill" />
                      </svg>
                    ))}
                  </div>
                </div>
                <span
                  className="price fw-bold mb-2 fs-5"
                  style={{ color: "rgb(248, 109, 114)" }}
                >
                  Rs. {item.price}
                </span>
                <div className="card-concern position-absolute start-0 end-0 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-dark"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    data-bs-title="Add to cart"
                  >
                    <svg className="cart">
                      <use xlinkHref="#cart" />
                    </svg>
                  </button>
                  <a href="#" className="btn btn-dark">
                    <svg className="wishlist">
                      <use xlinkHref="#heart" />
                    </svg>
                  </a>
                </div> */}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
