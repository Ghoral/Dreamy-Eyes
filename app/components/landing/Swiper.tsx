"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createSupabaseClient } from "../../services/supabase/client/supabaseBrowserClient";

const BillboardCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createSupabaseClient();
    const loadBanners = async () => {
      const { data, error } = await supabase.storage.from("banner").list("", {
        limit: 50,
        sortBy: { column: "name", order: "asc" },
      });
      if (!error && Array.isArray(data)) {
        const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/banner`;
        const urls = data
          .filter((f) => !f.name.startsWith(".") && f.id)
          .map((file) => `${baseUrl}/${encodeURIComponent(file.name)}`);
        setImages(urls);
      }
    };
    loadBanners();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
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
        <div className="relative h-[320px] sm:h-[380px] md:h-[440px] lg:h-[500px] overflow-hidden">
          {images.map((src, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={src}
                  alt={`Fashion Lens Banner ${index + 1}`}
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
          {images.map((_, index) => (
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
