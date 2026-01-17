"use client";

import Image from "next/image";
import { useUserCountry } from "@/app/hooks/useUserCountry";
import { formatPrice } from "@/app/util";
import { useRouter } from "next/navigation";

// Dummy data for eye lashes
const DUMMY_EYELASHES = [
    {
        id: "lash-1",
        title: "Natural Volume",
        sub_title: "DAILY SERIES",
        price: 1200,
        image: null,
    },
    {
        id: "lash-2",
        title: "Dramatic Glam",
        sub_title: "EVENING SERIES",
        price: 1500,
        image: null,
    },
    {
        id: "lash-3",
        title: "Wispy Cat Eye",
        sub_title: "BOUTIQUE SERIES",
        price: 1350,
        image: null,
    },
    {
        id: "lash-4",
        title: "Magnetic Set",
        sub_title: "PRO SERIES",
        price: 2200,
        image: null,
    },
];

export default function EyeLashesSection() {
    const { country } = useUserCountry();
    const router = useRouter();

    return (
        <section id="eyelashes-section" className="py-12 bg-white relative overflow-hidden">
            <div className="max-w-[1700px] mx-auto px-4 md:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-12 border-b border-secondary-100 pb-16">
                    <div className="max-w-3xl">
                        <span className="text-primary-500 font-bold tracking-[0.4em] uppercase text-xs mb-4 block">Enhanced Beauty</span>
                        <h2 className="text-7xl md:text-9xl font-extrabold text-secondary-900 tracking-tighter leading-none mb-6">
                            EYE <span className="text-secondary-400 font-serif italic font-normal">LASHES</span>
                        </h2>
                        <p className="text-xl text-secondary-400 font-medium">Handcrafted extensions designed for every mood and occasion.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-12 gap-y-12 md:gap-y-24">
                    {DUMMY_EYELASHES.map((lash) => (
                        <div
                            key={lash.id}
                            className="group cursor-pointer w-full"
                            onClick={() => router.push(`/eye-lashes/${lash.id}`)}
                        >
                            <div className="relative aspect-[4/5] mb-10 overflow-hidden bg-secondary-50 rounded-2xl transition-all duration-700 ease-soft-spring">
                                <div className="w-full h-full flex items-center justify-center text-8xl text-secondary-200 group-hover:scale-110 transition-transform duration-1000">
                                    ✨
                                </div>



                                <div className="absolute bottom-3 left-3 md:bottom-8 md:left-8">
                                    <span className="px-2 md:px-5 py-1 md:py-2 bg-white/80 md:bg-white/90 backdrop-blur-md rounded-md md:rounded-xl text-[7px] md:text-[10px] font-black tracking-widest text-secondary-900 shadow-sm uppercase">
                                        EDITORIAL
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 md:gap-4">
                                <span className="text-[8px] md:text-[10px] font-bold text-primary-500 tracking-[0.2em] md:tracking-[0.3em] uppercase mb-1 md:mb-2 block">{lash.sub_title}</span>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-2 md:gap-4">
                                    <h3 className="text-sm md:text-3xl font-black text-secondary-900 tracking-tighter leading-tight group-hover:text-primary-500 transition-colors uppercase flex-1">
                                        {lash.title}
                                    </h3>
                                    <div className="text-left md:text-right shrink-0">
                                        <span className="text-[8px] md:text-[10px] font-bold text-secondary-400 tracking-widest uppercase block mb-1">MSRP</span>
                                        <div className="text-sm md:text-2xl font-black text-secondary-900 font-price">
                                            {formatPrice(lash.price, country)}
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
