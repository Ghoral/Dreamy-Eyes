"use client";
import React, { useState } from "react";
import { Search, ShoppingCart, User, Menu, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

const Homepage = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar with elevation */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-red-300 rounded-md p-1 mr-1">
                <ShoppingCart className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-xl font-bold text-gray-800">
                Dreamy Eyes
              </span>
            </div>

            {/* Navigation Links with Dropdown */}
            <div className="hidden md:flex items-center space-x-6 font-semibold text-xs">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center text-red-500 focus:outline-none">
                  <Menu className="h-4 w-4 mr-2" />
                  <span>Browse Categories</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem>Electronics</DropdownMenuItem>
                  <DropdownMenuItem>Fashion</DropdownMenuItem>
                  <DropdownMenuItem>Home & Garden</DropdownMenuItem>
                  <DropdownMenuItem>Toys & Games</DropdownMenuItem>
                  <DropdownMenuItem>Sports & Outdoors</DropdownMenuItem>
                  <DropdownMenuItem>Beauty & Personal Care</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Shop
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Supper Deals
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Find Store
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                🔥Special Offer
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Page
              </a>
            </div>

            {/* Mobile Menu Button (visible on small screens) */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <Search className="h-5 w-5" />
              </button>
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  2
                </span>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-600 mr-1" />
                <div className="flex flex-col text-xs">
                  <span className="text-gray-500">Hello,</span>
                  <span className="font-medium font-semibold">
                    Login/Sign Up
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu (shown when isOpen is true) */}
          {isOpen && (
            <div className="md:hidden mt-3 pb-3 border-t border-gray-200">
              <div className="pt-3 space-y-3">
                <div className="flex items-center text-red-500 px-2">
                  <Menu className="h-4 w-4 mr-2" />
                  <span>Browse Categories</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </div>
                <a
                  href="#"
                  className="block px-2 text-gray-600 hover:text-gray-900"
                >
                  Shop
                </a>
                <a
                  href="#"
                  className="block px-2 text-gray-600 hover:text-gray-900"
                >
                  Supper Deals
                </a>
                <a
                  href="#"
                  className="block px-2 text-gray-600 hover:text-gray-900"
                >
                  Find Store
                </a>
                <a
                  href="#"
                  className="block px-2 text-gray-600 hover:text-gray-900"
                >
                  🔥Special Offer
                </a>
                <a
                  href="#"
                  className="block px-2 text-gray-600 hover:text-gray-900"
                >
                  Page
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
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
                      <span className="text-red-400 font-black">
                        Winter Sale
                      </span>
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
                    <button className="mt-2 bg-red-400 text-white px-6 py-2 rounded-full hover:bg-red-500 transition-colors self-start">
                      Shop Now
                    </button>
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
    </div>
  );
};

export default Homepage;
