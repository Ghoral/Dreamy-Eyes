"use client";

import { useState, useEffect } from "react";
import { get_enabled_offers } from "@/app/api/offers";
import { useCart, Offer } from "@/app/context/CartContext";

const OffersSlider = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleApplyOffer = (offer: Offer) => {
    setOffer(offer, cartState.items);
  };

  if (loading || !offers || offers.length === 0) {
    return null;
  }

  return (
    <section id="offers-section" className="bg-secondary-900 py-6 md:py-12 relative overflow-hidden">
      {/* Premium Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-primary-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-accent-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10 px-6">
        {/* Boutique Header */}
        <div className="flex flex-col items-center text-center mb-8 md:mb-12">
          <span className="text-primary-400 font-black tracking-[0.4em] uppercase text-[9px] mb-2 block">Member Exclusives</span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter leading-none">
            REWARD <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-300">VAULT</span>
          </h2>
          <p className="text-[10px] md:text-xs text-secondary-400 font-bold uppercase tracking-widest max-w-sm">Curated privileges for your collection.</p>
        </div>

        {/* 2-Column Voucher Grid */}
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-center justify-center gap-4 md:gap-6">
          {offers.map((offer, index) => {
            const isApplied = cartState.selectedOffer?.id === offer.id;

            return (
              <div
                key={`offer-${offer.id}-${index}`}
                onClick={() => !isApplied && handleApplyOffer(offer)}
                className={`group relative flex flex-col items-center justify-between w-full lg:w-[280px] aspect-[4/5] lg:aspect-auto lg:h-[320px] p-6 md:p-8 rounded-[1.5rem] border transition-all duration-700 cursor-pointer overflow-hidden ${isApplied
                  ? "bg-white border-white shadow-[0_30px_60px_rgba(255,255,255,0.1)] scale-105"
                  : "bg-white/5 border-white/10 hover:border-primary-500/30 hover:bg-white/10"
                  }`}
              >
                {/* Background Decor */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full transition-opacity duration-700 ${isApplied ? 'bg-primary-500/10 opacity-100' : 'bg-primary-500/5 opacity-0 group-hover:opacity-100'}`} />

                {/* Voucher Header: Icon */}
                <div className={`text-4xl md:text-6xl mb-4 md:mb-6 transition-all duration-700 ${isApplied ? 'saturate-100 scale-110' : 'saturate-0 opacity-20 group-hover:opacity-100 group-hover:scale-110'}`}>
                  {offer.discount_type === 'percentage' ? '🏷️' : '🎁'}
                </div>

                {/* Content */}
                <div className="text-center flex-1 flex flex-col justify-center gap-2 md:gap-4">
                  <span className={`text-[8px] md:text-[10px] font-black tracking-[0.3em] uppercase ${isApplied ? 'text-primary-500' : 'text-primary-500/60'}`}>
                    {isApplied ? "Privilege Applied" : "Redeem Privilege"}
                  </span>
                  <h3 className={`text-sm md:text-3xl font-black tracking-tighter leading-none uppercase ${isApplied ? 'text-secondary-900' : 'text-white'}`}>
                    {offer.title || offer.name}
                  </h3>
                  {offer.description && (
                    <p className={`hidden md:block text-[11px] font-medium leading-tight opacity-40 line-clamp-2 ${isApplied ? 'text-secondary-900' : 'text-white'}`}>
                      {offer.description}
                    </p>
                  )}
                </div>

                {/* Footer Checkmark (Applied Only) */}
                <div className="mt-2 w-full flex justify-center items-center h-8">
                  {isApplied && (
                    <div className="bg-primary-500 text-white p-1.5 rounded-full shadow-lg">
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                  )}
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
