"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css/bundle";
import Image from "next/image";

const slides = [
  {
    imageSrc: "/images/banner-image2.png",
  },
  {
    imageSrc: "/images/banner-image1.png",
  },
  {
    imageSrc: "/images/banner-image.png",
  },
];

export default function BillboardCarousel() {
  return (
    <section
      id="billboard"
      className="position-relative"
      style={{
        height: "600px",
        backgroundColor: "#f8f9fa",
        padding: "0",
        margin: "0",
      }}
    >
      {/* Navigation Arrows */}
      <div
        className="position-absolute end-0 pe-4 me-4 swiper-button-next main-slider-button-next text-white d-none d-md-block"
        style={{ zIndex: 10 }}
      >
        <div
          className="bg-dark bg-opacity-50 rounded-circle d-flex justify-content-center align-items-center"
          style={{ width: "50px", height: "50px" }}
        >
          <i className="bi bi-chevron-right fs-4"></i>
        </div>
      </div>

      <div
        className="position-absolute start-0 ps-4 ms-4 swiper-button-prev main-slider-button-prev text-white d-none d-md-block"
        style={{ zIndex: 10 }}
      >
        <div
          className="bg-dark bg-opacity-50 rounded-circle d-flex justify-content-center align-items-center"
          style={{ width: "50px", height: "50px" }}
        >
          <i className="bi bi-chevron-left fs-4"></i>
        </div>
      </div>

      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={{
          nextEl: ".main-slider-button-next",
          prevEl: ".main-slider-button-prev",
        }}
        autoplay={{ delay: 5000 }}
        loop={true}
        className="main-swiper w-100 h-100"
        style={{ height: "600px" }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="w-100 h-100 position-relative">
              <Image
                src={slide.imageSrc}
                className="w-100 h-100"
                alt={`Banner ${index + 1}`}
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                priority={index === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx>{`
        .swiper-button-next,
        .swiper-button-prev {
          top: 50%;
          transform: translateY(-50%);
          transition: all 0.3s ease;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          transform: translateY(-50%) scale(1.1);
        }

        .swiper-button-next::after,
        .swiper-button-prev::after {
          display: none;
        }

        .main-swiper {
          border-radius: 0;
        }

        .swiper-slide {
          height: 600px;
        }
      `}</style>
    </section>
  );
}
