"use client";

import Image from "next/image";
import { useState } from "react";
import { useUserCountry } from "@/app/hooks/useUserCountry";
import { formatPrice } from "@/app/util";
import { useRouter } from "next/navigation";

// Dummy data for eye lashes
const DUMMY_EYELASHES = [
    {
        id: "lash-1",
        title: "Natural Volume",
        price: 1200,
        image: null,
    },
    {
        id: "lash-2",
        title: "Dramatic Glam",
        price: 1500,
        image: null,
    },
    {
        id: "lash-3",
        title: "Wispy Cat Eye",
        price: 1350,
        image: null,
    },
    {
        id: "lash-4",
        title: "Magnetic Set",
        price: 2200,
        image: null,
    },
];

export default function EyeLashesSection() {
    const { country } = useUserCountry();
    const router = useRouter();

    return (
        <section id="eyelashes-section" className="py-32 bg-secondary-50 relative overflow-hidden">
            {/* Background Text */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.03]">
                <span className="text-[30vw] font-black tracking-tighter whitespace-nowrap">LASHES</span>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 relative">
                <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                    <div>
                        <span className="text-primary-500 font-black tracking-[0.3em] uppercase text-xs mb-4 block">Beauty Elevated</span>
                        <h2 className="text-5xl md:text-7xl font-black text-secondary-900 tracking-tighter leading-tight">
                            EYE <span className="font-serif italic font-normal text-primary-500">LASHES</span>
                        </h2>
                    </div>
                    <p className="max-w-md text-secondary-500 font-medium text-right hidden md:block">
                        Transform your gaze with our handcrafted, premium lash extensions. Designed for every mood and occasion.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {DUMMY_EYELASHES.map((lash, index) => (
                        <div
                            key={lash.id}
                            onClick={() => router.push(`/eyelashes/${lash.id}`)}
                            className={`group cursor-pointer relative ${index % 2 !== 0 ? 'md:mt-12' : ''}`}
                        >
                            <div className="relative aspect-[3/4] bg-white rounded-2xl transition-all duration-700 ease-soft-spring overflow-hidden shadow-soft border border-secondary-100 p-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent"></div>

                                <div className="relative h-full flex flex-col items-center justify-center text-center">
                                    <div className="text-6xl mb-8 group-hover:scale-125 transition-transform duration-700">✨</div>
                                    <h3 className="text-2xl font-black text-secondary-900 mb-2 leading-tight uppercase tracking-tight">
                                        {lash.title}
                                    </h3>
                                    <div className="text-primary-500 font-black text-lg">
                                        {formatPrice(lash.price, country)}
                                    </div>

                                    <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="px-6 py-2 bg-secondary-900 text-white rounded-full text-[10px] font-black tracking-widest uppercase">
                                            SELECT STYLE
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
