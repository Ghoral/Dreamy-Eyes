"use client";

import { getThumbnailUrl, formatPriceWithCurrency } from "@/app/util";
import Image from "next/image";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useCart } from "../../context/CartContext";
import Toast from "../ui/Toast";
import { useRouter } from "next/navigation";
import { useUserCountry } from "../../hooks/useUserCountry";
import { get_products } from "@/app/api/product";

const ProductItems = ({ data }: { data: any }) => {
  const { country } = useUserCountry();
  const [productsData, setProductsData] = useState<any>(data);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);
  const [toastConfig, setToastConfig] = useState<{
    message: string;
    isVisible: boolean;
  }>({ message: "", isVisible: false });
  const { addItem } = useCart();
  const router = useRouter();

  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [powerMin, setPowerMin] = useState<string>("");
  const [powerMax, setPowerMax] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const normalizedData = useMemo(() => {
    const targetData = productsData;
    if (!targetData) return [];
    if (Array.isArray(targetData)) return targetData;
    if (targetData.products && Array.isArray(targetData.products)) return targetData.products;
    if (targetData.data && Array.isArray(targetData.data)) return targetData.data;
    return [];
  }, [productsData]);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      // Skip initial fetch as data is provided via props
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      setIsLoading(true);
      try {
        const tagsToSend =
          selectedTag === "all"
            ? ["sale", "latest_arrival", "top_seller", "best_reviewed"]
            : [selectedTag];

        const { data: newData } = await get_products(1000, 0, tagsToSend);
        setProductsData(newData);
      } catch (error) {
        console.error("Error fetching filtered products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedTag]);

  const getProductLink = (product: any) => {
    const productId = product.id || product.title;
    const tags = product.tags;
    const subTitle = product.sub_title;
    let isSale = false;

    // Check tags
    if (Array.isArray(tags)) {
      isSale = tags.some((t) => String(t).toLowerCase().includes("sale"));
    } else if (typeof tags === "string") {
      isSale = tags.toLowerCase().includes("sale");
    }

    // Fallback: Check sub_title for "sale" keyword
    if (!isSale && typeof subTitle === "string") {
      isSale = subTitle.toLowerCase().includes("sale");
    }

    // Additional fallback: Check for sale indicators in price or discount
    if (!isSale && (product.discount_percentage || product.sale_price || product.original_price)) {
      isSale = true;
    }

    return isSale
      ? `/sale/${encodeURIComponent(productId)}`
      : `/${encodeURIComponent(productId)}`;
  };

  const handleProductClick = (product: any) => {
    router.push(getProductLink(product));
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();

    // Navigate to product detail page instead of adding to cart immediately
    router.push(getProductLink(product));
  };

  const availableColors = useMemo(() => {
    const colorSet = new Set<string>();
    if (!normalizedData) return [];
    normalizedData.forEach((product: any) => {
      if (product.color_quantity && Array.isArray(product.color_quantity)) {
        product.color_quantity.forEach((cq: any) => {
          if (cq?.label) {
            colorSet.add(String(cq.label));
          }
        });
      }
    });
    return Array.from(colorSet).sort();
  }, [normalizedData]);

  const availableTags = [
    { label: "Sale", value: "sale" },
    { label: "Latest Arrival", value: "latest_arrival" },
    { label: "Top Seller", value: "top_seller" },
    { label: "Best Reviewed", value: "best_reviewed" },
  ];

  const filteredProducts = useMemo(() => {
    if (!normalizedData) return [];
    let filtered = [...normalizedData];

    if (selectedColor !== "all") {
      filtered = filtered.filter((product) => {
        if (!product.color_quantity || !Array.isArray(product.color_quantity)) {
          return false;
        }
        return product.color_quantity.some(
          (cq: any) => String(cq.label) === selectedColor
        );
      });
    }

    if (priceMin || priceMax) {
      const min = priceMin ? parseFloat(priceMin) : -Infinity;
      const max = priceMax ? parseFloat(priceMax) : Infinity;
      filtered = filtered.filter((product) => {
        const p = product.price
          ? parseFloat(product.price.toString())
          : null;
        if (p === null || isNaN(p)) return false;
        return p >= min && p <= max;
      });
    }

    if (powerMin || powerMax) {
      const min = powerMin ? parseFloat(powerMin) : -Infinity;
      const max = powerMax ? parseFloat(powerMax) : Infinity;
      filtered = filtered.filter((product) => {
        const pw = product.power
          ? parseFloat(product.power.toString())
          : null;
        if (pw === null || isNaN(pw)) return false;
        return pw >= min && pw <= max;
      });
    }

    /* if (selectedTag !== "all") {
      // API now handles tag filtering, but we keep this as a safety check
      // or in case the API returns a superset.
      // If API returns exact matches, this is redundant but harmless.
      filtered = filtered.filter((product) => {
        const t = product?.tags;
        if (!t) return false;
        if (Array.isArray(t)) return t.includes(selectedTag);
        return String(t) === selectedTag;
      });
    } */

    return filtered;
  }, [normalizedData, selectedColor, priceMin, priceMax, powerMin, powerMax, selectedTag]);

  return (
    <section id="products-section" className="w-full py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
        <div
          className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            Premium Collection
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-secondary-800 mb-6 font-sans">
            Our Products
          </h2>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto leading-relaxed">
            Discover our premium selection of contact lenses designed for
            comfort, clarity, and style
          </p>
        </div>

        {/* Filter Button */}
        {filteredProducts && filteredProducts.length > 0 && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="inline-flex items-center px-5 py-2.5 bg-white border-2 border-primary-200 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 shadow-sm hover:shadow-md"
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
              {(selectedColor !== "all" || priceMin || priceMax || powerMin || powerMax || selectedTag !== "all") && (
                <span className="ml-2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts && filteredProducts.length > 0 ? (
          <div className={`flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            {filteredProducts.map((product: any, index: number) => {
              const imageUrl = getThumbnailUrl(product);
              const currentPrice = typeof product.price === "number" ? product.price : parseFloat(product.price);

              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300 cursor-pointer w-[calc(50%-8px)] md:w-[calc(50%-12px)] lg:w-[calc(33.33%-21.33px)] xl:w-[calc(25%-24px)] flex-shrink-0"
                  onClick={() => handleProductClick(product)}
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {imageUrl ? (
                      <>
                        <Image
                          src={imageUrl}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          alt={product.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                        {/* Subtle gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Tag Badge */}
                    {product.tags && (
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 shadow-md">
                          {typeof product.tags === "string" ? product.tags : Array.isArray(product.tags) ? product.tags[0] : ""}
                        </span>
                      </div>
                    )}

                    {/* Wishlist Icon */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-md transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-secondary-800 mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-primary-600 transition-colors">
                      {product.title}
                    </h3>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                        {formatPriceWithCurrency(currentPrice, country)}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full flex items-center justify-center bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                        />
                      </svg>
                      Add to Cart
                    </button>
                  </div>

                  {/* Accent line at bottom */}
                  <div className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </div>
              );
            })}
          </div>
        ) : (
          !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-slide-in">
              <div className="bg-white/50 backdrop-blur-sm p-12 rounded-[2.5rem] border border-primary-100 shadow-sm max-w-3xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-purple-50 rounded-full flex items-center justify-center mb-8 mx-auto shadow-inner">
                  <svg
                    className="w-10 h-10 text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-secondary-800 via-primary-700 to-secondary-800 bg-clip-text text-transparent mb-6">
                  Something Beautiful is Coming
                </h3>
                <p className="text-xl text-secondary-600 leading-relaxed max-w-xl mx-auto mb-4">
                  Our curated collection of premium lenses is currently being updated to ensure you only get the very best.
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary-300 to-transparent mx-auto rounded-full opacity-50 mb-4" />
                <p className="text-lg font-medium text-primary-500 italic">
                  Please check back soon for our latest arrivals.
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Filter Drawer */}
      {isFilterDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setIsFilterDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300 overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-secondary-800">Filters</h3>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Filter Options */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Color
                  </label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full bg-white border border-secondary-200 text-secondary-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    <option value="all">All</option>
                    {availableColors.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Price
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="flex-1 min-w-0 w-full bg-white border border-secondary-200 text-secondary-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="flex-1 min-w-0 w-full bg-white border border-secondary-200 text-secondary-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Power
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={powerMin}
                      onChange={(e) => setPowerMin(e.target.value)}
                      className="flex-1 min-w-0 w-full bg-white border border-secondary-200 text-secondary-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={powerMax}
                      onChange={(e) => setPowerMax(e.target.value)}
                      className="flex-1 min-w-0 w-full bg-white border border-secondary-200 text-secondary-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Tags
                  </label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full bg-white border border-secondary-200 text-secondary-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    <option value="all">All</option>
                    {availableTags.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={() => {
                    setSelectedColor("all");
                    setPriceMin("");
                    setPriceMax("");
                    setPowerMin("");
                    setPowerMax("");
                    setSelectedTag("all");
                  }}
                  className="w-full py-2 px-4 bg-secondary-100 text-secondary-700 font-semibold rounded-lg hover:bg-secondary-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      <Toast
        message={toastConfig.message}
        type="success"
        isVisible={toastConfig.isVisible}
        onClose={() => setToastConfig({ message: "", isVisible: false })}
        duration={2000}
      />
    </section>
  );
};

export default ProductItems;
