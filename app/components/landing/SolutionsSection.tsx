"use client";

import { useUserCountry } from "@/app/hooks/useUserCountry";
import { formatPrice } from "@/app/util";
import { useRouter } from "next/navigation";

const DUMMY_SOLUTIONS = [
    {
        id: "sol-1",
        title: "Lens Care Solution",
        sub_title: "PURE CARE",
        price: 850,
        icon: "💧",
    },
    {
        id: "sol-2",
        title: "Protein Remover",
        sub_title: "ADVANCED TECH",
        price: 650,
        icon: "✨",
    },
    {
        id: "sol-3",
        title: "Rewetting Drops",
        sub_title: "MOISTURE BOOST",
        price: 450,
        icon: "🌊",
    },
    {
        id: "sol-4",
        title: "Saline Solution",
        sub_title: "NATURAL PH",
        price: 350,
        icon: "🌿",
    },
];

export default function SolutionsSection() {
    const { country } = useUserCountry();
    const router = useRouter();

    if (country !== "nepal") {
        return null;
    }

    return (
        <section id="solutions-section" className="py-12 bg-white relative">
            <div className="max-w-[1700px] mx-auto px-4 md:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-12 border-b border-secondary-100 pb-16">
                    <div className="max-w-3xl">
                        <span className="text-primary-500 font-bold tracking-[0.4em] uppercase text-xs mb-4 block">Care System</span>
                        <h2 className="text-7xl md:text-9xl font-extrabold text-secondary-900 tracking-tighter leading-none mb-6">
                            PURE <span className="text-secondary-400 font-serif italic font-normal">CARE</span>
                        </h2>
                        <p className="text-xl text-secondary-400 font-medium">Preserve clarity and comfort with our scientifically formulated rituals.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-12 gap-y-12 md:gap-y-24">
                    {DUMMY_SOLUTIONS.map((solution) => (
                        <div
                            key={solution.id}
                            className="group cursor-pointer w-full"
                            onClick={() => router.push(`/solutions/${solution.id}`)}
                        >
                            <div className="relative aspect-[4/5] mb-10 overflow-hidden bg-secondary-50 rounded-2xl transition-all duration-700 ease-soft-spring border border-secondary-100">
                                <div className="w-full h-full flex items-center justify-center text-8xl transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-6">
                                    {solution.icon}
                                </div>

                                <div className="absolute bottom-3 left-3 md:bottom-8 md:left-8">
                                    <span className="px-2 md:px-5 py-1 md:py-2 bg-secondary-900 text-white rounded-md md:rounded-xl text-[7px] md:text-[10px] font-black tracking-widest shadow-sm uppercase">
                                        ESSENTIAL
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 md:gap-4">
                                <span className="text-[8px] md:text-[10px] font-bold text-primary-500 tracking-[0.2em] md:tracking-[0.3em] uppercase mb-1 md:mb-2 block">{solution.sub_title}</span>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-2 md:gap-4">
                                    <h3 className="text-sm md:text-3xl font-black text-secondary-900 tracking-tighter leading-tight group-hover:text-primary-500 transition-colors uppercase flex-1">
                                        {solution.title}
                                    </h3>
                                    <div className="text-left md:text-right shrink-0">
                                        <span className="text-[8px] md:text-[10px] font-bold text-secondary-400 tracking-widest uppercase block mb-1">MSRP</span>
                                        <div className="text-sm md:text-2xl font-black text-secondary-900 font-price">
                                            {formatPrice(solution.price, country)}
                                        </div>
                                    </div>
                                </div>
                                <div className="h-0.5 w-full bg-secondary-100 relative overflow-hidden mt-2">
                                    <div className="absolute inset-0 bg-primary-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
