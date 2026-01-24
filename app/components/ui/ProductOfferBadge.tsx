"use client";

import React from "react";
import { useCart } from "../../context/CartContext";

interface ProductOfferBadgeProps {
    offers: any[];
}

const ProductOfferBadge = ({ offers }: ProductOfferBadgeProps) => {
    const { state: cartState, setOffer } = useCart();

    if (!offers || offers.length === 0) return null;

    const handleActivate = (e: React.MouseEvent, offer: any) => {
        e.stopPropagation();
        e.preventDefault();
        setOffer(offer, cartState.items);
    };

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {offers.map((offer: any) => {
                const isApplied = cartState.selectedOffer?.id === offer.id;

                return (
                    <button
                        key={offer.id}
                        onClick={(e) => !isApplied && handleActivate(e, offer)}
                        className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${isApplied
                            ? "bg-green-50 border-green-200 text-green-700 shadow-sm"
                            : "bg-primary-50 border-primary-100 text-primary-600 hover:bg-primary-500 hover:text-white"
                            }`}
                    >
                        <span className="text-[9px] font-black uppercase tracking-wider">
                            {isApplied
                                ? `Active: Buy ${offer.value} Get ${offer.quantity}`
                                : `Buy ${offer.value} Get ${offer.quantity} Free`}
                        </span>

                        {!isApplied && (
                            <div className="flex items-center gap-1 overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-500 ease-in-out whitespace-nowrap">
                                <span className="text-[8px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                    (Click to Activate)
                                </span>
                            </div>
                        )}

                        <div className={`w-1.5 h-1.5 rounded-full ${isApplied ? 'bg-green-500' : 'bg-primary-500 animate-pulse group-hover:bg-white'}`} />

                        {isApplied && (
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default ProductOfferBadge;
