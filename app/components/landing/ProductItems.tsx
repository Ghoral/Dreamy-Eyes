"use client";

import { getFirstImageUrl, getThumbnailUrl } from "@/app/util";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import Toast from "../ui/Toast";
import { useRouter } from "next/navigation";

const ProductItems = ({ data }: { data: any }) => {
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [toastConfig, setToastConfig] = useState<{
    message: string;
    isVisible: boolean;
  }>({ message: "", isVisible: false });
  const { addItem } = useCart();
  const router = useRouter();

  const handleProductClick = (product: any) => {
    const productId = product.id || product.title;
    router.push(`/${encodeURIComponent(productId)}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();

    let maxQuantity = 1;
    if (product.colors) {
      try {
        const colorData = JSON.parse(product.colors);
        if (colorData.length > 0) {
          maxQuantity = parseInt(colorData[0].quantity) || 1;
        }
      } catch (error) {
        console.error("Error parsing color data:", error);
      }
    }

    addItem({
      id: product.id || product.title,
      title: product.title,
      description: product.description,
      price: product.price,
      quantity: 1,
      image: getThumbnailUrl(product) || undefined,
      primary_thumbnail: product.primary_thumbnail || undefined,
      maxQuantity: maxQuantity,
    });

    setToastConfig({
      message: `${product.title} added to cart!`,
      isVisible: true,
    });
  };

  return (
    <section className="w-full py-20 bg-gradient-to-b from-white to-secondary-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div
          className="absolute bottom-20 left-10 w-72 h-72 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "1s" }}
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
          <h2 className="text-4xl sm:text-5xl font-bold text-secondary-800 mb-6">
            Our Products
          </h2>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto leading-relaxed">
            Discover our premium selection of contact lenses designed for
            comfort, clarity, and style
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {data?.map((product: any, index: number) => {
            const isHovered = hoveredItem === index;
            const imageUrl = getThumbnailUrl(product);

            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleProductClick(product)}
              >
                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full shadow-lg">
                      {product.discount}
                    </span>
                  </div>
                )}

                {/* Product Image */}
                <div className="relative h-48 bg-gradient-to-br from-secondary-50 to-primary-50 overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${imageUrl}`}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-secondary-300"
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

                  {/* Hover Overlay */}
                  {isHovered && (
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent flex items-center justify-center">
                      <div className="bg-white rounded-full p-3 shadow-2xl transform scale-100 animate-fade-in">
                        <svg
                          className="w-6 h-6 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="text-base font-bold text-secondary-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
                    {product.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-secondary-600 text-sm mb-3 line-clamp-2 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-3 h-3 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-secondary-500 ml-2">
                      4.9 (120)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-primary-600">
                      ${product.price}
                    </span>
                    {product.discount && (
                      <span className="text-sm text-secondary-500 line-through">
                        ${(parseFloat(product.price) * 1.2).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-2 px-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-lg text-sm"
                    >
                      <svg
                        className="w-4 h-4 mr-1 inline"
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
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-200 transition-all duration-500"></div>
              </div>
            );
          })}
        </div>
      </div>

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
