"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/app/services/supabase/client/supabaseBrowserClient";
import { useUserCountry } from "@/app/hooks/useUserCountry";
import { formatPriceWithCurrency, getAccessoryImageUrl } from "@/app/util";
import { useCart } from "@/app/context/CartContext";
import Toast from "@/app/components/ui/Toast";

type Accessory = {
  id: number;
  created_at: string;
  name: string | null;
  description: string | null;
  price: number | string | null;
  quantity: number | string | null;
  image: string | null;
};

const ApplicatorsSection = () => {
  const { country } = useUserCountry();
  const [items, setItems] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { addAccessoryItem } = useCart();
  const [toastConfig, setToastConfig] = useState<{ message: string; isVisible: boolean }>({
    message: "",
    isVisible: false,
  });
  const [quantityMap, setQuantityMap] = useState<Record<number, number>>({});
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchAccessories = async () => {
      try {
        setLoading(true);
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from("accessories")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(12);

        if (error) throw new Error(error.message || "Failed to fetch accessories");

        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || "Failed to load accessories");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchAccessories();
    return () => { mounted = false; };
  }, []);

  const handleQuantityCheck = async (item: Accessory, nextQty: number) => {
    if (nextQty < 1) return;
    try {
      setPendingId(item.id);
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.rpc("check_accessory_availability", { accessory_id: item.id });
      if (error) throw error;
      const available = typeof data === "boolean" ? data : (data?.available ?? data?.is_available ?? false);
      if (!available) {
        setToastConfig({ message: "Sorry, this quantity is no longer available in stock.", isVisible: true });
        return;
      }
      setQuantityMap((m) => ({ ...m, [item.id]: nextQty }));
    } catch (err) {
      setToastConfig({ message: "Failed to verify stock availability.", isVisible: true });
    } finally {
      setPendingId(null);
    }
  };

  if (loading || error || items.length === 0) return null;

  return (
    <section id="applicators-section" className="py-32 bg-white relative">
      <div className="max-w-[1700px] mx-auto px-4 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 border-b border-secondary-100 pb-16">
          <div className="max-w-3xl">
            <span className="text-primary-500 font-bold tracking-[0.4em] uppercase text-xs mb-4 block">Precision Instruments</span>
            <h2 className="text-7xl md:text-9xl font-extrabold text-secondary-900 tracking-tighter leading-none mb-6">
              THE <span className="text-secondary-400 font-serif italic font-normal">KIT</span>
            </h2>
            <p className="text-xl text-secondary-400 font-medium">Elevating the application ritual with professional-grade tools.</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-12 gap-y-12 md:gap-y-24">
          {items.map((item) => {
            const rawPrice = typeof item.price === "string" ? parseFloat(item.price) : (item.price as number | null);
            const qty = typeof item.quantity === "string" ? parseInt(item.quantity) : (item.quantity as number | null);
            const inStock = (qty ?? 0) > 0;
            const selectedQty = quantityMap[item.id] ?? 1;

            return (
              <div key={item.id} className="group cursor-pointer w-[calc(50%-1rem)] sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-2rem)] xl:w-[calc(25%-2.25rem)] max-w-[380px]">
                <div className="relative aspect-[4/5] mb-10 overflow-hidden bg-secondary-50 rounded-2xl transition-all duration-700 ease-soft-spring">
                  {item.image ? (
                    <img
                      src={getAccessoryImageUrl(item.image)}
                      alt={item.name || "Accessory"}
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl">🛠️</div>
                  )}

                  {/* Top Badge */}
                  {!inStock && (
                    <div className="absolute top-3 right-3 md:top-8 md:right-8">
                      <span className="px-3 md:px-5 py-1 md:py-2 bg-red-500 text-white rounded-md md:rounded-xl text-[7px] md:text-[10px] font-black tracking-widest shadow-sm uppercase">
                        OUT
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 md:top-8 md:left-8 md:bottom-auto">
                    <span className="px-2 md:px-5 py-1 md:py-2 bg-white/80 md:bg-white/90 backdrop-blur-md rounded-md md:rounded-xl text-[7px] md:text-[10px] font-black tracking-widest text-secondary-900 shadow-sm uppercase">
                      PRO TOOL
                    </span>
                  </div>

                  {/* Quantity Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-700">
                    <div className="bg-white p-2 rounded-2xl shadow-2xl flex items-center gap-2">
                      <div className="flex-1 flex items-center justify-between px-6 py-3 bg-secondary-50 rounded-xl">
                        <button
                          disabled={!inStock || selectedQty <= 1 || pendingId === item.id}
                          onClick={(e) => { e.stopPropagation(); handleQuantityCheck(item, selectedQty - 1); }}
                          className="text-secondary-900 hover:text-primary-500 transition-colors font-black text-xl w-8 h-8 flex items-center justify-center disabled:opacity-30"
                        >—</button>
                        <span className="font-black text-secondary-900 text-lg w-8 text-center">{selectedQty}</span>
                        <button
                          disabled={!inStock || (qty != null && selectedQty >= qty) || pendingId === item.id}
                          onClick={(e) => { e.stopPropagation(); handleQuantityCheck(item, selectedQty + 1); }}
                          className="text-secondary-900 hover:text-primary-500 transition-colors font-black text-xl w-8 h-8 flex items-center justify-center disabled:opacity-30"
                        >+</button>
                      </div>
                      <button
                        disabled={!inStock || rawPrice == null || pendingId === item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          addAccessoryItem({
                            id: item.id,
                            title: item.name || "Accessory",
                            price: Number(rawPrice),
                            quantity: selectedQty,
                            maxQuantity: qty ?? undefined,
                            image: item.image ? getAccessoryImageUrl(item.image) : undefined,
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

                <div className="flex flex-col gap-3 md:gap-4">
                  <span className="text-[8px] md:text-[10px] font-bold text-primary-500 tracking-[0.2em] md:tracking-[0.3em] uppercase mb-1 md:mb-2 block">PRECISION ACCESSORY</span>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-sm md:text-3xl font-black text-secondary-900 tracking-tighter leading-tight group-hover:text-primary-500 transition-colors uppercase flex-1">
                      {item.name || "Accessory"}
                    </h3>
                    <div className="text-right shrink-0">
                      <span className="text-[8px] md:text-[10px] font-bold text-secondary-400 tracking-widest uppercase block mb-1">MSRP</span>
                      <div className="text-sm md:text-2xl font-black text-secondary-900 font-price">
                        {rawPrice != null ? formatPriceWithCurrency(rawPrice, country) : "—"}
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
};

export default ApplicatorsSection;
