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
        return;
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
    { label: "Sale", value: "sale" },
    { label: "Latest Arrival", value: "latest_arrival" },
    { label: "Top Seller", value: "top_seller" },
    { label: "Best Reviewed", value: "best_reviewed" },
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
    <section id="products-section" className="w-full py-32 bg-white relative">
      <div className="max-w-[1600px] mx-auto px-4 md:px-12">
        {/* Creative Header */}
        <div className="mb-24 flex flex-col md:flex-row items-baseline justify-between gap-8 border-b border-secondary-100 pb-12">
          <div className="max-w-2xl">
            <h2 className="text-7xl md:text-9xl font-black text-secondary-900 tracking-tighter leading-none mb-8">
              THE <span className="text-primary-500 italic font-serif">COLLECTION</span>
            </h2>
            <p className="text-xl text-secondary-500 font-medium max-w-lg leading-relaxed">
              Curating the world's most sophisticated eye aesthetic solutions. Precision engineered, naturally inspired.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {availableTags.map((tag) => (
              <button
                key={tag.value}
                onClick={() => setSelectedTag(tag.value)}
                className={`px-8 py-3 rounded-full text-sm font-black transition-all duration-300 ${selectedTag === tag.value
                  ? "bg-secondary-900 text-white shadow-xl"
                  : "bg-secondary-50 text-secondary-500 hover:bg-secondary-100"
                  }`}
              >
                {tag.label.toUpperCase()}
              </button>
            ))}

            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="px-6 py-3 bg-white border border-secondary-200 rounded-full hover:border-primary-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {!country || isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {[...Array(8)].map((_, i) => <ProductCardShimmer key={i} />)}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-20">
            {filteredProducts.map((product: any, index: number) => {
              const imageUrl = getThumbnailUrl(product);
              const currentPrice = typeof product.price === "number" ? product.price : parseFloat(product.price);

              return (
                <div
                  key={index}
                  className="group cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative aspect-[4/5] mb-8 overflow-hidden bg-secondary-50 rounded-2xl transition-all duration-700 ease-soft-spring">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-secondary-200">
                        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <div className="bg-white text-secondary-900 px-8 py-3 rounded-full font-black text-xs tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl">
                        QUICK VIEW
                      </div>
                    </div>
                    {product.tags && (
                      <div className="absolute top-8 left-8">
                        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest text-secondary-900 shadow-sm uppercase">
                          {Array.isArray(product.tags) ? product.tags[0] : String(product.tags)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 px-4">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-xl font-bold text-secondary-900 tracking-tight leading-tight group-hover:text-primary-500 transition-colors uppercase">
                        {product.title}
                      </h3>
                      <div className="text-xl font-black text-secondary-900">
                        {formatPrice(currentPrice, country)}
                      </div>
                    </div>
                    <p className="text-secondary-400 text-sm font-medium uppercase tracking-widest">
                      {product.sub_title || "Premium Lens Series"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center py-40 bg-secondary-50 rounded-[5rem]">
              <h3 className="text-5xl font-black text-secondary-900 mb-6">REWORKING THE ART</h3>
              <p className="text-secondary-500 font-medium">New designs are coming soon. Stay connected.</p>
            </div>
          )
        )}
      </div>

      {isFilterDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl p-12 overflow-y-auto">
            <div className="flex justify-between items-center mb-16">
              <h3 className="text-4xl font-black text-secondary-900 tracking-tighter">FILTERS</h3>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="p-4 bg-secondary-50 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-12">
              <div>
                <label className="block text-xs font-black tracking-widest text-secondary-400 uppercase mb-4">Color</label>
                <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-full py-4 border-b-2 border-secondary-100 font-bold text-xl focus:border-primary-500 appearance-none bg-transparent">
                  <option value="all">ALL COLORS</option>
                  {availableColors.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black tracking-widest text-secondary-400 uppercase mb-4">Min Price</label>
                  <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full py-4 border-b-2 border-secondary-100 font-bold text-xl placeholder:text-secondary-200" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-black tracking-widest text-secondary-400 uppercase mb-4">Max Price</label>
                  <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full py-4 border-b-2 border-secondary-100 font-bold text-xl placeholder:text-secondary-200" placeholder="∞" />
                </div>
              </div>
              <button onClick={() => { setSelectedColor("all"); setPriceMin(""); setPriceMax(""); setPowerMin(""); setPowerMax(""); setSelectedTag("all"); setIsFilterDrawerOpen(false); }} className="w-full py-6 bg-secondary-900 text-white font-black text-sm tracking-[0.2em] rounded-2xl hover:bg-primary-500 transition-colors shadow-2xl mt-12">
                RESET ALL FILTERS
              </button>
            </div>
          </div>
        </>
      )}

      <Toast message={toastConfig.message} type="success" isVisible={toastConfig.isVisible} onClose={() => setToastConfig({ message: "", isVisible: false })} duration={2000} />
    </section>
  );
};

export default ProductItems;
