"use client";

import { useState, useEffect } from "react";
import { get_enabled_offers } from "../../api/offers";
import { useCart, Offer } from "../../context/CartContext";

const OffersSlider = ({ initialData }: { initialData?: Offer[] }) => {
  const [offers, setOffers] = useState<Offer[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const { state: cartState, setOffer } = useCart();

  useEffect(() => {
    if (initialData) return;
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
    <section id="offers-section" className="bg-gradient-to-br from-white via-secondary-50 to-primary-50/20 py-8 md:py-16 relative overflow-hidden mx-auto w-[92%] md:w-[96%] max-w-[1600px] rounded-[5px] border border-secondary-100 shadow-none mt-4 md:mt-0 mb-8 md:mb-12">
      {/* Soft Background Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-primary-100/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[80%] bg-secondary-100/30 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10 px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <span className="text-secondary-400 font-bold tracking-[0.3em] uppercase text-[10px] mb-3 bg-white border border-secondary-100 px-3 py-1 rounded-full">Limited Access</span>
          <h2 className="text-3xl md:text-5xl font-black text-secondary-900 tracking-tight mb-2">
            EXCLUSIVE <span className="text-primary-500 font-serif italic font-normal">Privileges</span>
          </h2>
        </div>

        {/* Voucher Grid */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {offers.map((offer, index) => {
            const isApplied = cartState.selectedOffer?.id === offer.id;

            return (
              <div
                key={`offer-${offer.id}-${index}`}
                onClick={() => !isApplied && handleApplyOffer(offer)}
                className={`group relative flex flex-col items-center justify-between p-4 md:p-8 rounded-[5px] border transition-all duration-300 cursor-pointer overflow-hidden w-[calc(50%-0.5rem)] md:w-auto md:min-w-[240px] ${isApplied
                  ? "bg-green-50 border-green-500 shadow-none scale-[1.02]"
                  : "bg-white border-secondary-100 hover:border-primary-200 hover:shadow-sm hover:-translate-y-1"
                  }`}
              >
                {/* Icon */}
                <div className={`text-4xl md:text-5xl mb-4 transition-transform duration-300 ${isApplied ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'}`}>
                  {offer.discount_type === 'percentage' ? '💎' : '🎁'}
                </div>

                {/* Content */}
                <div className="text-center flex-1 flex flex-col justify-center gap-2 w-full">
                  <h3 className={`text-xl md:text-2xl font-black leading-none uppercase ${isApplied ? 'text-green-900' : 'text-secondary-900'}`}>
                    {offer.title || offer.name}
                  </h3>
                  {offer.description && (
                    <p className={`text-[11px] font-medium leading-relaxed line-clamp-2 ${isApplied ? 'text-green-700/80' : 'text-secondary-500'}`}>
                      {offer.description}
                    </p>
                  )}
                </div>

                {/* Action Button Look */}
                <div className={`mt-6 w-full py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase text-center transition-colors ${isApplied
                  ? "bg-green-600 text-white"
                  : "bg-secondary-50 text-secondary-900 group-hover:bg-secondary-900 group-hover:text-white"
                  }`}>
                  {isApplied ? "Applied" : "Redeem"}
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
