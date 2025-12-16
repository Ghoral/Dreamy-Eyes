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

  // Auto-scroll animation
  useEffect(() => {
    if (!scrollContainerRef.current || offers.length === 0 || isPaused) return;

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

  // Duplicate offers for seamless loop
  const duplicatedOffers = [...offers, ...offers];

  return (
    <section className="bg-gradient-to-r from-primary-50 to-secondary-50 py-8 border-y border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-500 p-2 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-secondary-800">
              Available Offers
            </h2>
          </div>
          
          {/* Pause/Play Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-primary-200 hover:border-primary-400 transition-colors"
          >
            {isPaused ? (
              <>
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span className="text-sm font-medium text-secondary-700">Play</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
                <span className="text-sm font-medium text-secondary-700">Pause</span>
              </>
            )}
          </button>
        </div>

        {/* Offers Slider */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-hidden pb-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex space-x-4 w-max">
            {duplicatedOffers.map((offer, index) => {
              const isApplied =
                cartState.selectedOffer?.id === offer.id;

              return (
                <div
                  key={`${offer.id}-${index}`}
                  className={`relative flex-shrink-0 w-80 bg-white rounded-2xl p-6 border-2 transition-all duration-300 ${
                    isApplied
                      ? "border-green-500 shadow-lg shadow-green-200"
                      : "border-primary-200 hover:border-primary-400 hover:shadow-lg"
                  }`}
                >
                  {/* Applied Badge */}
                  {isApplied && (
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
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
                      <span>APPLIED</span>
                    </div>
                  )}

                  {/* Offer Content */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-secondary-800 mb-2">
                      {offer.title || offer.name}
                    </h3>
                    <p className="text-sm text-secondary-600 line-clamp-2">
                      {offer.description}
                    </p>
                  </div>

                  {/* Offer Details */}
                  <div className="space-y-2 mb-4">
                    {offer.discount_type && offer.discount_value && (
                      <div className="flex items-center space-x-2 text-sm">
                        <svg
                          className="w-5 h-5 text-primary-500"
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
                        <span className="text-secondary-700 font-semibold">
                          {offer.discount_type === "percentage"
                            ? `${offer.discount_value}% OFF`
                            : `$${offer.discount_value} OFF`}
                        </span>
                      </div>
                    )}

                    {offer.minimum_quantity && (
                      <div className="flex items-center space-x-2 text-sm">
                        <svg
                          className="w-5 h-5 text-secondary-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        <span className="text-secondary-600">
                          Min. {offer.minimum_quantity} items
                        </span>
                      </div>
                    )}

                    {offer.minimum_value && (
                      <div className="flex items-center space-x-2 text-sm">
                        <svg
                          className="w-5 h-5 text-secondary-400"
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
                        <span className="text-secondary-600">
                          Min. ${offer.minimum_value}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => handleApplyOffer(offer)}
                    disabled={isApplied}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                      isApplied
                        ? "bg-green-500 text-white cursor-not-allowed"
                        : "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {isApplied ? "Applied" : "Apply Offer"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Text */}
        <div className="text-center mt-2">
          <p className="text-sm text-secondary-500">
            Hover to pause • Auto-scrolling offers
          </p>
        </div>
      </div>
    </section>
  );
};

export default OffersSlider;
