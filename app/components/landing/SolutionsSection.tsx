"use client";

import { useUserCountry } from "@/app/hooks/useUserCountry";
import { formatPrice, getAccessoryImageUrl } from "@/app/util";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get_solutions } from "@/app/api/product";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import Toast from "@/app/components/ui/Toast";

export default function SolutionsSection() {
    const { country } = useUserCountry();
    const router = useRouter();
    const [solutions, setSolutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { addAccessoryItem } = useCart();
    const [toastConfig, setToastConfig] = useState<{ message: string; isVisible: boolean }>({
        message: "",
        isVisible: false,
    });
    const [quantityMap, setQuantityMap] = useState<Record<number, number>>({});

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

    const handleQuantityCheck = (solution: any, nextQty: number) => {
        if (nextQty < 1) return;
        const maxQty = solution.quantity;
        if (maxQty !== null && maxQty !== undefined && nextQty > maxQty) {
            setToastConfig({ message: "Sorry, this quantity is no longer available in stock.", isVisible: true });
            return;
        }
        setQuantityMap((m) => ({ ...m, [solution.id]: nextQty }));
    };

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
                    {solutions.map((solution) => {
                        const maxQty = solution.quantity;
                        const inStock = (maxQty === null || maxQty === undefined || maxQty > 0);
                        const selectedQty = quantityMap[solution.id] ?? 1;

                        return (
                            <div
                                key={solution.id}
                                className="group cursor-pointer w-[calc(50%-1rem)] sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-2rem)] xl:w-[calc(25%-2.25rem)] max-w-[380px]"
                            >
                                <div className="relative aspect-[4/5] mb-10 overflow-hidden bg-secondary-50 rounded-2xl transition-all duration-700 ease-soft-spring border border-secondary-100" onClick={() => router.push(`/solutions/${solution.id}`)}>
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
                                        <span className={`px-2 md:px-5 py-1 md:py-2 ${inStock ? 'bg-secondary-900 text-white' : 'bg-red-500 text-white'} rounded-md md:rounded-xl text-[7px] md:text-[10px] font-black tracking-widest shadow-sm uppercase`}>
                                            {inStock ? "ESSENTIAL" : "OUT OF STOCK"}
                                        </span>
                                    </div>

                                    {/* Quantity Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-700" onClick={(e) => e.stopPropagation()}>
                                        <div className="bg-white p-2 rounded-2xl shadow-2xl flex items-center gap-2">
                                            <div className="flex-1 flex items-center justify-between px-6 py-3 bg-secondary-50 rounded-xl">
                                                <button
                                                    disabled={!inStock || selectedQty <= 1}
                                                    onClick={() => handleQuantityCheck(solution, selectedQty - 1)}
                                                    className="text-secondary-900 hover:text-primary-500 transition-colors font-black text-xl w-8 h-8 flex items-center justify-center disabled:opacity-30"
                                                >—</button>
                                                <span className="font-black text-secondary-900 text-lg w-8 text-center">{selectedQty}</span>
                                                <button
                                                    disabled={!inStock || (maxQty !== null && maxQty !== undefined && selectedQty >= maxQty)}
                                                    onClick={() => handleQuantityCheck(solution, selectedQty + 1)}
                                                    className="text-secondary-900 hover:text-primary-500 transition-colors font-black text-xl w-8 h-8 flex items-center justify-center disabled:opacity-30"
                                                >+</button>
                                            </div>
                                            <button
                                                disabled={!inStock}
                                                onClick={() => {
                                                    addAccessoryItem({
                                                        id: solution.id,
                                                        title: solution.title || "Solution",
                                                        price: Number(solution.price),
                                                        quantity: selectedQty,
                                                        maxQuantity: maxQty ?? undefined,
                                                        image: solution.image ? getAccessoryImageUrl(solution.image, "solutions") : undefined,
                                                        category: "accessory" as const,
                                                    });
                                                    setToastConfig({ message: "Successfully Added", isVisible: true });
                                                    setTimeout(() => setToastConfig({ message: "", isVisible: false }), 2000);
                                                }}
                                                className="bg-secondary-900 text-white px-8 py-4 rounded-xl font-black text-[10px] tracking-widest hover:bg-primary-500 transition-all disabled:opacity-50 uppercase shadow-lg"
                                            >
                                                ADD TO KIT
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 md:gap-4" onClick={() => router.push(`/solutions/${solution.id}`)}>
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
                        );
                    })}
                </div>
            </div>
            <Toast
                message={toastConfig.message}
                type="success"
                isVisible={toastConfig.isVisible}
                onClose={() => setToastConfig({ message: "", isVisible: false })}
                duration={1500}
            />
        </section>
    );
}
