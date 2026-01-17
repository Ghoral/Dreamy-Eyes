"use client";

import { useState, useEffect, useRef } from "react";
import { get_enabled_offers } from "@/app/api/offers";
import { useCart, Offer } from "@/app/context/CartContext";

const OffersSlider = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { state: cartState, setOffer } = useCart();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await get_enabled_offers();
        if (response.status && response.data) {
          setOffers(response.data);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Auto-scroll animation removed as per user request to show only DB data without duplication
  /*
  useEffect(() => {
    // Disable animation if only one offer or paused
    if (!scrollContainerRef.current || offers.length <= 1 || isPaused) return;

    const scrollContainer = scrollContainerRef.current;
    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      // Reset scroll position when reaching the end of the first set
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [offers, isPaused]);
  */

  const handleApplyOffer = (offer: Offer) => {
    // Apply offer with current cart items
    setOffer(offer, cartState.items);
  };

  if (loading) {
    return (
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return null;
  }

  // Use offers directly from DB without duplication
  const displayOffers = offers;
  const isSingleOffer = offers.length === 1;

  return (
    <section id="offers-section" className="bg-secondary-900 py-32 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-primary-500 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] bg-accent-500 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 px-4 md:px-8">
          <div className="max-w-2xl">
            <span className="text-primary-400 font-black tracking-[0.3em] uppercase text-xs mb-4 block">Special Rewards</span>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none">
              Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Offer</span> Lounge
            </h2>
            <p className="text-xl text-white/60 font-medium">Curated benefits for our most discerning customers. Collect and apply during checkout.</p>
          </div>

          <div className="flex gap-4 mt-8 md:mt-0">
            <button
              onClick={() => scrollContainerRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
              className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-secondary-900 transition-all duration-500 backdrop-blur-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => scrollContainerRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
              className="w-14 h-14 rounded-full bg-white text-secondary-900 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all duration-500 shadow-xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* Scrollable Container with start/end padding to prevent cutting */}
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto pb-12 pt-4 px-4 md:px-8 no-scrollbar scroll-smooth snap-x snap-mandatory justify-start md:justify-center"
        >
          {displayOffers.map((offer, index) => {
            const isApplied = cartState.selectedOffer?.id === offer.id;

            return (
              <div
                key={`${offer.id}-${index}`}
                className="flex-shrink-0 w-[320px] snap-start"
              >
                <div className={`relative h-[220px] rounded-2xl overflow-hidden group transition-all duration-700 ${isApplied ? "scale-105 shadow-[0_0_50px_rgba(195,78,138,0.3)]" : "hover:scale-[1.02]"
                  }`}>
                  {/* Card Background Layer */}
                  <div className={`absolute inset-0 transition-colors duration-700 ${isApplied ? "bg-primary-600" : "bg-white/5 backdrop-blur-xl border border-white/10"
                    }`} />

                  {/* Graphic Element */}
                  <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/5 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-1000" />

                  {/* Content Layout */}
                  <div className="relative h-full p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase font-price ${isApplied ? "bg-white text-primary-600" : "bg-primary-500 text-white"
                          }`}>
                          {offer.discount_type === 'percentage' ? `${offer.discount_value}% DISCOUNT` : `$${offer.discount_value} OFF`}
                        </div>
                        {isApplied && (
                          <div className="animate-pulse text-white">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          </div>
                        )}
                      </div>

                      <h3 className={`text-3xl font-black mb-2 tracking-tight ${isApplied ? "text-white" : "text-white"}`}>
                        {offer.title || offer.name}
                      </h3>
                      <p className={`text-sm font-medium leading-relaxed max-w-[80%] ${isApplied ? "text-white/80" : "text-white/50"}`}>
                        {offer.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleApplyOffer(offer)}
                        disabled={isApplied}
                        className={`px-8 py-3 rounded-2xl font-black text-sm transition-all duration-500 ${isApplied
                          ? "bg-white/10 text-white border border-white/20 cursor-default"
                          : "bg-white text-secondary-900 shadow-xl hover:bg-primary-500 hover:text-white"
                          }`}
                      >
                        {isApplied ? "ACTIVATED" : "APPLY OFFER"}
                      </button>
                      <div className={`text-[10px] font-bold tracking-widest ${isApplied ? "text-white/40" : "text-white/20"}`}>
                        REF: {String(offer.id).slice(0, 8).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OffersSlider;
