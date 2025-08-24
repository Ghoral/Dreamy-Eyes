"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const BillboardCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      imageSrc: "/images/logo.png", // Placeholder - replace with your fashion lens banner
      title: "Discover Your Style",
      subtitle: "Premium Fashion Contact Lenses",
      ctaText: "Shop Now",
      ctaLink: "/shop",
    },
    {
      id: 2,
      imageSrc: "/images/logo.png", // Placeholder - replace with your fashion lens banner
      title: "Express Yourself",
      subtitle: "Trendy Colors & Designs",
      ctaText: "Explore Collection",
      ctaLink: "/shop",
    },
    {
      id: 3,
      imageSrc: "/images/logo.png", // Placeholder - replace with your fashion lens banner
      title: "Be Bold, Be Beautiful",
      subtitle: "Transform Your Look Today",
      ctaText: "Get Started",
      ctaLink: "/shop",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative pt-20 bg-gradient-to-br from-secondary-50 via-white to-primary-50 overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative">
        {/* Carousel Container */}
        <div className="relative h-[600px] overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={slide.imageSrc}
                  alt={`Fashion Lens Banner ${slide.id}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-secondary-600 hover:text-primary-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-secondary-600 hover:text-primary-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white scale-125 shadow-lg"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BillboardCarousel;
