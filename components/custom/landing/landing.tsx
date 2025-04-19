import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { Menu } from "lucide-react";

export const LandingComponent = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );
  return (
    <main className="flex-grow">
      <div className="m-3" style={{ backgroundColor: "#fff7f5" }}>
        {/* Hero Section with Winter Sale - Block 1 */}
        <section className="py-2">
          <div className="container mx-auto px-4">
            <div className="rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left Column */}
                <div className="p-6">
                  <div className="flex items-center text-red-500 mb-4">
                    <Menu className="h-4 w-4 mr-2" />
                    <span className="text-sm font-bold">
                      Best Lens & Fashion
                    </span>
                  </div>
                  <h1 className="text-5xl font-bold mb-2">
                    <span className="text-gray-900 text">30% Off </span>
                    <span className="text-red-400 font-black">Winter Sale</span>
                  </h1>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Promo Code
                  </h2>
                </div>

                {/* Right Column */}
                <div className="p-6 flex flex-col justify-center w-full md:w-[300px] md:ml-auto">
                  <p className="text-gray-700 mb-4">
                    This year, our new summer collection will shelter you from
                    the harsh elements of a world that.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6">
            <Carousel
              plugins={[plugin.current]}
              className="w-full overflow-hidden rounded-sm"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
            >
              <CarouselContent>
                {Array.from({ length: 5 }).map((_, index) => (
                  <CarouselItem key={index} className="p-0">
                    <div className="w-full h-90 overflow-hidden rounded-sm">
                      {" "}
                      {/* Wrapper radius */}
                      <Image
                        src="/images/slider.jpg"
                        alt="banner"
                        className="w-full h-full object-cover"
                        width={1920}
                        height={90}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {/* Right Column - Blocks 3 and 4 stacked */}
            <div className="flex flex-col gap-6 h-90">
              {/* Block 3 - Kids Bag */}
              <div className="bg-white rounded-sm shadow-sm flex-grow h-90">
                <div className="flex flex-col h-90">
                  <div className="p-6 text-center">
                    <p className="text-gray-700">Feel Amazing</p>
                    <h2 className="text-4xl font-bold text-gray-900">
                      EVERYDAY
                    </h2>
                    <p className="text-gray-700 mb-4">Lens</p>
                    <button className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors">
                      Shop Now
                    </button>
                  </div>
                  <div
                    className="p-4 flex-grow flex items-center justify-center"
                    style={{ backgroundColor: "#fff7f5" }}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <Image
                        src="/images/lens1.png"
                        alt="banner"
                        className="w-full h-full object-cover"
                        width={50}
                        height={50}
                      />
                      <Image
                        src="/images/lens1.png"
                        alt="banner"
                        className="w-full h-full object-cover"
                        width={50}
                        height={50}
                      />
                      <Image
                        src="/images/lens1.png"
                        alt="banner"
                        className="w-full h-full object-cover"
                        width={50}
                        height={50}
                      />
                      <Image
                        src="/images/lens1.png"
                        alt="banner"
                        className="w-full h-full object-cover"
                        width={50}
                        height={50}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar - Block 5 */}
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

              {/* 25k+ */}
              <div className="bg-red-400 text-white rounded-lg p-6 flex items-center">
                <div className="bg-red-300 bg-opacity-50 rounded-full p-3 mr-4 flex items-center justify-center w-12 h-12">
                  <span className="text-white text-xl">💬</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">25k+</h3>
                  <p>Client Testimonials</p>
                </div>
              </div>

              {/* 1 Million */}
              <div className="bg-white rounded-lg p-6 flex items-center shadow-sm">
                <div className="bg-red-100 rounded-full p-3 mr-4 flex items-center justify-center w-12 h-12">
                  <span className="text-red-400 text-xl">✓</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    1 Million
                  </h3>
                  <p className="text-gray-600">Real Customer & Buyers</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
