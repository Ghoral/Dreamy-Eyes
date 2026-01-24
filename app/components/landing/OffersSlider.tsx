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
    <section id="offers-section" className="w-full pt-12 pb-4 bg-white relative overflow-hidden">
      <div className="max-w-[1700px] mx-auto px-4 md:px-12 relative z-10">
        <div className="mb-12 border-b border-secondary-100 pb-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-secondary-900 tracking-tighter uppercase whitespace-nowrap">
            Exclusive <span className="text-secondary-400 font-serif italic font-normal">Offers</span>
          </h2>
        </div>

        {/* Voucher Grid */}
        <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-12 gap-y-8 md:gap-y-16">
          {offers.map((offer, index) => {
            const isApplied = cartState.selectedOffer?.id === offer.id;

            return (
              <div
                key={`offer-${offer.id}-${index}`}
                onClick={() => !isApplied && handleApplyOffer(offer)}
                className="group cursor-pointer w-[calc(100%-1rem)] sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-2rem)] xl:w-[calc(25%-2.25rem)] max-w-[380px]"
              >
                <div className={`relative aspect-[16/9] mb-8 overflow-hidden rounded-2xl transition-all duration-700 ease-soft-spring border-2 ${isApplied ? "border-green-500 bg-green-50/30" : "border-secondary-50 bg-secondary-50"
                  }`}>
                  {/* Background Accents */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary-200 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                  </div>

                  {/* Content Container */}
                  <div className="relative h-full w-full p-8 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black tracking-[0.3em] uppercase text-secondary-400">
                        {offer.discount_type === 'percentage' ? 'TIER I' : 'TIER II'}
                      </span>
                      {isApplied && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-600 rounded-full">
                          <span className="text-[8px] font-black tracking-widest text-white uppercase">ACTIVE</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-black tracking-[0.2em] text-primary-500 uppercase mb-2">Member Privilege</h4>
                      <h3 className="text-3xl font-black text-secondary-900 tracking-tighter leading-none uppercase">
                        {offer.title || offer.name}
                      </h3>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-[11px] font-medium text-secondary-400 leading-relaxed uppercase tracking-wider line-clamp-2">
                        {offer.description || "Unlock special pricing and exclusive benefits with this limited time privilege."}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[8px] font-bold text-secondary-300 tracking-widest uppercase block mb-1">Status</span>
                      <span className={`text-[10px] font-black tracking-widest uppercase ${isApplied ? 'text-green-600' : 'text-secondary-900 group-hover:text-primary-500 transition-colors'}`}>
                        {isApplied ? "Claimed" : "Redeem (Click to Activate)"}
                      </span>
                    </div>
                  </div>

                  {/* Signature Animated Line */}
                  <div className="h-0.5 w-full bg-secondary-100 relative overflow-hidden mt-2">
                    <div className={`absolute inset-0 ${isApplied ? 'bg-green-500' : 'bg-primary-500'} transition-transform duration-700 ${isApplied ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'}`}></div>
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
