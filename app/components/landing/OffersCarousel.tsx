"use client";

import { useEffect, useState } from "react";

interface Offer {
  id: number;
  name: string;
  value: number;
  quantity: number;
  type: string;
  is_enabled: boolean;
}

interface OffersDisplayProps {
  offers: Offer[];
}

const OffersDisplay = ({ offers }: OffersDisplayProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !offers || offers.length === 0) {
    return null;
  }

  // Gradient colors for different offers
  const gradients = [
    "from-purple-600 via-pink-600 to-red-600",
    "from-blue-600 via-cyan-600 to-teal-600",
    "from-orange-600 via-red-600 to-pink-600",
    "from-green-600 via-emerald-600 to-teal-600",
    "from-indigo-600 via-purple-600 to-pink-600",
  ];

  return (
    <div className="w-full pt-8 sm:pt-10 pb-0 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-3 sm:mb-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            🎉 Special Offers
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Don't miss out on these amazing deals!
          </p>
        </div>

        {/* Offers Grid */}
        <div className={`grid gap-4 sm:gap-6 ${
          offers.length === 1 
            ? "grid-cols-1 max-w-2xl mx-auto" 
            : offers.length === 2 
            ? "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto" 
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}>
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]} opacity-90 group-hover:opacity-100 transition-opacity`} />
              
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000" />
              </div>

              {/* Content */}
              <div className="relative p-6 sm:p-8 text-white">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl sm:text-4xl animate-bounce">
                    {index % 3 === 0 ? "🎁" : index % 3 === 1 ? "⚡" : "🔥"}
                  </div>
                </div>

                {/* Offer Name */}
                <h3 className="text-xl sm:text-2xl font-bold text-center mb-3 leading-tight">
                  {offer.name}
                </h3>

                {/* Offer Details */}
                <div className="space-y-2 text-center">
                  {offer.type === "price" && offer.value > 0 && (
                    <div className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-2xl">💰</span>
                      <span className="font-semibold text-sm sm:text-base">
                        Buy {offer.value} Items
                      </span>
                    </div>
                  )}
                  {offer.quantity > 0 && (
                    <div className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-2xl">🎉</span>
                      <span className="font-semibold text-sm sm:text-base">
                        Get {offer.quantity} Special
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-6 text-center">
                  <div className="inline-block bg-white text-gray-900 px-6 py-2 rounded-full font-bold text-sm sm:text-base hover:scale-105 transition-transform cursor-pointer">
                    Shop Now →
                  </div>
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default OffersDisplay;
