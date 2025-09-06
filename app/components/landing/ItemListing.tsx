"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { get_all_products_with_types } from "@/app/api/product";
import { getFirstImageUrl, getThumbnailUrl } from "@/app/util";

type Product = {
  id: string;
  images: string;
  title: string;
  description: string; // HTML
  price: number | string;
};

type SectionKey = "latest_arrival" | "top_seller" | "best_reviewed";

const ItemListing = () => {
  const [sectionsData, setSectionsData] = useState<
    Partial<Record<SectionKey, Product[]>>
  >({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      const res = await get_all_products_with_types();
      if (mounted && res?.status && res?.data) {
        const raw = Array.isArray(res.data) ? res.data[0] : res.data;
        const normalized: Partial<Record<SectionKey, Product[]>> = {
          latest_arrival:
            (raw as any)?.latest_arrival || (raw as any)?.latestArrivals || (raw as any)?.latest || [],
          top_seller:
            (raw as any)?.top_seller || (raw as any)?.top_sellers || (raw as any)?.topSeller || [],
          best_reviewed:
            (raw as any)?.best_reviewed || (raw as any)?.bestReviewed || (raw as any)?.best || [],
        };
        setSectionsData(normalized);
      }
      setLoading(false);
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const orderedSections = useMemo(() => {
    const entries: Array<{ key: SectionKey; label: string }> = [
      { key: "latest_arrival", label: "Latest Arrivals" },
      { key: "top_seller", label: "Best Sellers" },
      { key: "best_reviewed", label: "Top Reviews" },
    ];
    return entries.filter(
      (e) =>
        Array.isArray(sectionsData[e.key]) &&
        (sectionsData[e.key]?.length || 0) > 0
    );
  }, [sectionsData]);

  return (
    <section className="py-20 bg-gradient-to-br from-white via-secondary-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
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
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Collections
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-secondary-800 mb-6">
            Explore Our Fashion Lens Collections
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto leading-relaxed">
            From the latest trends to customer favorites, discover the perfect
            lenses to express your unique style
          </p>
        </div>

        {/* Products Grid with Animation */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-12">
          {loading && (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
              <p className="text-secondary-600 font-medium">Loading amazing products...</p>
            </div>
          )}

          {!loading && orderedSections.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-md w-full">
              <svg className="w-16 h-16 text-secondary-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01M12 4a8 8 0 100 16 8 8 0 000-16z" />
              </svg>
              <p className="text-secondary-600 text-lg">No collections to display</p>
              <p className="text-secondary-500 mt-2">Please check back later for new products</p>
            </div>
          )}

          {!loading &&
            orderedSections.map((section) => {
              console.log("section", section);

              const products = (sectionsData[section.key] || []).slice(0, 3);
              const first = products[0];
              const firstImage = first ? getThumbnailUrl(first) : null;

              return (
                <div
                  key={section.key}
                  className="group bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-secondary-100 overflow-hidden max-w-sm w-full animate-fade-in"
                  style={{ animationDelay: `${orderedSections.indexOf(section) * 0.15}s` }}
                >
                  <div className="relative h-48 bg-gradient-to-br from-secondary-100 to-primary-100 overflow-hidden">
                    {firstImage ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${firstImage}`}
                        alt={first?.title || section.label}
                        fill
                        className="object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Image
                        src="/images/logo.png"
                        alt={section.label}
                        fill
                        className="object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-500 text-white">
                        {section.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-secondary-800 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                      {first?.title || section.label}
                    </h3>
                    <div
                      className="text-secondary-500 text-sm mb-4 line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: first?.description || "",
                      }}
                    />
                    <div className="mb-4">
                      {first && (
                        <span className="text-2xl font-bold text-primary-600">
                          $
                          {typeof first.price === "number"
                            ? first.price
                            : first.price}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/shop?type=${section.key}`}
                      className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
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
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      Shop Now
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Look?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of fashion-forward customers who trust us for their
              style needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center px-8 py-4 bg-white text-primary-600 hover:bg-primary-50 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-lg"
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Shop All Lenses
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItemListing;
