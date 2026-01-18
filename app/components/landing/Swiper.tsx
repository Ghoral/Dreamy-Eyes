"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const BillboardCarousel = ({ banners = [] }: { banners?: string[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [images, setImages] = useState<string[]>(banners);
  const [isLoaded, setIsLoaded] = useState(true);

  // Sync props to state if needed (though usually initial is enough for banners)
  useEffect(() => {
    if (banners.length > 0) {
      setImages(banners);
    }
  }, [banners]);

  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [images.length]);


  if (images.length === 0) return null;

  return (
    <section className="relative w-full h-screen overflow-hidden bg-white">
      {images.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
        >
          {/* Main Background Image */}
          <div className="relative w-full h-full transform scale-105 active:scale-100 transition-transform duration-[10000ms] ease-linear">
            <Image
              src={src}
              alt={`Lens Banner ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              quality={100}
              unoptimized
            />
          </div>
        </div>
      ))}

      {/* Floating Bottom Navigation */}
      <div className="absolute bottom-12 left-0 right-0 z-30 flex items-center justify-between px-8 md:px-16">
        <div className="flex gap-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="group relative w-16 h-1 bg-white/30 overflow-hidden rounded-full"
            >
              <div
                className={`absolute inset-0 bg-white transition-all duration-[8000ms] linear ${index === currentSlide ? "w-full" : "w-0"
                  }`}
              />
            </button>
          ))}
        </div>

        <div className="hidden md:flex gap-4">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)}
            className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-secondary-900 transition-all duration-300 backdrop-blur-md group"
          >
            <svg className="w-8 h-8 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % images.length)}
            className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-secondary-900 transition-all duration-300 backdrop-blur-md group"
          >
            <svg className="w-8 h-8 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

    </section>
  );
};

export default BillboardCarousel;
