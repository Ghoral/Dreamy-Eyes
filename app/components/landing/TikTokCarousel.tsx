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
    <section className="relative py-32 bg-secondary-900 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[20%] left-[-10%] w-[60%] h-[60%] bg-primary-600 blur-[150px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-accent-600 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left: Creative Content */}
          <div className="space-y-12">
            <div>
              <span className="text-primary-400 font-black tracking-[0.4em] uppercase text-xs mb-6 block">Join the Culture</span>
              <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-8">
                SOCIAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">LOUNGE</span>
              </h2>
              <p className="text-xl text-white/60 font-medium max-w-lg leading-relaxed">
                Step into our digital universe. Real people, real stories, and the ultimate lens inspiration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 group hover:bg-white/10 transition-all duration-500">
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📸</div>
                <h4 className="text-white font-black text-lg mb-2">STYLE GUIDES</h4>
                <p className="text-white/40 text-sm">Discover how to pair lenses with your daily aesthetic.</p>
              </div>
              <div className="p-8 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 group hover:bg-white/10 transition-all duration-500">
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🔥</div>
                <h4 className="text-white font-black text-lg mb-2">TRENDING NOW</h4>
                <p className="text-white/40 text-sm">Stay ahead with the latest eye-fashion movements.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <a
                href={appDetails?.instagram_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center px-10 py-5 bg-white text-secondary-900 font-black tracking-widest text-xs rounded-full hover:bg-primary-500 hover:text-white transition-all duration-500 shadow-2xl"
              >
                FOLLOW US ON INSTAGRAM
              </a>
              <button
                onClick={scrollToProducts}
                className="flex-1 flex items-center justify-center px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black tracking-widest text-xs rounded-full hover:bg-white/10 transition-all duration-500"
              >
                SHOP THE LOOK
              </button>
            </div>
          </div>

          {/* Right: Modern Embed Frame */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-primary-500/20 blur-[100px] rounded-full"></div>

            <div className="relative bg-white p-4 rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transform rotate-2 hover:rotate-0 transition-transform duration-700 max-w-[380px] w-full">
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
