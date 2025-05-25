"use client";

import { useEffect } from "react";
import Swiper from "swiper/bundle";
import "swiper/css/bundle";

export default function CustomerReviewsSection() {
  useEffect(() => {
    new Swiper(".testimonial-swiper", {
      loop: true,
      slidesPerView: 1,
      autoplay: {
        delay: 6000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".testimonial-button-next",
        prevEl: ".testimonial-button-prev",
      },
    });
  }, []);

  return (
    <section
      id="customers-reviews"
      className="position-relative padding-large"
      style={{
        backgroundImage: "url(images/banner-image-bg.jpg)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        height: "600px",
      }}
    >
      <div className="container offset-md-3 col-md-6">
        <div className="position-absolute top-50 end-0 pe-0 pe-xxl-5 me-0 me-xxl-5 swiper-next testimonial-button-next">
          <svg
            className="chevron-forward-circle d-flex justify-content-center align-items-center p-2"
            width="80"
            height="80"
            style={{ fill: "black", stroke: "black" }}
          >
            <use xlinkHref="#alt-arrow-right-outline"></use>
          </svg>
        </div>
        <div className="position-absolute top-50 start-0 ps-0 ps-xxl-5 ms-0 ms-xxl-5 swiper-prev testimonial-button-prev">
          <svg
            className="chevron-back-circle d-flex justify-content-center align-items-center p-2"
            width="80"
            height="80"
            style={{ fill: "black", stroke: "black" }}
          >
            <use xlinkHref="#alt-arrow-left-outline"></use>
          </svg>
        </div>
        <div className="section-title mb-4 text-center">
          <h3 className="mb-4">Customers reviews</h3>
        </div>
        <div className="swiper testimonial-swiper">
          <div className="swiper-wrapper">
            {[
              {
                quote:
                  "I stumbled upon this bookstore while visiting the city, and it instantly became my favorite spot. The cozy atmosphere, friendly staff, and wide selection of books make every visit a delight!",
                name: "Emma Chamberlin",
              },
              {
                quote:
                  "As an avid reader, I'm always on the lookout for new releases, and this bookstore never disappoints. They always have the latest titles, and their recommendations have introduced me to some incredible reads!",
                name: "Thomas John",
              },
              {
                quote:
                  "I ordered a few books online from this store, and I was impressed by the quick delivery and careful packaging. It's clear that they prioritize customer satisfaction, and I'll definitely be shopping here again!",
                name: "Kevin Bryan",
              },
              {
                quote:
                  "I stumbled upon this tech store while searching for a new laptop, and I couldn't be happier with my experience! The staff was incredibly knowledgeable and guided me through the process of choosing the perfect device for my needs. Highly recommended!",
                name: "Stevin",
              },
              {
                quote:
                  "I stumbled upon this tech store while searching for a new laptop, and I couldn't be happier with my experience! The staff was incredibly knowledgeable and guided me through the process of choosing the perfect device for my needs. Highly recommended!",
                name: "Roman",
              },
            ].map(({ quote, name }, i) => (
              <div key={i} className="swiper-slide">
                <div className="card position-relative text-left p-5 border rounded-3">
                  <blockquote>{quote}</blockquote>
                  <div className="rating text-warning d-flex align-items-center">
                    {[...Array(5)].map((_, idx) => (
                      <svg key={idx} className="star star-fill">
                        <use xlinkHref="#star-fill"></use>
                      </svg>
                    ))}
                  </div>
                  <h5 className="mt-1 fw-normal">{name}</h5>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
