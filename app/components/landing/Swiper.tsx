"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css/bundle";

const slides = [
  {
    title: "Precision Vision, Perfect Fit",
    subtitle: "Get 30% off custom eye lenses—designed just for you!",
    buttonText: "Shop Collection",
    buttonLink: "index.html",
    imageSrc: "/images/banner-image2.png",
  },
  {
    title: "Revolutionize How You See",
    subtitle: "Next-gen lenses now at discounted prices. Limited time!",
    buttonText: "Shop Product",
    buttonLink: "index.html",
    imageSrc: "/images/banner-image1.png",
  },
  {
    title: "Tailored Lenses for Every Eye",
    subtitle: "Experience personalized comfort. Stocks running out!",
    buttonText: "Shop Collection",
    buttonLink: "index.html",
    imageSrc: "/images/banner-image.png",
  },
];

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
      <div className="position-absolute end-0 pe-0 pe-xxl-5 me-0 me-xxl-5 swiper-button-next main-slider-button-next text-black d-none d-md-block">
        <svg
          className="chevron-forward-circle d-flex justify-content-center align-items-center p-2"
          width="80"
          height="80"
        >
          <use xlinkHref="#alt-arrow-right-outline"></use>
        </svg>
      </div>

      <div className="position-absolute start-0 ps-0 ps-xxl-5 ms-0 ms-xxl-5 swiper-button-prev main-slider-button-prev text-black d-none d-md-block">
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
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="container">
              <div className="row d-flex flex-column-reverse flex-md-row align-items-center">
                <div className="col-md-5 offset-md-1 mt-5 mt-md-0 text-center text-md-start">
                  <div className="banner-content">
                    <h2 style={{ fontSize: 52 }}>{slide.title}</h2>
                    <p style={{ fontSize: 18 }}>{slide.subtitle}</p>
                    <a
                      href={slide.buttonLink}
                      className="btn mt-3"
                      style={{
                        backgroundColor: "#F86D72",
                        borderRadius: 200,
                        padding: "1.125rem 2.625rem",
                      }}
                    >
                      {slide.buttonText}
                    </a>
                  </div>
                </div>
                <div className="col-md-6 text-center">
                  <div className="image-holder">
                    <img
                      src={slide.imageSrc}
                      className="img-fluid"
                      alt="banner"
                    />
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
