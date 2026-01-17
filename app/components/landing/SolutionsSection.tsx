"use client";

import { useUserCountry } from "@/app/hooks/useUserCountry";
import { formatPrice, getAccessoryImageUrl } from "@/app/util";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get_solutions } from "@/app/api/product";
import Image from "next/image";

export default function SolutionsSection() {
    const { country } = useUserCountry();
    const router = useRouter();
    const [solutions, setSolutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data } = await get_solutions(10, 0, country);
                if (data && Array.isArray(data)) {
                    setSolutions(data);
                } else {
                    setSolutions([]);
                }
            } catch (error) {
                console.error("Failed to fetch solutions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [country]);

    if (!loading && solutions.length === 0) return null;

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

                <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-12 gap-y-12 md:gap-y-24">
                    {solutions.map((solution) => (
                        <div
                            key={solution.id}
                            className="group cursor-pointer w-[calc(50%-1rem)] sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-2rem)] xl:w-[calc(25%-2.25rem)] max-w-[380px]"
                            onClick={() => router.push(`/solutions/${solution.id}`)}
                        >
                            <div className="relative aspect-[4/5] mb-10 overflow-hidden bg-secondary-50 rounded-2xl transition-all duration-700 ease-soft-spring border border-secondary-100">
                                {solution.image ? (
                                    <Image
                                        src={getAccessoryImageUrl(solution.image, "solutions")}
                                        alt={solution.title}
                                        fill
                                        className="object-cover transition-all duration-1000 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 30vw, 25vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-8xl transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-6">
                                        💧
                                    </div>
                                )}

                                <div className="absolute bottom-3 left-3 md:bottom-8 md:left-8">
                                    <span className="px-2 md:px-5 py-1 md:py-2 bg-secondary-900 text-white rounded-md md:rounded-xl text-[7px] md:text-[10px] font-black tracking-widest shadow-sm uppercase">
                                        ESSENTIAL
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 md:gap-4">
                                <span className="text-[8px] md:text-[10px] font-bold text-primary-500 tracking-[0.2em] md:tracking-[0.3em] uppercase mb-1 md:mb-2 block">{solution.subtitle || "SOLUTION"}</span>
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
