"use client";

import Image from "next/image";
import { useUserCountry } from "../../hooks/useUserCountry";
import { formatPrice, getThumbnailUrl } from "../../util";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { get_products } from "../../api/product";

export default function EyeLashesSection({ initialData, initialTotal, initialCountry }: { initialData?: any[]; initialTotal?: number; initialCountry?: string }) {
    const { country: clientCountry } = useUserCountry();
    const activeCountry = clientCountry || initialCountry || null;
    const router = useRouter();
    const [lashes, setLashes] = useState<any[]>(initialData || []);
    const [total, setTotal] = useState<number>(initialTotal || initialData?.length || 0);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<string>("latest_added");
    const [hasEverLoaded, setHasEverLoaded] = useState(!!initialData);
    const isFirstRender = useRef(true);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 120;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (lashes.length > 0 && !loading) {
            setHasEverLoaded(true);
        }
    }, [lashes, loading]);

    useEffect(() => {
        const fetchData = async () => {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                if (activeCountry?.toLowerCase() === initialCountry?.toLowerCase() && currentPage === 1 && sortBy === "latest_added") {
                    return;
                }
            }

            if (!activeCountry) return;
            setLoading(true);
            try {
                const limit = 15;
                const offset = (currentPage - 1) * limit;
                const { data: response } = await get_products(limit, offset, ["eye_lashes"], activeCountry, { sort: sortBy });
                if (response && response.data && Array.isArray(response.data)) {
                    setLashes(response.data);
                    setTotal(response.total || response.data.length);
                } else {
                    setLashes([]);
                    setTotal(0);
                }
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeCountry, initialCountry, currentPage, sortBy]);

    if (!loading && total === 0) return null;

    const getImageUrl = (lash: any) => {
        if (lash.primary_thumbnail) return getThumbnailUrl(lash);
        if (lash.images && lash.images.length > 0) {
            const img = lash.images[0];
            if (img.startsWith("http")) return img;
            return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-image/${img}`;
        }
        return null;
    };


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

                    {/* Filters & Sorting */}
                    <div className="w-full flex justify-end items-center">
                        {(!loading && total > 0) && (
                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-6 w-full lg:w-auto animate-in fade-in slide-in-from-right-4 duration-700">
                                {/* Sort Dropdown */}
                                <div className="relative group/sort w-auto sm:w-auto">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => {
                                            setSortBy(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full sm:w-auto bg-secondary-50 border border-secondary-100 rounded-full px-6 py-3 text-[10px] font-black tracking-widest text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer pr-12 uppercase"
                                    >
                                        <option value="latest_added">LATEST ADDED</option>
                                        <option value="price_asc">PRICE: LOW TO HIGH</option>
                                        <option value="price_desc">PRICE: HIGH TO LOW</option>
                                        <option value="name_asc">NAME: A TO Z</option>
                                        <option value="name_desc">NAME: Z TO A</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-400">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-12 gap-y-12 md:gap-y-24">
                    {lashes.map((lash) => {
                        const imageUrl = getImageUrl(lash);
                        return (
                            <div
                                key={lash.id}
                                className="group cursor-pointer w-[calc(50%-1rem)] sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-2rem)] xl:w-[calc(25%-2.25rem)] max-w-[380px]"
                                onClick={() => router.push(`/${lash.id}`)}
                            >
                                <div className="relative aspect-[4/5] mb-10 overflow-hidden bg-secondary-50 rounded-2xl transition-all duration-700 ease-soft-spring">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={lash.title}
                                            fill
                                            className="object-cover transition-all duration-1000 group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 30vw, 25vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-8xl text-secondary-200 group-hover:scale-110 transition-transform duration-1000">
                                            ✨
                                        </div>
                                    )}

                                    <div className="absolute bottom-3 left-3 md:bottom-8 md:left-8">
                                        <span className="px-2 md:px-5 py-1 md:py-2 bg-white/80 md:bg-white/90 backdrop-blur-md rounded-md md:rounded-xl text-[7px] md:text-[10px] font-black tracking-widest text-primary-500 shadow-sm uppercase">
                                            EDITORIAL
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 md:gap-4">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-2 md:gap-4">
                                        <h3 className="text-sm md:text-3xl font-black text-primary-500 tracking-tighter leading-tight group-hover:text-secondary-900 transition-colors uppercase flex-1">
                                            {lash.title}
                                        </h3>
                                        <div className="text-left md:text-right shrink-0">
                                            <span className="text-[8px] md:text-[10px] font-bold text-secondary-400 tracking-widest uppercase block mb-1">MSRP</span>
                                            <div className="text-sm md:text-2xl font-black text-secondary-900 font-price group-hover:text-primary-500 transition-colors">
                                                {formatPrice(lash.price, activeCountry)}
                                            </div>
                                        </div>
                                    </div>

                                    {lash.sub_title && (
                                        <p className="text-[10px] md:text-xs font-medium text-secondary-900 uppercase tracking-wider">
                                            {lash.sub_title}
                                        </p>
                                    )}

                                    <div className="h-0.5 w-full bg-secondary-100 relative overflow-hidden mt-2">
                                        <div className="absolute inset-0 bg-primary-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination Controls */}
                {(total > 0 || hasEverLoaded) && (
                    <div className="mt-24 flex flex-col items-center gap-8 border-t border-secondary-100 pt-16">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setCurrentPage(prev => Math.max(1, prev - 1));
                                    scrollToSection('eyelashes-section');
                                }}
                                disabled={currentPage === 1}
                                className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-secondary-100 text-secondary-900 hover:border-primary-500 hover:text-primary-500 disabled:opacity-20 disabled:hover:border-secondary-100 disabled:hover:text-secondary-900 transition-all group"
                            >
                                <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            </button>

                            <div className="flex items-center gap-2">
                                {[...Array(Math.ceil(total / 15))].map((_, i) => {
                                    const pageNum = i + 1;
                                    const productsPerPage = 15;
                                    if (
                                        pageNum === 1 ||
                                        pageNum === Math.ceil(total / productsPerPage) ||
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => {
                                                    setCurrentPage(pageNum);
                                                    scrollToSection('eyelashes-section');
                                                }}
                                                className={`w-14 h-14 rounded-full font-black text-sm tracking-widest transition-all ${currentPage === pageNum
                                                    ? "bg-secondary-900 text-white shadow-xl scale-110"
                                                    : "bg-white border-2 border-secondary-100 text-secondary-400 hover:border-primary-500 hover:text-primary-500"
                                                    }`}
                                            >
                                                {String(pageNum).padStart(2, '0')}
                                            </button>
                                        );
                                    } else if (
                                        pageNum === currentPage - 2 ||
                                        pageNum === currentPage + 2
                                    ) {
                                        return <span key={pageNum} className="text-secondary-200 font-black tracking-widest">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => {
                                    setCurrentPage(prev => Math.min(Math.ceil(total / 15), prev + 1));
                                    scrollToSection('eyelashes-section');
                                }}
                                disabled={currentPage === Math.ceil(total / 15) || total === 0}
                                className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-secondary-100 text-secondary-900 hover:border-primary-500 hover:text-primary-500 disabled:opacity-20 disabled:hover:border-secondary-100 disabled:hover:text-secondary-900 transition-all group"
                            >
                                <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                        <p className="text-[10px] font-black tracking-[0.3em] text-secondary-400 uppercase">
                            Showing page {currentPage} of {Math.max(1, Math.ceil(total / 15))}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
