"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { get_sales } from "@/app/api/sales";
import { getThumbnailUrl, formatPriceWithCurrency } from "@/app/util";
import { useRouter } from "next/navigation";
import { useUserCountry } from "@/app/hooks/useUserCountry";
import { useCart } from "@/app/context/CartContext";
import Toast from "../ui/Toast";

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
      setLoading(true);
      const res = await get_sales(6, 0);
      if (mounted && res?.status && res?.data) {
        setSalesData(res.data);
      }
      setLoading(false);
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleProductClick = (product: Product) => {
    const productId = product.id || product.title;
    router.push(`/${encodeURIComponent(productId)}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();

    let maxQuantity = 1;
    if (product.color_quantity && Array.isArray(product.color_quantity) && product.color_quantity.length > 0) {
      maxQuantity = parseInt(product.color_quantity[0].quantity as string) || 1;
    }

    const currentPrice =
      typeof product.price === "number"
        ? product.price
        : parseFloat(product.price as string);

    addItem({
      id: product.id || product.title,
      title: product.title,
      description: product.description,
      price: currentPrice,
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
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold rounded-full mb-4 animate-pulse">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Special Offers
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-secondary-800 mb-6">
            🔥 On Sale Now
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto leading-relaxed">
            Don&apos;t miss out on these amazing deals! Limited time offers on our
            best products.
          </p>
        </div>

        {/* Sales Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {salesData.map((product, index) => {
            const imageUrl = getThumbnailUrl(product);
            const currentPrice = typeof product.price === "number" ? product.price : parseFloat(product.price);

            return (
              <div 
                key={product.id || index} 
                className="group relative bg-white rounded-xl overflow-hidden border border-red-100 hover:border-red-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-red-50 to-orange-50">
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

                  {/* SALE Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 shadow-md animate-pulse">
                      SALE
                    </span>
                  </div>

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
                  <h3 className="text-sm font-semibold text-secondary-800 mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-red-600 transition-colors">
                    {product.title}
                  </h3>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                      {formatPriceWithCurrency(currentPrice, country)}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
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
                <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
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
