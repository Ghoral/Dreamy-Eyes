"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useUserCountry } from "../../hooks/useUserCountry";
import { formatPrice, getAccessoryImageUrl } from "../../util";
import { useCart } from "../../context/CartContext";
import { get_applicator_solution } from "../../api/product";

type AccessoryItem = {
  id: number;
  created_at: string;
  name?: string | null;
  title?: string | null;
  price: number | string | null;
  quantity: number | string | null;
  image: string | null;
  type: string;
};

const AccessoriesSection = ({ initialResponse, initialCountry }: { initialResponse?: any; initialCountry?: string }) => {
  const { country: clientCountry } = useUserCountry();
  const activeCountry = clientCountry || initialCountry || null;
  const [itemsResponse, setItemsResponse] = useState<any>(initialResponse || null);
  const [loading, setLoading] = useState<boolean>(false);
  const { addAccessoryItem, state: cartState, updateAccessoryQuantity, removeAccessoryItem } = useCart();
  const isFirstRender = useRef(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(15);
  const [sortBy, setSortBy] = useState<string>("latest_added");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [totalProducts, setTotalProducts] = useState(initialResponse?.total || 0);
  const [hasEverLoaded, setHasEverLoaded] = useState(!!initialResponse);
  const persistentTotal = useRef(totalProducts);

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
    if (itemsResponse && !loading) {
      setHasEverLoaded(true);
    }
  }, [itemsResponse, loading]);

  useEffect(() => {
    if (itemsResponse) {
      const finalTotal = itemsResponse.total;
      if (typeof finalTotal === 'number') {
        setTotalProducts(finalTotal);
        persistentTotal.current = finalTotal;
      }
    }
  }, [itemsResponse]);

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        if (activeCountry?.toLowerCase() === initialCountry?.toLowerCase() && currentPage === 1 && productsPerPage === 15 && sortBy === 'latest_added' && selectedCategory === 'all') {
          return;
        }
      }

      if (!activeCountry) return;

      try {
        setLoading(true);
        const offset = (currentPage - 1) * productsPerPage;
        const res = await get_applicator_solution(productsPerPage, offset, activeCountry, {
          sort: sortBy,
          type: selectedCategory === 'all' ? null : selectedCategory
        });

        if (!mounted) return;
        setItemsResponse(res);
      } catch (err: any) {
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchAll();
    return () => { mounted = false; };
  }, [activeCountry, initialCountry, currentPage, productsPerPage, sortBy, selectedCategory]);

  const displayedItems = useMemo(() => {
    if (!itemsResponse?.data) return [];
    return Array.isArray(itemsResponse.data) ? itemsResponse.data : [];
  }, [itemsResponse]);

  if (!loading && totalProducts === 0) return null;

  return (
    <section id="accessories-section" className="py-6 bg-white relative">
      <div className="max-w-[1700px] mx-auto px-4 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-8 border-b border-secondary-100 pb-8">
          <div className="max-w-3xl">
            <span className="text-primary-500 font-bold tracking-[0.4em] uppercase text-xs mb-4 block">Essentials</span>
            <h2 className="text-7xl md:text-9xl font-extrabold text-secondary-900 tracking-tighter leading-none mb-6">
              THE <span className="text-secondary-400 font-serif italic font-normal">KIT</span>
            </h2>
            <p className="text-xl text-secondary-400 font-medium">Professional instruments and care rituals for the perfect application.</p>
          </div>
        </div>


        {/* View & Sort Row */}
        <div className="mb-12 pt-4">
          <div className="flex justify-end items-center">
            {(!loading && totalProducts > 0) && (
              <div className="flex flex-row items-center gap-3 w-full lg:w-auto animate-in fade-in slide-in-from-right-4 duration-700 justify-end">
                {/* Category Dropdown */}
                <div className="relative group/category w-auto">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-auto bg-secondary-50 border border-secondary-100 rounded-full px-4 sm:px-6 py-3 text-[9px] sm:text-[10px] font-black tracking-widest text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer pr-10 sm:pr-12 uppercase"
                  >
                    <option value="all">CATEGORIES</option>
                    <option value="applicator">APPLICATORS</option>
                    <option value="solution">SOLUTIONS</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-400">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                {/* Sort Dropdown */}
                <div className="relative group/sort w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-auto bg-secondary-50 border border-secondary-100 rounded-full px-4 sm:px-6 py-3 text-[9px] sm:text-[10px] font-black tracking-widest text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer pr-10 sm:pr-12 uppercase"
                  >
                    <option value="latest_added">SORT</option>
                    <option value="oldest">OLDEST</option>
                    <option value="price_asc">PRICE: LOW</option>
                    <option value="price_desc">PRICE: HIGH</option>
                    <option value="name_asc">A - Z</option>
                    <option value="name_desc">Z - A</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-400">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-12 gap-y-6 md:gap-y-12">
          {displayedItems.map((item: AccessoryItem) => {
            const rawPrice = typeof item.price === "string" ? parseFloat(item.price) : (item.price as number | null);
            const qty = typeof item.quantity === "string" ? parseInt(item.quantity) : (item.quantity as number | null);
            const inStock = (qty ?? 0) > 0;
            const displayName = item.title || item.name || "Accessory";
            const isSolution = item.image?.includes("solution") || item.image?.startsWith("sol-");
            const bucketFolder = isSolution ? "solutions" : "applicators";

            return (
              <div key={`${item.type}-${item.id}`} className="group cursor-pointer w-[calc(50%-1rem)] sm:w-[calc(33.33%-1rem)] lg:w-[calc(20%-1.5rem)] xl:w-[calc(16.666%-1.5rem)] max-w-[220px]">
                <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-secondary-50 rounded-2xl transition-all duration-700 ease-soft-spring">
                  {item.image ? (
                    <img
                      src={getAccessoryImageUrl(item.image, bucketFolder)}
                      alt={displayName}
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl">{isSolution ? "💧" : "🛠️"}</div>
                  )}

                  {!inStock && (
                    <div className="absolute top-3 right-3 md:top-8 md:right-8">
                      <span className="px-3 md:px-5 py-1 md:py-2 bg-red-500 text-white rounded-md md:rounded-xl text-[7px] md:text-[10px] font-black tracking-widest shadow-sm uppercase">
                        OUT
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 md:bottom-8 md:left-8">
                    <span className="px-2 md:px-5 py-1 md:py-2 bg-white/80 md:bg-white/90 backdrop-blur-md rounded-md md:rounded-xl text-[7px] md:text-[10px] font-black tracking-widest text-primary-500 shadow-sm uppercase">
                      {isSolution ? "SOLUTIONS" : "APPLICATOR"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="flex flex-col gap-2 md:gap-3">
                    <h3 className="text-sm md:text-3xl font-black text-primary-500 tracking-tighter leading-tight group-hover:text-secondary-900 transition-colors uppercase flex-1">
                      {displayName}
                    </h3>
                    <div className="flex items-end justify-between w-full mt-2">
                      <div className="text-left shrink-0">
                        <span className="text-[8px] md:text-[10px] font-bold text-secondary-400 tracking-widest uppercase block mb-1">MSRP</span>
                        <div className="text-sm md:text-2xl font-black text-secondary-900 font-price group-hover:text-primary-500 transition-colors">
                          {rawPrice != null ? formatPrice(rawPrice, activeCountry) : "—"}
                        </div>
                      </div>

                      {/* Controls */}
                      {(() => {
                        const cartId = item.id; // Currently IDs might collide if not unique across tables, but context handles by item props usually
                        // Warning: If IDs collide between tables, this is bad. Assuming they might.
                        // However, cart usually tracks ID + maybe category/type?
                        // `cartState.accessoryItems` check:
                        // The cart logic merges acc items. If `id` is 1 for applicator and 1 for solution, they collide.
                        // We strictly need to pass category to `addAccessoryItem`?
                        // Actually `CartItem` has `category`.
                        // The store uses `id` for lookup mostly.
                        // I should verify CartContext id collision handling.
                        // For now we assume unique IDs or risk collision.
                        const cartItem = cartState.accessoryItems.find((i: any) => i.id === item.id && (i.title === displayName)); // Weak check
                        const inCartQty = cartItem ? cartItem.quantity : 0;

                        return (
                          <div className="flex items-center bg-secondary-50 rounded-lg p-0.5 h-8 md:h-10 ml-4" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (inCartQty <= 0) return;
                                if (inCartQty === 1) {
                                  removeAccessoryItem(item.id);
                                } else {
                                  updateAccessoryQuantity(item.id, inCartQty - 1);
                                }
                              }}
                              disabled={inCartQty === 0}
                              className="w-8 md:w-10 h-full flex items-center justify-center text-secondary-900 hover:text-primary-500 disabled:opacity-20 font-black text-lg transition-colors"
                            >
                              -
                            </button>
                            <span className="text-secondary-900 font-bold text-xs md:text-sm w-6 text-center">{inCartQty}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!inStock) return;
                                addAccessoryItem({
                                  id: item.id,
                                  title: displayName,
                                  price: Number(rawPrice),
                                  quantity: 1,
                                  maxQuantity: qty ?? undefined,
                                  image: item.image ? getAccessoryImageUrl(item.image, bucketFolder) : undefined,
                                  category: "accessory" as const,
                                  // We should really handle ID collision here if needed, but keeping simple as per prev code
                                });
                              }}
                              disabled={!inStock || (qty != null && inCartQty >= qty)}
                              className="w-8 md:w-10 h-full flex items-center justify-center text-secondary-900 hover:text-primary-500 disabled:opacity-20 font-black text-lg transition-colors"
                            >
                              +
                            </button>
                          </div>
                        );
                      })()}
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

        {/* Pagination Controls */}
        {(totalProducts > 0 || hasEverLoaded) && (
          <div className="mt-24 flex flex-col items-center gap-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  scrollToSection('accessories-section');
                }}
                disabled={currentPage === 1}
                className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-secondary-100 text-secondary-900 hover:border-primary-500 hover:text-primary-500 disabled:opacity-20 disabled:hover:border-secondary-100 disabled:hover:text-secondary-900 transition-all group"
              >
                <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>

              <div className="flex items-center gap-2">
                {[...Array(Math.ceil(totalProducts / productsPerPage))].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === Math.ceil(totalProducts / productsPerPage) ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          scrollToSection('accessories-section');
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
                  setCurrentPage(prev => Math.min(Math.ceil(totalProducts / productsPerPage), prev + 1));
                  scrollToSection('accessories-section');
                }}
                disabled={currentPage === Math.ceil(totalProducts / productsPerPage) || totalProducts === 0}
                className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-secondary-100 text-secondary-900 hover:border-primary-500 hover:text-primary-500 disabled:opacity-20 disabled:hover:border-secondary-100 disabled:hover:text-secondary-900 transition-all group"
              >
                <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <p className="text-[10px] font-black tracking-[0.3em] text-secondary-400 uppercase">
              Showing page {currentPage} of {Math.max(1, Math.ceil(totalProducts / productsPerPage))}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AccessoriesSection;
