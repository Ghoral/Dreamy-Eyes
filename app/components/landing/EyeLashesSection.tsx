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
        <section id="eyelashes-section" className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Minimal header */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Eye Lashes
                    </h2>
                    <p className="text-gray-600">Enhance your natural beauty</p>
                </div>

                {/* Compact grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {DUMMY_EYELASHES.map((lash) => (
                        <div
                            key={lash.id}
                            onClick={() => router.push(`/eyelashes/${lash.id}`)}
                            className="group cursor-pointer bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg hover:border-pink-300 transition-all duration-300"
                        >
                            {/* Compact image */}
                            <div className="relative aspect-square bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl mb-3 overflow-hidden">
                                {lash.image ? (
                                    <Image
                                        src={lash.image}
                                        alt={lash.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-4xl">👁️</span>
                                    </div>
                                )}
                            </div>

                            {/* Compact info */}
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                                {lash.title}
                            </h3>
                            <p className="text-lg font-bold text-pink-600">
                                {formatPrice(lash.price, country)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
