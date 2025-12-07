"use client";

import { InstagramEmbed } from "react-social-media-embed";
import { useEffect, useState } from "react";
import { get_app_details } from "@/app/api/product";

const InstagramCarousel = () => {
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

  // Get Instagram link from appDetails (prioritize instagram_link, fallback to instagram)
  const instagramLink = appDetails?.instagram_link || appDetails?.instagram;

  if (loading) {
    return (
      <section className="relative py-20 bg-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no Instagram link
  if (!instagramLink) {
    return null;
  }

  return (
    <section className="relative py-20 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-normal text-black mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Follow Our Journey
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Get inspired by the latest fashion lens trends and styling tips on Instagram
          </p>
        </div>

        {/* Instagram Embed */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <InstagramEmbed
              url={instagramLink}
              width={328}
            />
          </div>
        </div>

        {/* Follow Button */}
        <div className="text-center mt-8">
          <a
            href={instagramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-black text-black hover:bg-black hover:text-white transition-all duration-300 text-sm uppercase tracking-wide"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            Follow Us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramCarousel;
