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

        if (error) {
          throw new Error(error.message || "Failed to fetch accessories");
        }

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
    return () => {
      mounted = false;
    };
  }, []);

  const handleQuantityCheck = async (item: Accessory, nextQty: number) => {
    if (nextQty < 1) return;

    try {
      setPendingId(item.id);
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.rpc(
        "check_accessory_availability",
        { accessory_id: item.id }
      );

      if (error) throw error;
      const available = typeof data === "boolean" ? data : (data?.available ?? data?.is_available ?? false);

      if (!available) {
        setToastConfig({
          message: "Sorry, this quantity is no longer available in stock.",
          isVisible: true,
        });
        return;
      }

      setQuantityMap((m) => ({ ...m, [item.id]: nextQty }));
    } catch (err) {
      setToastConfig({
        message: "Failed to verify stock availability.",
        isVisible: true,
      });
    } finally {
      setPendingId(null);
    }
  };

  if (loading || error || items.length === 0) {
    return null;
  }

  return (
    <section id="applicators-section" className="py-32 bg-white relative">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col md:flex-row items-baseline gap-8 mb-20">
          <div className="flex-1">
            <span className="text-secondary-400 font-black tracking-[0.4em] uppercase text-xs mb-6 block">Precision Tools</span>
            <h2 className="text-5xl md:text-8xl font-black text-secondary-900 tracking-tighter leading-none mb-8">
              THE <span className="text-primary-500 italic font-serif">KIT</span>
            </h2>
          </div>
          <p className="max-w-md text-secondary-500 font-medium">
            Every detail matters. Our professional-grade applicator kits ensure a seamless, hygienic, and perfect application experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => {
            const rawPrice = typeof item.price === "string" ? parseFloat(item.price) : (item.price as number | null);
            const priceDisplay = rawPrice != null ? formatPriceWithCurrency(rawPrice, country) : "—";
            const qty = typeof item.quantity === "string" ? parseInt(item.quantity) : (item.quantity as number | null);
            const inStock = (qty ?? 0) > 0;
            const selectedQty = quantityMap[item.id] ?? 1;

            return (
              <div key={item.id} className="group relative">
                <div className="bg-secondary-50 rounded-2xl transition-all duration-700 ease-soft-spring overflow-hidden p-8 border border-secondary-100 h-full flex flex-col">
                  <div className="relative aspect-square mb-10 rounded-2xl overflow-hidden bg-white shadow-soft">
                    {item.image ? (
                      <img
                        src={getAccessoryImageUrl(item.image)}
                        alt={item.name || "Accessory"}
                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">🛠️</div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-2xl font-black text-secondary-900 tracking-tight leading-tight uppercase group-hover:text-primary-500 transition-colors">
                        {item.name || "Accessory"}
                      </h3>
                      {!inStock && <span className="text-[10px] font-black text-red-500 tracking-widest uppercase">OUT</span>}
                    </div>
                    <p className="text-secondary-400 text-sm font-medium line-clamp-2">
                      {item.description || "Essential precision tool for lens maintenance."}
                    </p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-secondary-200/50">
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-2xl font-black text-secondary-900">{priceDisplay}</span>
                      <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm">
                        <button
                          disabled={!inStock || selectedQty <= 1 || pendingId === item.id}
                          onClick={() => handleQuantityCheck(item, selectedQty - 1)}
                          className="text-secondary-400 hover:text-primary-500 transition-colors font-black"
                        >—</button>
                        <span className="font-black text-secondary-900 w-4 text-center">{selectedQty}</span>
                        <button
                          disabled={!inStock || (qty != null && selectedQty >= qty) || pendingId === item.id}
                          onClick={() => handleQuantityCheck(item, selectedQty + 1)}
                          className="text-secondary-400 hover:text-primary-500 transition-colors font-black"
                        >+</button>
                      </div>
                    </div>
                    <button
                      disabled={!inStock || rawPrice == null || pendingId === item.id}
                      onClick={() => {
                        addAccessoryItem({
                          id: item.id,
                          title: item.name || "Accessory",
                          description: item.description || undefined,
                          price: Number(rawPrice),
                          quantity: selectedQty,
                          maxQuantity: qty ?? undefined,
                          image: item.image ? getAccessoryImageUrl(item.image) : undefined,
                          category: "accessory" as const,
                        });
                        setToastConfig({ message: "Item added", isVisible: true });
                        setTimeout(() => setToastConfig({ message: "", isVisible: false }), 2000);
                      }}
                      className="w-full py-5 bg-secondary-900 text-white rounded-3xl font-black tracking-widest text-xs hover:bg-primary-500 transition-all duration-500 shadow-xl"
                    >
                      ADD TO KIT
                    </button>
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
