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

    if (country !== "nepal") {
        return null;
    }

    return (
        <section id="solutions-section" className="py-32 bg-white relative">
            <div className="max-w-[1400px] mx-auto px-4">
                <div className="flex flex-col items-center text-center mb-24">
                    <div className="h-px w-24 bg-primary-500 mb-8"></div>
                    <h2 className="text-5xl md:text-8xl font-black text-secondary-900 tracking-tighter uppercase mb-6">
                        Pure <span className="text-primary-500 italic font-serif">Care</span>
                    </h2>
                    <p className="text-xl text-secondary-400 font-medium max-w-xl">
                        Preserve the life and clarity of your lenses with our scientifically formulated maintenance rituals.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {DUMMY_SOLUTIONS.map((solution, index) => (
                        <div
                            key={solution.id}
                            onClick={() => router.push(`/solutions/${solution.id}`)}
                            className="group cursor-pointer"
                        >
                            <div className="bg-secondary-50 rounded-2xl p-10 transition-all duration-700 hover:bg-secondary-900 group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-secondary-100 flex flex-col h-full">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-12 shadow-soft transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                    {index === 0 ? "💧" : index === 1 ? "✨" : index === 2 ? "🌊" : "🌿"}
                                </div>

                                <h3 className="text-2xl font-black text-secondary-900 mb-4 transition-colors duration-500 group-hover:text-white uppercase tracking-tight leading-tight">
                                    {solution.title}
                                </h3>

                                <div className="mt-auto pt-8 border-t border-secondary-200/50 flex justify-between items-center transition-colors duration-500 group-hover:border-white/10">
                                    <span className="text-2xl font-black text-primary-500">
                                        {formatPrice(solution.price, country)}
                                    </span>
                                    <div className="w-10 h-10 rounded-full border border-secondary-200 flex items-center justify-center group-hover:bg-primary-500 group-hover:border-primary-500 group-hover:text-white transition-all duration-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
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
