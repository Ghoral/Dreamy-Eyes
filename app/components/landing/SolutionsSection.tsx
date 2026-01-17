"use client";

import Image from "next/image";
import { useState } from "react";
import { useUserCountry } from "@/app/hooks/useUserCountry";
import { formatPrice } from "@/app/util";
import { useRouter } from "next/navigation";

// Dummy data for solutions
const DUMMY_SOLUTIONS = [
    {
        id: "sol-1",
        title: "Lens Care Solution",
        price: 850,
        image: null,
    },
    {
        id: "sol-2",
        title: "Protein Remover",
        price: 650,
        image: null,
    },
    {
        id: "sol-3",
        title: "Rewetting Drops",
        price: 450,
        image: null,
    },
    {
        id: "sol-4",
        title: "Saline Solution",
        price: 350,
        image: null,
    },
];

export default function SolutionsSection() {
    const { country } = useUserCountry();
    const router = useRouter();

    // Only show for Nepal users
    if (country !== "nepal") {
        return null;
    }

    return (
        <section id="solutions-section" className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Minimal header */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Care Solutions
                    </h2>
                    <p className="text-gray-600">Premium lens care essentials</p>
                </div>

                {/* Compact grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {DUMMY_SOLUTIONS.map((solution) => (
                        <div
                            key={solution.id}
                            onClick={() => router.push(`/solutions/${solution.id}`)}
                            className="group cursor-pointer bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300"
                        >
                            {/* Compact image */}
                            <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl mb-3 overflow-hidden">
                                {solution.image ? (
                                    <Image
                                        src={solution.image}
                                        alt={solution.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-4xl">💧</span>
                                    </div>
                                )}
                            </div>

                            {/* Compact info */}
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                                {solution.title}
                            </h3>
                            <p className="text-lg font-bold text-blue-600">
                                {formatPrice(solution.price, country)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
