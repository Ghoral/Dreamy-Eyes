"use client";

import { getThumbnailUrl, formatPrice } from "@/app/util";
import Image from "next/image";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useCart } from "../../context/CartContext";
import Toast from "../ui/Toast";
import { useRouter } from "next/navigation";
import { useUserCountry } from "../../hooks/useUserCountry";
import { get_products } from "@/app/api/product";
import ProductCardShimmer from "../ui/ProductCardShimmer";

const ProductItems = ({ data }: { data: any }) => {
  const { country } = useUserCountry();
  const [productsData, setProductsData] = useState<any>(data);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);
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

  const normalizedData = useMemo(() => {
    const targetData = productsData;
    if (!targetData) return [];
    if (Array.isArray(targetData)) return targetData;
    if (targetData.products && Array.isArray(targetData.products)) return targetData.products;
    if (targetData.data && Array.isArray(targetData.data)) return targetData.data;
    return [];
  }, [productsData]);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
      }
      if (!country) return;
      setIsLoading(true);
      try {
        const tagsToSend =
          selectedTag === "all"
            ? ["sale", "latest_arrival", "top_seller", "best_reviewed"]
            : [selectedTag];
        const { data: newData } = await get_products(1000, 0, tagsToSend, country);
        setProductsData(newData);
      } catch (error) {
        console.error("Error fetching filtered products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFilteredProducts();
  }, [selectedTag, country]);

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
      const offsetPosition = elementPosition + window.pageYOffset - offset;

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
      // Optional: scroll back to product top if changing filter
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

  const availableTags = [
    { label: "Lenses", value: "all", icon: "👁️", desc: "Core", type: 'filter' },
    { label: "Sale", value: "sale", icon: "🏷️", desc: "Value", type: 'filter' },
    { label: "Eye Lashes", scrollId: "eyelashes-section", icon: "✨", desc: "Style", type: 'scroll' },
    { label: "Solutions", scrollId: "solutions-section", icon: "💧", desc: "Pure", type: 'scroll' },
    { label: "Tools", scrollId: "applicators-section", icon: "🛠️", desc: "Kit", type: 'scroll' },
  ];

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
    <section id="products-section" className="w-full py-24 bg-white relative">
      <div className="max-w-[1700px] mx-auto px-4 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 border-b border-secondary-100 pb-16">
          <div className="max-w-3xl">
            <span className="text-primary-500 font-bold tracking-[0.4em] uppercase text-xs mb-4 block">Editorial Choice</span>
            <h2 className="text-7xl md:text-9xl font-extrabold text-secondary-900 tracking-tighter leading-none mb-6">
              THE <span className="text-secondary-400 font-serif italic font-normal">ART</span> OF VISION
            </h2>
            <p className="text-xl text-secondary-400 font-medium">Precision ocular aesthetics for the modern gaze.</p>
          </div>

          {/* Compact Boutique Category Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {availableTags.map((tag) => {
              const isActive = tag.type === 'filter' ? selectedTag === tag.value : false;

              return (
                <button
                  key={tag.label}
                  onClick={() => handleTagClick(tag)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-xl border transition-all duration-500 group relative ${isActive
                    ? "bg-secondary-900 border-secondary-900 shadow-xl scale-[1.05]"
                    : "bg-secondary-50 border-secondary-100 hover:border-primary-500 hover:bg-white"
                    }`}
                >
                  <span className={`text-2xl transition-transform duration-500 group-hover:scale-110 ${isActive ? 'saturate-100' : 'saturate-0 opacity-40'}`}>
                    {tag.icon}
                  </span>
                  <div className="flex flex-col items-start leading-none">
                    <span className={`text-[10px] font-black tracking-widest uppercase mb-1 ${isActive ? 'text-primary-400' : 'text-secondary-400'}`}>
                      {tag.desc}
                    </span>
                    <h4 className={`font-black text-sm tracking-tight ${isActive ? 'text-white' : 'text-secondary-900 group-hover:text-primary-500 transition-colors'}`}>
                      {tag.label.toUpperCase()}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Action Row */}
        <div className="flex justify-end mb-12">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="group relative flex items-center gap-4 px-6 md:px-8 py-3 md:py-4 bg-secondary-900 rounded-2xl hover:bg-primary-500 transition-all duration-500 shadow-xl hover:scale-105"
          >
            <div className="relative">
              <svg className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <span className="text-[10px] md:text-xs font-black tracking-[0.2em] md:tracking-[0.3em] text-white uppercase">Refine Search</span>
          </button>
        </div>

        {/* Products Grid */}
        {!country || isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-12 gap-y-12 md:gap-y-24">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-full">
                <ProductCardShimmer />
              </div>
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-12 gap-y-12 md:gap-y-24">
            {filteredProducts.map((product: any, index: number) => {
              const imageUrl = getThumbnailUrl(product);
              const currentPrice = typeof product.price === "number" ? product.price : parseFloat(product.price);

              return (
                <div
                  key={index}
                  className="group cursor-pointer w-full"
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
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-secondary-200">
                        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}



                    {product.tags && (
                      <div className="absolute bottom-3 left-3 md:bottom-8 md:left-8">
                        <span className="px-2 md:px-5 py-1 md:py-2 bg-white/80 md:bg-white/90 backdrop-blur-md rounded-md md:rounded-xl text-[7px] md:text-[10px] font-black tracking-widest text-secondary-900 shadow-sm uppercase">
                          {Array.isArray(product.tags) ? product.tags[0] : String(product.tags)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col">
                        <span className="text-[8px] md:text-[10px] font-bold text-primary-500 tracking-[0.2em] md:tracking-[0.3em] uppercase mb-1 md:mb-2 block">{product.sub_title || "LENS SERIES"}</span>
                        <h3 className="text-sm md:text-3xl font-black text-secondary-900 tracking-tighter leading-tight group-hover:text-primary-500 transition-colors uppercase">
                          {product.title}
                        </h3>
                      </div>
                      <div className="flex items-baseline gap-1 md:gap-2 pt-2 border-t border-secondary-50">
                        <span className="text-[8px] md:text-[10px] font-bold text-secondary-400 tracking-widest uppercase block">MSRP</span>
                        <div className="text-sm md:text-2xl font-black text-secondary-900 font-price">
                          {formatPrice(currentPrice, country)}
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
        ) : (
          !isLoading && (
            <div className="text-center py-60 bg-secondary-50 rounded-2xl">
              <h3 className="text-6xl font-black text-secondary-900 mb-6 tracking-tighter">THE VAULT IS EMPTY</h3>
              <p className="text-secondary-400 font-medium text-xl max-w-lg mx-auto leading-relaxed">We're currently curating new perspectives. Please check back as our collection evolves.</p>
            </div>
          )
        )}
      </div>

      {isFilterDrawerOpen && (
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
      )}

      <Toast message={toastConfig.message} type="success" isVisible={toastConfig.isVisible} onClose={() => setToastConfig({ message: "", isVisible: false })} duration={2000} />
    </section>
  );
};

export default ProductItems;
