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
      <section className="relative py-20 bg-secondary-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <p className="text-white/60">Loading social lounge...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-12 bg-white overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-[20%] left-[-10%] w-[60%] h-[60%] bg-primary-100 blur-[150px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-accent-100 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left: Creative Content */}
          <div className="space-y-12">
            <div>
              <span className="text-primary-500 font-black tracking-[0.4em] uppercase text-xs mb-6 block">Join the Culture</span>
              <h2 className="text-6xl md:text-8xl font-black text-secondary-900 tracking-tighter leading-none mb-8">
                SOCIAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">LOUNGE</span>
              </h2>
              <p className="text-xl text-secondary-400 font-medium max-w-lg leading-relaxed">
                Step into our digital universe. Real people, real stories, and the ultimate lens inspiration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 bg-secondary-50 backdrop-blur-2xl rounded-2xl border border-secondary-100 group hover:bg-secondary-100 transition-all duration-500">
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📸</div>
                <h4 className="text-secondary-900 font-black text-lg mb-2">STYLE GUIDES</h4>
                <p className="text-secondary-400 text-sm">Discover how to pair lenses with your daily aesthetic.</p>
              </div>
              <div className="p-8 bg-secondary-50 backdrop-blur-2xl rounded-2xl border border-secondary-100 group hover:bg-secondary-100 transition-all duration-500">
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🔥</div>
                <h4 className="text-secondary-900 font-black text-lg mb-2">TRENDING NOW</h4>
                <p className="text-secondary-400 text-sm">Stay ahead with the latest eye-fashion movements.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <a
                href={appDetails?.instagram_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center px-10 py-5 bg-secondary-900 text-white font-black tracking-widest text-xs rounded-full hover:bg-primary-500 transition-all duration-500 shadow-2xl"
              >
                FOLLOW US ON INSTAGRAM
              </a>
              <button
                onClick={scrollToProducts}
                className="flex-1 flex items-center justify-center px-10 py-5 bg-white border border-secondary-100 text-secondary-900 font-black tracking-widest text-xs rounded-full hover:bg-secondary-50 transition-all duration-500"
              >
                SHOP THE LOOK
              </button>
            </div>
          </div>

          {/* Right: Modern Embed Frame */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-primary-200 blur-[100px] rounded-full opacity-60"></div>

            <div className="relative bg-white p-4 rounded-2xl shadow-xl max-w-[380px] w-full border border-secondary-100">
              <div className="rounded-xl overflow-hidden">
                <InstagramEmbed
                  url={appDetails?.instagram?.[0] || 'https://www.instagram.com/reels/DFCsfB1z2I0/'}
                  width="100%"
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
