"use client";
import React, { useState } from "react";
import { Search, ShoppingCart, User, Menu, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Homepage = () => {
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
              <span className="text-xl font-bold text-gray-800">PioMart</span>
            </div>

            {/* Navigation Links with Dropdown */}
            <div className="hidden md:flex items-center space-x-6">
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
                  <span className="font-medium">Login/Sign Up</span>
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
        <div className="bg-pink-50 m-3">
          {/* Hero Section with Winter Sale - Block 1 */}
          <section className="py-2">
            <div className="container mx-auto px-4">
              <div className="rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Left Column */}
                  <div className="p-6">
                    <div className="flex items-center text-red-500 mb-4">
                      <Menu className="h-4 w-4 mr-2" />
                      <span className="text-sm">Best Gadget & Fashion</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">
                      <span className="text-gray-900">30% Off </span>
                      <span className="text-red-400">Winter Sale</span>
                    </h1>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Promo Code
                    </h2>
                    <button className="bg-red-400 text-white px-6 py-2 rounded-full hover:bg-red-500 transition-colors">
                      Shop Now
                    </button>
                  </div>

                  {/* Right Column */}
                  <div className="p-6 flex flex-col justify-center">
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

          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Baby & Kids Section - Block 2 */}
              <div className="bg-white rounded-lg shadow-sm h-full">
                <div className="flex flex-col md:flex-row h-full">
                  <div className="p-6 flex flex-col justify-center md:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Baby & Kids
                    </h3>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                      Clothings
                    </h2>
                    <button className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors w-32">
                      Shop Now
                    </button>
                  </div>
                  <div className="md:w-1/2 flex items-center justify-center p-4">
                    <img
                      src="/api/placeholder/280/280"
                      alt="Kid wearing colorful clothing"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Mid Summer Sale - Block 3 */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-center p-6">
                    <div className="flex items-center">
                      <div>
                        <h3 className="text-red-400 font-medium">Mid Summer</h3>
                        <div className="flex items-center">
                          <h2 className="text-6xl font-bold text-blue-900">
                            30
                          </h2>
                          <div className="ml-2 text-left">
                            <p className="text-sm font-bold text-blue-900">
                              UP TO
                            </p>
                            <p className="text-sm font-bold text-blue-900">
                              % OFF
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          Instore & Outlets
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kids Bag Section - Block 4 */}
                <div className="bg-white rounded-lg shadow-sm flex-grow">
                  <div className="flex flex-col h-full">
                    <div className="p-6 text-center">
                      <p className="text-gray-700">Feel Amazing</p>
                      <h2 className="text-4xl font-bold text-gray-900">
                        EVERYDAY
                      </h2>
                      <p className="text-gray-700 mb-4">Kids Bag</p>
                      <button className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors">
                        Shop Now
                      </button>
                    </div>
                    <div className="bg-pink-100 p-4 flex-grow flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-2">
                        <img
                          src="/api/placeholder/120/120"
                          alt="Blue backpack"
                          className="rounded-lg"
                        />
                        <img
                          src="/api/placeholder/120/120"
                          alt="Purple backpack"
                          className="rounded-lg"
                        />
                        <img
                          src="/api/placeholder/120/120"
                          alt="Pink backpack"
                          className="rounded-lg"
                        />
                        <img
                          src="/api/placeholder/120/120"
                          alt="Light blue backpack"
                          className="rounded-lg"
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
