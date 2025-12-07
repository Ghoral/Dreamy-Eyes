"use client";

import {
  getThumbnailUrl,
  formatPriceWithCurrency,
  formatPrice,
} from "@/app/util";
import Image from "next/image";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserCountry } from "../../hooks/useUserCountry";

const ProductItems = ({ data }: { data: any }) => {
  const { country } = useUserCountry();
  const router = useRouter();
  const [sortBy, setSortBy] = useState<string>("popularity");
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [powerMin, setPowerMin] = useState<string>("");
  const [powerMax, setPowerMax] = useState<string>("");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  const handleProductClick = (product: any) => {
    const productId = product.id || product.title;
    router.push(`/${encodeURIComponent(productId)}`);
  };

  // Extract unique colors from products
  const availableColors = useMemo(() => {
    const colorSet = new Set<string>();
    (data || []).forEach((product: any) => {
      if (product.color_quantity && Array.isArray(product.color_quantity)) {
        product.color_quantity.forEach((cq: any) => {
          if (cq.label) {
            colorSet.add(cq.label);
          }
        });
      }
    });
    return Array.from(colorSet).sort();
  }, [data]);

  // Extract unique sizes from products
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    (data || []).forEach((product: any) => {
      if (product.specifications) {
        try {
          const specs =
            typeof product.specifications === "string"
              ? JSON.parse(product.specifications)
              : product.specifications;

          if (Array.isArray(specs)) {
            specs.forEach((spec: any) => {
              if (spec && typeof spec === "object") {
                const label = (spec.label || "").toLowerCase();
                if (label.includes("size") && spec.value) {
                  sizeSet.add(spec.value);
                }
              }
            });
          } else if (typeof specs === "object" && specs !== null) {
            Object.entries(specs).forEach(([key, value]) => {
              const keyLower = key.toLowerCase();
              if (keyLower.includes("size") && value) {
                sizeSet.add(String(value));
              }
            });
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }
    });
    return Array.from(sizeSet).sort();
  }, [data]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...(data || [])];

    // Apply color filter
    if (selectedColor !== "all") {
      filtered = filtered.filter((product: any) => {
        if (!product.color_quantity || !Array.isArray(product.color_quantity)) {
          return false;
        }
        return product.color_quantity.some(
          (cq: any) => cq.label === selectedColor
        );
      });
    }

    // Apply power range filter
    if (powerMin || powerMax) {
      filtered = filtered.filter((product: any) => {
        const power = product.power
          ? parseFloat(product.power.toString())
          : null;
        if (power === null) return false;

        const min = powerMin ? parseFloat(powerMin) : -Infinity;
        const max = powerMax ? parseFloat(powerMax) : Infinity;
        return power >= min && power <= max;
      });
    }

    // Apply sorting
    const sorted = [...filtered];
    if (sortBy === "price-low") {
      sorted.sort((a: any, b: any) => {
        const priceA =
          typeof a.price === "number" ? a.price : parseFloat(a.price);
        const priceB =
          typeof b.price === "number" ? b.price : parseFloat(b.price);
        return priceA - priceB;
      });
    } else if (sortBy === "price-high") {
      sorted.sort((a: any, b: any) => {
        const priceA =
          typeof a.price === "number" ? a.price : parseFloat(a.price);
        const priceB =
          typeof b.price === "number" ? b.price : parseFloat(b.price);
        return priceB - priceA;
      });
    } else if (sortBy === "newest") {
      sorted.sort((a: any, b: any) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === "oldest") {
      sorted.sort((a: any, b: any) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      });
    } else if (sortBy === "popularity") {
      sorted.sort(
        (a: any, b: any) => (b.order_count || 0) - (a.order_count || 0)
      );
    } else if (sortBy === "rating") {
      sorted.sort(
        (a: any, b: any) => (b.review_count || 0) - (a.review_count || 0)
      );
    }

    return sorted;
  }, [data, selectedColor, selectedSize, powerMin, powerMax, sortBy]);

  const handleClearFilters = () => {
    setSelectedColor("all");
    setSelectedSize("all");
    setPowerMin("");
    setPowerMax("");
  };

  const hasActiveFilters =
    selectedColor !== "all" ||
    selectedSize !== "all" ||
    powerMin !== "" ||
    powerMax !== "";

  return (
    <section className="w-full py-8 md:py-12 bg-white pt-0">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Filter Button */}
        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-200 text-black rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-normal text-black">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-black hover:underline font-normal"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Color Filter */}
                <div>
                  <label className="block text-xs font-normal text-black mb-2">
                    Color
                  </label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-black py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-sm"
                  >
                    <option value="all">All Colors</option>
                    {availableColors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size Filter */}
                <div>
                  <label className="block text-xs font-normal text-black mb-2">
                    Size
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-black py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-sm"
                  >
                    <option value="all">All Sizes</option>
                    {availableSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Power Range Filter */}
                <div>
                  <label className="block text-xs font-normal text-black mb-2">
                    Power Range (W)
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={powerMin}
                      onChange={(e) => setPowerMin(e.target.value)}
                      className="w-full sm:flex-1 bg-white border border-gray-200 text-black py-2 px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    />
                    <span className="text-gray-500 text-xs sm:mx-2">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={powerMax}
                      onChange={(e) => setPowerMax(e.target.value)}
                      className="w-full sm:flex-1 bg-white border border-gray-200 text-black py-2 px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filters Panel */}
          {showMobileFilters && (
            <div className="lg:hidden bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-normal text-black">Filters</h3>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="text-xs text-black hover:underline font-normal"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-500 hover:text-black"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Color Filter */}
                <div>
                  <label className="block text-xs font-normal text-black mb-2">
                    Color
                  </label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-black py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-sm"
                  >
                    <option value="all">All Colors</option>
                    {availableColors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size Filter */}
                <div>
                  <label className="block text-xs font-normal text-black mb-2">
                    Size
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-black py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-sm"
                  >
                    <option value="all">All Sizes</option>
                    {availableSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Power Range Filter */}
                <div>
                  <label className="block text-xs font-normal text-black mb-2">
                    Power Range (W)
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={powerMin}
                      onChange={(e) => setPowerMin(e.target.value)}
                      className="w-full sm:flex-1 bg-white border border-gray-200 text-black py-2 px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    />
                    <span className="text-gray-500 text-xs sm:mx-2">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={powerMax}
                      onChange={(e) => setPowerMax(e.target.value)}
                      className="w-full sm:flex-1 bg-white border border-gray-200 text-black py-2 px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Sort Dropdown - Top Left */}
            <div className="mb-6 flex items-center gap-2">
              <label
                htmlFor="sort"
                className="text-black text-sm font-normal whitespace-nowrap"
              >
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 text-black py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-sm min-w-[150px]"
              >
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest to Oldest</option>
                <option value="oldest">Oldest to Newest</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>

            {filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-sm">No products found</p>
                <p className="text-gray-400 text-xs mt-2">
                  Try changing your filter criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredAndSortedProducts.map(
                  (product: any, index: number) => {
                    const imageUrl = getThumbnailUrl(product);

                    // Check if product is on sale
                    const originalPrice =
                      product.original_price || product.price;
                    const salePrice = product.sale_price || product.price;
                    const isOnSale =
                      product.original_price &&
                      product.original_price > salePrice;
                    const hasDiscount =
                      product.discount || product.discount_percentage;

                    // Calculate sale price if discount exists
                    let finalSalePrice = salePrice;
                    let finalOriginalPrice = originalPrice;

                    if (hasDiscount && !isOnSale) {
                      const discountValue =
                        product.discount_percentage || product.discount || 0;
                      if (discountValue > 0) {
                        finalOriginalPrice =
                          typeof originalPrice === "number"
                            ? originalPrice
                            : parseFloat(originalPrice);
                        finalSalePrice =
                          finalOriginalPrice -
                          (finalOriginalPrice * discountValue) / 100;
                        if (finalSalePrice < finalOriginalPrice) {
                          // Only show sale if there's actually a discount
                        } else {
                          finalSalePrice = finalOriginalPrice;
                        }
                      }
                    }

                    const showSale =
                      isOnSale ||
                      (hasDiscount && finalSalePrice < finalOriginalPrice);

                    // Determine product tags
                    const tags: string[] = [];

                    // Check for On Sale (priority tag - show first)
                    if (showSale) {
                      tags.push("On Sale");
                    }

                    // Check for Newest (created within last 30 days)
                    if (product.created_at) {
                      const createdDate = new Date(product.created_at);
                      const daysSinceCreation =
                        (Date.now() - createdDate.getTime()) /
                        (1000 * 60 * 60 * 24);
                      if (daysSinceCreation <= 30) {
                        tags.push("Newest");
                      }
                    }

                    // Check for Best Seller (high order_count)
                    if (product.order_count && product.order_count > 50) {
                      tags.push("Best Seller");
                    }

                    return (
                      <div
                        key={index}
                        className="group cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      >
                        {/* Product Image Container - Premium Luxury Design */}
                        <div className="relative w-full aspect-square bg-white mb-3 overflow-hidden rounded-xl border border-gray-200 shadow-sm group-hover:shadow-lg transition-shadow duration-200">
                          {imageUrl ? (
                            <>
                              <Image
                                src={imageUrl}
                                className="w-full h-full object-cover"
                                alt={product.title}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                              />
                              {/* Product Tags - Bottom Left */}
                              {tags.length > 0 && (
                                <div className="absolute bottom-2 left-2 flex flex-col gap-1.5 z-10">
                                  {tags.map((tag, tagIndex) => (
                                    <div
                                      key={tagIndex}
                                      className="bg-black text-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide"
                                    >
                                      {tag}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <svg
                                className="w-12 h-12 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product Info - Left Aligned */}
                        <div className="text-left">
                          {/* Title */}
                          <h3 className="text-[13px] font-normal text-black mb-1.5 line-clamp-2 leading-tight">
                            {product.title}
                          </h3>

                          {/* Price */}
                          <div className="flex flex-col">
                            {showSale ? (
                              <>
                                <span className="text-[13px] font-normal text-black line-through mb-0.5 opacity-60">
                                  {formatPrice(
                                    typeof finalOriginalPrice === "number"
                                      ? finalOriginalPrice
                                      : parseFloat(finalOriginalPrice),
                                    country
                                  )}
                                </span>
                                <span className="text-[13px] font-normal text-black">
                                  {formatPrice(
                                    typeof finalSalePrice === "number"
                                      ? finalSalePrice
                                      : parseFloat(finalSalePrice),
                                    country
                                  )}
                                </span>
                              </>
                            ) : (
                              <span className="text-[13px] font-normal text-black">
                                {formatPrice(
                                  typeof originalPrice === "number"
                                    ? originalPrice
                                    : parseFloat(originalPrice),
                                  country
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductItems;
