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

import { LandingComponent } from "@/components/custom/landing/landing";
import ProductGrid from "@/components/custom/product/product-grid";

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
      <LandingComponent />
      {/* Product Content */}
      <ProductGrid />
    </div>
  );
};

export default Homepage;
