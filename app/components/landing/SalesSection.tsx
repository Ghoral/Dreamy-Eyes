"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { get_products } from "@/app/api/product";
import { getThumbnailUrl, formatPrice } from "@/app/util";
import { useRouter } from "next/navigation";
import { useUserCountry } from "@/app/hooks/useUserCountry";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import Toast from "../ui/Toast";
import ProductCardShimmer from "../ui/ProductCardShimmer";

type Product = {
  id: string;
  images: string;
  title: string;
  description: string;
  price: number | string;
  sub_title?: string;
  tags?: string | string[];
  color_quantity?: Array<{
    color: string;
    quantity: string | number;
    label: string;
  }>;
  primary_thumbnail?: string | null;
  [key: string]: any;
};

const SalesSection = () => {
  const { country } = useUserCountry();
  const [salesData, setSalesData] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { addItem } = useCart();
  const [toastConfig, setToastConfig] = useState<{
    message: string;
    isVisible: boolean;
  }>({ message: "", isVisible: false });

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (!country) return; // Wait for country to be determined
      console.log('[SalesSection] Fetching products for country:', country);
      setLoading(true);
      const res = await get_products(6, 0, ["sale"], country);
      if (mounted && res?.status && res?.data) {
        let products = [];
        if (Array.isArray(res.data)) {
          products = res.data;
        } else if (res.data.products && Array.isArray(res.data.products)) {
          products = res.data.products;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          products = res.data.data;
        }
        setSalesData(products);
      }
      setLoading(false);
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [country]);

  const handleProductClick = (product: Product) => {
    const productId = product.id || product.title;
    router.push(`/sale/${encodeURIComponent(productId)}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();

    // Navigate to product detail page instead of adding to cart immediately
    const productId = product.id || product.title;
    router.push(`/sale/${encodeURIComponent(productId)}`);
  };

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading || salesData.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-red-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
        <div
          className="absolute bottom-20 left-10 w-96 h-96 bg-orange-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold rounded-full mb-6 shadow-sm animate-pulse">
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
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.932-7.132A8 8 0 0117.657 18.657zM15 5.341A7.99 7.99 0 0117.385 7c0-2.435-.818-4.138-1.385-5.341.567 1.203 1.385 2.906 1.385 5.341z"
              />
            </svg>
            HOT SALES
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-secondary-900 mb-6 tracking-tight">
            Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">Exclusive</span> Deals
          </h2>
          <p className="text-lg md:text-xl text-secondary-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Discover unbeatable prices on our top-rated lenses. Limited time offers you don't want to miss!
          </p>
        </div>

        {/* Sales Products Grid */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8">
          {!country || loading ? (
            // Show shimmer until country is determined and data is loaded
            [...Array(6)].map((_, i) => (
              <div key={i} className="w-[calc(100%-1rem)] sm:w-[calc(50%-0.5rem)] md:w-[calc(33.33%-0.67rem)] lg:w-[calc(25%-0.75rem)] max-w-sm">
                <ProductCardShimmer />
              </div>
            ))
          ) : salesData.map((product, index) => {
            const imageUrl = getThumbnailUrl(product);
            const currentPrice = typeof product.price === "number" ? product.price : parseFloat(product.price);

            return (
              <div
                key={product.id || index}
                className="group relative bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-secondary-100 overflow-hidden w-[calc(100%-1rem)] sm:w-[calc(50%-0.5rem)] md:w-[calc(33.33%-0.67rem)] lg:w-[calc(25%-0.75rem)] max-w-sm"
              >
                <Link href={`/${product.id || product.title}`} className="block h-full">
                  {/* Image Container */}
                  <div className="relative aspect-square bg-gradient-to-br from-secondary-100 to-primary-100 overflow-hidden">
                    {imageUrl ? (
                      <>
                        <Image
                          src={imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
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

                    {/* SALE Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-500 text-white shadow-md animate-pulse">
                        SALE
                      </span>
                    </div>

                    {/* Wishlist Icon */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-md transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <svg className="w-4 h-4 text-gray-600 hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>

                    {/* Tags */}
                    {product.tags && (Array.isArray(product.tags) ? product.tags.length > 0 : product.tags) && (
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm border border-white/20">
                          {Array.isArray(product.tags) ? product.tags[0] : product.tags}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-secondary-800 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                      {product.title}
                    </h3>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary-600">
                        {formatPrice(currentPrice, country)}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(e, product);
                      }}
                      className="w-full inline-flex items-center justify-center px-4 py-2 md:py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
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
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                        />
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        {salesData.length >= 6 && (
          <div className="text-center mt-12">
            <button
              onClick={scrollToProducts}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View All Products
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}
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

export default SalesSection;
