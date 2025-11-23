"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { get_sales } from "@/app/api/sales";
import { getThumbnailUrl } from "@/app/util";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  images: string;
  title: string;
  description: string;
  price: number | string;
  sub_title?: string;
  color_quantity?: Array<{
    color: string;
    quantity: string | number;
    label: string;
  }>;
  primary_thumbnail?: string | null;
  [key: string]: any;
};

const SalesSection = () => {
  const [salesData, setSalesData] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      const res = await get_sales(6, 0); // Get first 6 sales items
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
    // Navigate to sales product detail page
    router.push(`/sales/${encodeURIComponent(productId)}`);
  };


  if (loading || salesData.length === 0) {
    return null; // Don't show section if no sales
  }

  return (
    <section className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Don't miss out on these amazing deals! Limited time offers on our best products.
          </p>
        </div>

        {/* Sales Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {salesData.slice(0, 6).map((product, index) => {
            const imageUrl = getThumbnailUrl(product);

            return (
              <div
                key={product.id || index}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-red-200 overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Sale Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                    SALE
                  </span>
                </div>

                {/* Product Image */}
                <div
                  className="relative h-64 bg-gradient-to-br from-red-50 to-orange-50 overflow-hidden cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.title}
                      fill
                      className="object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <Image
                      src="/images/logo.png"
                      alt={product.title}
                      fill
                      className="object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-secondary-800 mb-2 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                    {product.title}
                  </h3>
                  {product.sub_title && (
                    <p className="text-sm text-secondary-500 mb-3">{product.sub_title}</p>
                  )}
                  <div
                    className="text-secondary-500 text-sm mb-4 line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: product.description || "",
                    }}
                  />

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-red-600">
                        ${typeof product.price === "string" ? parseFloat(product.price) : product.price}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleProductClick(product)}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Details
                  </button>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-red-300 transition-all duration-500 pointer-events-none"></div>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        {salesData.length >= 6 && (
          <div className="text-center mt-12">
            <Link
              href="/sales"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View All Sales
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>

    </section>
  );
};

export default SalesSection;

