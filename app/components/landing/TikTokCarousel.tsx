"use client";

import { InstagramEmbed } from "react-social-media-embed";
import { useEffect, useState } from "react";
import { get_app_details } from "@/app/api/product";

const TikTokCarousel = () => {
  const [appDetails, setAppDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppDetails = async () => {
      try {
        const response = await get_app_details();
        if (response.status) {
          setAppDetails(response.data);
        }
      } catch (error) {
        console.error("Error fetching app details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppDetails();
  }, []);

  const scrollToProducts = () => {
    const productsSection = document.getElementById("products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <section className="relative py-20 bg-gradient-to-br from-secondary-50 via-white to-primary-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <p className="text-secondary-600">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 bg-gradient-to-br from-secondary-50 via-white to-primary-50 overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div
          className="absolute bottom-20 left-10 w-72 h-72 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
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
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 4v2m0 0h6m-6 0v2"
              />
            </svg>
            Social Media
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-secondary-800 mb-6">
            Follow Our Fashion Journey
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto leading-relaxed">
            Get inspired by the latest fashion lens trends, styling tips, and
            behind-the-scenes content on Instagram
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-soft p-8 border border-secondary-100">
              <h3 className="text-2xl font-bold text-secondary-800 mb-4">
                Expert Tips & Advice
              </h3>
              <p className="text-secondary-600 mb-6 leading-relaxed">
                Discover the latest fashion lens trends, learn how to style your
                lenses for different occasions, and get expert advice on
                choosing the perfect color for your look.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-3 h-3 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-secondary-700">
                    Daily fashion lens inspiration
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-3 h-3 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-secondary-700">
                    Styling tips and tutorials
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-3 h-3 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-secondary-700">
                    Behind-the-scenes content
                  </span>
                </div>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="space-y-4">
              <a
                href={
                  appDetails?.follow_us_instagram ||
                  "https://www.instagram.com/yourfashionlens"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.225-.149-4.771-1.664-4.919-4.919-.058-1.265-.069-1.644-.069-4.849 0-3.204.012-3.584.069-4.849.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.36-.2 6.78-2.618 6.98-6.98.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.667-.072-4.947-.2-4.361-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Follow Us on Instagram
              </a>

              <button
                onClick={scrollToProducts}
                className="w-full flex items-center justify-center px-8 py-4 bg-white border-2 border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400 font-semibold rounded-2xl transition-all duration-300"
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
                Shop Fashion Lenses
              </button>
            </div>

          </div>

          {/* Right Column - TikTok Embed */}
          <div className="flex justify-center">
            <div className="bg-white rounded-3xl shadow-soft p-6 border border-secondary-100">
              <div className="w-full max-w-sm">
                <InstagramEmbed
                  url={
                    appDetails?.instagram_link ||
                    "https://www.instagram.com/reel/C8q_q_qP_qP/"
                  }
                  width={325}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TikTokCarousel;
