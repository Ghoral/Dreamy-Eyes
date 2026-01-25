"use client";

import { getThumbnailUrl, formatPrice } from "../../util";
import Image from "next/image";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useCart } from "../../context/CartContext";
import Toast from "../ui/Toast";
import { useRouter } from "next/navigation";
import { useUserCountry } from "../../hooks/useUserCountry";
import { get_products, get_applicator_solution } from "../../api/product";
import ProductCardShimmer from "../ui/ProductCardShimmer";

const ProductItems = ({ data, initialCountry }: { data: any; initialCountry?: string }) => {
  const { country: clientCountry } = useUserCountry();
  const activeCountry = clientCountry || initialCountry || null;
  const [productsData, setProductsData] = useState<any>(data);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsPerPage, setProductsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<string>("latest_added");
  const [hasEverLoaded, setHasEverLoaded] = useState(false);
  const isMounting = useRef(true);

  const [toastConfig, setToastConfig] = useState<{
    message: string;
    isVisible: boolean;
  }>({ message: "", isVisible: false });
  const { addItem } = useCart();
  const router = useRouter();

  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [powerMin, setPowerMin] = useState<string>("");
  const [powerMax, setPowerMax] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {

  }, [productsData]);

  useEffect(() => {
    if (isMounting.current) {
      isMounting.current = false;
      return;
    }
    scrollToSection('products-section');
  }, [currentPage]);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (productsData && !isLoading) {
      setHasEverLoaded(true);
    }
  }, [productsData, isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled past products section or 500px
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        const rect = productsSection.getBoundingClientRect();
        // If top of section is above viewport significantly (meaning we scrolled down)
        setShowScrollTop(rect.top < -200);
      } else {
        setShowScrollTop(window.scrollY > 500);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      const offset = 100;
      const elementPosition = productsSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  const normalizedData = useMemo(() => {
    const targetData = productsData;
    if (!targetData) return [];

    // Case 1: RPC result object { data: [...], total: n }
    if (targetData && targetData.data && Array.isArray(targetData.data)) {
      return targetData.data;
    }

    // Case 2: Full API response wrapper { data: { data: [...], total: n } }
    if (targetData && targetData.data && targetData.data.data && Array.isArray(targetData.data.data)) {
      return targetData.data.data;
    }

    // Case 3: Direct array
    if (Array.isArray(targetData)) {
      return targetData;
    }

    return [];
  }, [productsData]);

  const persistentTotal = useRef(totalProducts);

  useEffect(() => {
    if (productsData) {
      // Priority 1: Direct total on state
      // Priority 2: Nested total in data property
      // Priority 3: Fallback to array length ONLY IF on page 1 (to establish baseline)

      let finalTotal = null;
      if (typeof productsData.total === 'number') {
        finalTotal = productsData.total;
      } else if (productsData.data && typeof productsData.data.total === 'number') {
        finalTotal = productsData.data.total;
      }

      if (finalTotal !== null) {
        setTotalProducts(finalTotal);
        persistentTotal.current = finalTotal;
      } else if (currentPage === 1) {
        const items = Array.isArray(productsData) ? productsData :
          (productsData.data && Array.isArray(productsData.data) ? productsData.data : []);
        if (items.length > 0) {
          setTotalProducts(items.length);
          persistentTotal.current = items.length;
        }
      }
    }
  }, [productsData, currentPage]);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        // Skip fetch if current state matches server state
        if (activeCountry?.toLowerCase() === initialCountry?.toLowerCase() && selectedTag === 'all' && currentPage === 1 && productsPerPage === 20) {
          return;
        }
      }

      if (!activeCountry) return;

      setIsLoading(true);
      try {
        const tagsToSend =
          selectedTag === "all"
            ? ["sale", "latest_arrival", "top_seller", "best_reviewed"]
            : [selectedTag];

        const { data: responseData } = await get_products(
          1000,
          0,
          tagsToSend,
          activeCountry,
          { sort: sortBy }
        );

        // CRITICAL: responseData is the RPC object { data: [...], total: n }
        // We set the FULL object so totalProducts effect can see the total count
        if (responseData) {
          setProductsData(responseData);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchFilteredProducts();
  }, [selectedTag, activeCountry, initialCountry, sortBy]);

  const getProductLink = (product: any) => {
    const productId = product.id || product.title;
    const tags = product.tags;
    let isSale = false;
    if (Array.isArray(tags)) {
      isSale = tags.some((t) => String(t).toLowerCase().includes("sale"));
    }
    return isSale
      ? `/sale/${encodeURIComponent(productId)}`
      : `/${encodeURIComponent(productId)}`;
  };

  const handleProductClick = (product: any) => {
    router.push(getProductLink(product));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleTagClick = (tag: any) => {
    if (tag.type === 'scroll') {
      scrollToSection(tag.scrollId);
    } else {
      setSelectedTag(tag.value);
      setCurrentPage(1);
      scrollToSection('products-section');
    }
  };

  const availableColors = useMemo(() => {
    const colorSet = new Set<string>();
    if (!normalizedData) return [];
    normalizedData.forEach((product: any) => {
      if (product.color_quantity && Array.isArray(product.color_quantity)) {
        product.color_quantity.forEach((cq: any) => {
          if (cq?.label) colorSet.add(String(cq.label));
        });
      }
    });
    return Array.from(colorSet).sort();
  }, [normalizedData]);

  const [availableTags, setAvailableTags] = useState<any[]>([
    { label: "Lenses", value: "all", type: 'filter' },
    { label: "Sale", value: "sale", type: 'filter' },
  ]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!activeCountry) return;
      try {
        const [lashesRes, accessories] = await Promise.all([
          get_products(1, 0, ["eye_lashes"], activeCountry),
          get_applicator_solution(1, 0, activeCountry)
        ]);

        const lashes = lashesRes?.data || { total: 0 };

        const baseTags = [
          { label: "Lenses", value: "all", type: 'filter' },
          { label: "Sale", value: "sale", type: 'filter' },
        ];

        if (lashes.total > 0) {
          baseTags.push({ label: "Lashes", scrollId: "eyelashes-section", type: 'scroll' } as any);
        }

        if (accessories.total > 0) {
          baseTags.push({ label: "Accessories", scrollId: "accessories-section", type: 'scroll' } as any);
        }

        setAvailableTags(baseTags);
      } catch (e) {
      }
    };

    checkAvailability();
  }, [activeCountry]);

  const filteredProducts = useMemo(() => {
    if (!normalizedData) return [];
    let filtered = [...normalizedData];

    if (selectedColor !== "all") {
      filtered = filtered.filter((product) => {
        if (!product.color_quantity || !Array.isArray(product.color_quantity)) return false;
        return product.color_quantity.some((cq: any) => String(cq.label) === selectedColor);
      });
    }

    if (priceMin || priceMax) {
      const min = priceMin ? parseFloat(priceMin) : -Infinity;
      const max = priceMax ? parseFloat(priceMax) : Infinity;
      filtered = filtered.filter((product) => {
        const p = parseFloat(product.price);
        return !isNaN(p) && p >= min && p <= max;
      });
    }

    if (powerMin || powerMax) {
      const min = powerMin ? parseFloat(powerMin) : -Infinity;
      const max = powerMax ? parseFloat(powerMax) : Infinity;
      filtered = filtered.filter((product) => {
        const pw = parseFloat(product.power);
        return !isNaN(pw) && pw >= min && pw <= max;
      });
    }

    return filtered;
  }, [normalizedData, selectedColor, priceMin, priceMax, powerMin, powerMax]);

  return (
    <section id="products-section" className="w-full py-12 bg-white relative">
      <div className="max-w-[1700px] mx-auto px-4 md:px-12 relative z-10">

        {/* Filter & Per Page Row */}
        <div className="mb-16 pt-8 border-t border-secondary-100">
          <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-8">
            {(filteredProducts.length > 0) && (
              <div className="order-2 lg:order-1 flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto animate-in fade-in slide-in-from-left-4 duration-700">
                {/* Per Page Selector */}
                <div className="flex items-center gap-4 bg-secondary-50 p-1.5 rounded-full border border-secondary-100">
                  <span className="pl-4 pr-2 text-[10px] font-black tracking-widest text-secondary-400 uppercase">View:</span>
                  {[20, 40, 60, 100].map((limit) => (
                    <button
                      key={limit}
                      onClick={() => {
                        setProductsPerPage(limit);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${productsPerPage === limit
                        ? "bg-white text-primary-500 shadow-sm"
                        : "text-secondary-400 hover:text-secondary-900"
                        }`}
                    >
                      {limit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="order-1 lg:order-2 flex flex-row items-center gap-3 w-full lg:w-auto justify-end">
              {filteredProducts.length > 0 && (
                <div className="relative group/sort w-auto animate-in fade-in slide-in-from-right-4 duration-700">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-auto bg-secondary-50 border border-secondary-100 rounded-full px-4 sm:px-6 py-3 text-[9px] sm:text-[10px] font-black tracking-widest text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer pr-10 sm:pr-12 uppercase"
                  >
                    <option value="latest_added">LATEST ADDED</option>
                    <option value="price_asc">PRICE: LOW TO HIGH</option>
                    <option value="price_desc">PRICE: HIGH TO LOW</option>
                    <option value="power_asc">POWER: LOW TO HIGH</option>
                    <option value="power_desc">POWER: HIGH TO LOW</option>
                    <option value="name_asc">NAME: A TO Z</option>
                    <option value="name_desc">NAME: Z TO A</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-400">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="flex-1 sm:flex-none group relative flex items-center justify-center gap-2 px-4 sm:px-8 py-3 bg-secondary-900 rounded-full hover:bg-primary-500 transition-all duration-500 shadow-xl hover:scale-105"
              >
                <svg className="w-3.5 h-3.5 text-white group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span className="text-[9px] sm:text-[10px] font-black tracking-[0.2em] text-white uppercase whitespace-nowrap">
                  <span className="hidden sm:inline">Refine Search</span>
                  <span className="sm:hidden">Refine</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-12 gap-y-12 md:gap-y-24 min-h-screen">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-[calc(50%-1rem)] sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-2rem)] xl:w-[calc(25%-2.25rem)] max-w-[380px]">
                <ProductCardShimmer />
              </div>
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-12 gap-y-12 md:gap-y-24 min-h-screen">
            {filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage).map((product: any, index: number) => {
              const imageUrl = getThumbnailUrl(product);
              const currentPrice = typeof product.price === "number" ? product.price : parseFloat(product.price);

              return (
                <div
                  key={index}
                  className="group cursor-pointer w-[calc(50%-1rem)] sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-2rem)] xl:w-[calc(25%-2.25rem)] max-w-[380px]"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative aspect-[4/5] mb-10 overflow-hidden bg-secondary-50 rounded-2xl transition-all duration-700 ease-soft-spring">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 30vw, 25vw"
                        priority={index < 4}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-secondary-200">
                        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}

                    {product.tags && (
                      <div className="absolute bottom-3 left-3 md:bottom-8 md:left-8">
                        <span className="px-2 md:px-5 py-1 md:py-2 bg-white/90 backdrop-blur-md rounded-md md:rounded-xl text-[7px] md:text-[10px] font-black tracking-widest text-primary-500 shadow-sm uppercase">
                          {Array.isArray(product.tags) ? product.tags[0] : String(product.tags)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-2 md:gap-4">
                      <h3 className="text-sm md:text-3xl font-black text-primary-500 tracking-tighter leading-tight group-hover:text-secondary-900 transition-colors uppercase flex-1">
                        {product.title}
                      </h3>
                      <div className="text-left md:text-right shrink-0">
                        <span className="text-[8px] md:text-[10px] font-bold text-secondary-400 tracking-widest uppercase block mb-1">MSRP</span>
                        <div className="text-sm md:text-2xl font-black text-secondary-900 font-price group-hover:text-primary-500 transition-colors">
                          {formatPrice(currentPrice, activeCountry)}
                        </div>
                        {(product.power !== undefined && product.power !== null) && (
                          <div className="flex items-center md:justify-end gap-1.5 mt-1">
                            <span className="text-[7px] md:text-[9px] font-bold text-secondary-400 tracking-widest uppercase">Power:</span>
                            <span className={`text-[8px] md:text-[11px] font-black text-primary-500 tracking-tighter ${Number(product.power) === 0 ? "normal-case" : "uppercase"}`}>{Number(product.power) === 0 ? "Non-Power" : product.power}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {product.sub_title && (
                      <p className="text-[10px] md:text-xs font-medium text-secondary-900 uppercase tracking-wider">
                        {product.sub_title}
                      </p>
                    )}
                  </div>

                  <div className="h-0.5 w-full bg-secondary-100 relative overflow-hidden mt-2">
                    <div className="absolute inset-0 bg-primary-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center py-60 bg-secondary-50 rounded-2xl">
              <h3 className="text-6xl font-black text-secondary-900 mb-6 tracking-tighter">THE VAULT IS EMPTY</h3>
              <p className="text-secondary-400 font-medium text-xl max-w-lg mx-auto leading-relaxed">We're currently curating new perspectives. Please check back as our collection evolves.</p>
            </div>
          )
        )}

        {/* Pagination Controls */}
        {(filteredProducts.length > 0 || hasEverLoaded) && (
          <div className="mt-24 flex flex-col items-center gap-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                }}
                disabled={currentPage === 1}
                className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-secondary-100 text-secondary-900 hover:border-primary-500 hover:text-primary-500 disabled:opacity-20 disabled:hover:border-secondary-100 disabled:hover:text-secondary-900 transition-all group"
              >
                <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>

              <div className="flex items-center gap-2">
                {[...Array(Math.ceil(filteredProducts.length / productsPerPage))].map((_, i) => {
                  const pageNum = i + 1;
                  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
                  // Show current page, first, last, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
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
                  setCurrentPage(prev => Math.min(Math.ceil(filteredProducts.length / productsPerPage), prev + 1));
                }}
                disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
                className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-secondary-100 text-secondary-900 hover:border-primary-500 hover:text-primary-500 disabled:opacity-20 disabled:hover:border-secondary-100 disabled:hover:text-secondary-900 transition-all group"
              >
                <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <p className="text-[10px] font-black tracking-[0.3em] text-secondary-300 uppercase">
              Page {currentPage} of {Math.ceil(filteredProducts.length / productsPerPage)} — {filteredProducts.length} Artifacts
            </p>
          </div>
        )}
      </div>

      {
        isFilterDrawerOpen && (
          <>
            <div className="fixed inset-0 bg-secondary-900/60 backdrop-blur-md z-[60]" onClick={() => setIsFilterDrawerOpen(false)} />
            <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl p-12 overflow-y-auto">
              <div className="flex justify-between items-center mb-16">
                <h3 className="text-5xl font-black text-secondary-900 tracking-tighter">FILTERS</h3>
                <button onClick={() => setIsFilterDrawerOpen(false)} className="p-4 bg-secondary-50 rounded-full hover:bg-secondary-100 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-12">
                <div>
                  <label className="block text-xs font-black tracking-widest text-secondary-400 uppercase mb-4">Color Spectrum</label>
                  <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-full py-6 border-b-2 border-secondary-100 font-black text-2xl focus:border-primary-500 appearance-none bg-transparent transition-colors font-price">
                    <option value="all">ALL COLORS</option>
                    {availableColors.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-black tracking-widest text-secondary-400 uppercase mb-4">Min Price</label>
                    <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full py-6 border-b-2 border-secondary-100 font-black text-2xl placeholder:text-secondary-100 focus:border-primary-500 outline-none font-price" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-black tracking-widest text-secondary-400 uppercase mb-4">Max Price</label>
                    <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full py-6 border-b-2 border-secondary-100 font-black text-2xl placeholder:text-secondary-100 focus:border-primary-500 outline-none font-price" placeholder="∞" />
                  </div>
                </div>
                <div className="pt-20 space-y-4">
                  <button onClick={() => setIsFilterDrawerOpen(false)} className="w-full py-6 bg-secondary-900 text-white font-black text-sm tracking-[0.2em] rounded-2xl hover:bg-primary-500 transition-all shadow-2xl">
                    APPLY FILTERS
                  </button>
                  <button onClick={() => { setSelectedColor("all"); setPriceMin(""); setPriceMax(""); setPowerMin(""); setPowerMax(""); setSelectedTag("all"); setIsFilterDrawerOpen(false); }} className="w-full py-6 bg-secondary-50 text-secondary-400 font-black text-sm tracking-[0.2em] rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
                    RESET ALL
                  </button>
                </div>
              </div>
            </div>
          </>
        )
      }

      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-4 bg-secondary-900 text-white rounded-full shadow-2xl transition-all duration-500 hover:bg-primary-500 hover:scale-110 ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
      </button>

      <Toast message={toastConfig.message} type="success" isVisible={toastConfig.isVisible} onClose={() => setToastConfig({ message: "", isVisible: false })} duration={2000} />
    </section >
  );
};

export default ProductItems;
