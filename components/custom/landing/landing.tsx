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
import { MultiCarousel } from "@/components/ui/custom/muti-carousel";

export const LandingComponent = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <main className="flex-grow overflow-x-hidden">
      <div className="relative w-full mt-4">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent className="!p-0">
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index} className="basis-full !p-0">
                <div className="w-full h-[520px] overflow-hidden">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/config/banner.png`}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-full object-cover"
                    width={1920}
                    height={520}
                    priority
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md" />
        </Carousel>

        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-500 transition"
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <MultiCarousel />
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div> */}
      </div>

      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 flex items-center shadow-sm">
              <div className="bg-red-100 rounded-full p-3 mr-4 flex items-center justify-center w-12 h-12">
                <span className="text-red-400 text-xl font-bold">#</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">#1</h3>
                <p className="text-gray-600">eCommerce Platform</p>
              </div>
            </div>

            <div className="bg-red-400 text-white rounded-lg p-6 flex items-center">
              <div className="bg-red-300 bg-opacity-50 rounded-full p-3 mr-4 flex items-center justify-center w-12 h-12">
                <span className="text-white text-xl">💬</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">25k+</h3>
                <p>Client Testimonials</p>
              </div>
            </div>

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
