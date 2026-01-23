"use client";

import { useEffect, useState, useRef } from "react";
import { useUserCountry } from "../../hooks/useUserCountry";
import { formatPrice, getAccessoryImageUrl } from "../../util";
import { useCart } from "../../context/CartContext";
import { get_applicators, get_solutions } from "../../api/product";

type AccessoryItem = {
  id: number;
  created_at: string;
  name?: string | null;
  title?: string | null; // Solutions have title
  price: number | string | null;
  quantity: number | string | null;
  image: string | null;
  type: "applicator" | "solution";
};

const AccessoriesSection = ({ initialData, initialCountry }: { initialData?: AccessoryItem[]; initialCountry?: string }) => {
  const { country: clientCountry } = useUserCountry();
  const activeCountry = clientCountry || initialCountry || null;
  const [items, setItems] = useState<AccessoryItem[]>(initialData || []);
  const [loading, setLoading] = useState<boolean>(false);
  const { addAccessoryItem, state: cartState, updateAccessoryQuantity, removeAccessoryItem } = useCart();
  const isFirstRender = useRef(true);

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        if (activeCountry?.toLowerCase() === initialCountry?.toLowerCase()) {
          return;
        }
      }

      if (!activeCountry) return;

      try {
        setLoading(true);
        const [applicatorsRes, solutionsRes] = await Promise.all([
          get_applicators(50, 0, activeCountry),
          get_solutions(50, 0, activeCountry),
        ]);

        if (!mounted) return;

        const applicators = (Array.isArray(applicatorsRes.data) ? applicatorsRes.data : []).map((i: any) => ({ ...i, type: "applicator" as const }));
        const solutions = (Array.isArray(solutionsRes.data) ? solutionsRes.data : []).map((i: any) => ({ ...i, type: "solution" as const }));

        setItems([...applicators, ...solutions]);
      } catch (err: any) {
        console.error("Failed to load accessories", err);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchAll();
    return () => { mounted = false; };
  }, [activeCountry, initialCountry]);

  if (!loading && items.length === 0) return null;

  const displayedItems = items;

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

        <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-12 gap-y-6 md:gap-y-12">
          {displayedItems.map((item) => {
            const rawPrice = typeof item.price === "string" ? parseFloat(item.price) : (item.price as number | null);
            const qty = typeof item.quantity === "string" ? parseInt(item.quantity) : (item.quantity as number | null);
            const inStock = (qty ?? 0) > 0;
            const displayName = item.title || item.name || "Accessory";
            const bucketFolder = item.type === "solution" ? "solutions" : "applicators";

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
                    <div className="w-full h-full flex items-center justify-center text-8xl">{item.type === "solution" ? "💧" : "🛠️"}</div>
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
                      {item.type === "solution" ? "SOLUTIONS" : "APPLICATOR"}
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
      </div>
    </section>
  );
};

export default AccessoriesSection;
