import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { TikTokEmbed } from "react-social-media-embed";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const LandingComponent = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <main className="flex-grow overflow-x-hidden">
      <div className="relative w-full pt-12">
        <Carousel
          plugins={[plugin.current]}
          className="w-full relative"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index} className="p-0">
                <div className="w-full h-96 overflow-hidden px-12">
                  <Image
                    src="/images/slider.jpg"
                    alt="banner"
                    className="w-full h-full object-cover"
                    width={1920}
                    height={384}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* TikTok Video Section */}
      <div className="container mx-auto px-4 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Watch Our TikToks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TikTokEmbed
            url="https://www.tiktok.com/@scout2015/video/6718335390845095173"
            width="100%"
            height={400}
          />
          <TikTokEmbed
            url="https://www.tiktok.com/@scout2015/video/6718335390845095173"
            width="100%"
            height={400}
          />
          <TikTokEmbed
            url="https://www.tiktok.com/@scout2015/video/6718335390845095173"
            width="100%"
            height={400}
          />
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* #1 E-commerce */}
            <div className="bg-white rounded-lg p-6 flex items-center shadow-sm">
              <div className="bg-red-100 rounded-full p-3 mr-4 flex items-center justify-center w-12 h-12">
                <span className="text-red-400 text-xl font-bold">#</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">#1</h3>
                <p className="text-gray-600">eCommerce Platform</p>
              </div>
            </div>

            {/* 25k+ Testimonials */}
            <div className="bg-red-400 text-white rounded-lg p-6 flex items-center">
              <div className="bg-red-300 bg-opacity-50 rounded-full p-3 mr-4 flex items-center justify-center w-12 h-12">
                <span className="text-white text-xl">💬</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">25k+</h3>
                <p>Client Testimonials</p>
              </div>
            </div>

            {/* 1 Million Customers */}
            <div className="bg-white rounded-lg p-6 flex items-center shadow-sm">
              <div className="bg-red-100 rounded-full p-3 mr-4 flex items-center justify-center w-12 h-12">
                <span className="text-red-400 text-xl">✓</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">1 Million</h3>
                <p className="text-gray-600">Real Customers & Buyers</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
