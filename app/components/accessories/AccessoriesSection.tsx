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

const AccessoriesSection = () => {
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

  if (loading) {
    return null;
  }

  if (error || items.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" />
        <div
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-bold rounded-full mb-4 shadow-sm">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.1 0-2 .9-2 2m0 0c0 1.1.9 2 2 2m0-4c1.1 0 2 .9 2 2m-2 8a8 8 0 110-16 8 8 0 010 16z"
              />
            </svg>
            Accessories
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-secondary-900 mb-3 tracking-tight">
            Complete Your Look
          </h2>
          <p className="text-base md:text-lg text-secondary-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Explore our curated accessories to pair with your lenses — priced in your local currency.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {items.map((item) => {
            const rawPrice =
              typeof item.price === "string"
                ? parseFloat(item.price)
                : (item.price as number | null);
            const priceDisplay =
              rawPrice != null ? formatPriceWithCurrency(rawPrice, country) : "—";
            const qty =
              typeof item.quantity === "string"
                ? parseInt(item.quantity)
                : (item.quantity as number | null);
            const inStock = (qty ?? 0) > 0;
            const selectedQty = quantityMap[item.id] ?? 1;

            const handleQuantityCheck = async (nextQty: number) => {
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

            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-secondary-100 overflow-hidden w-full sm:w-[calc(50%-1.5rem)] md:w-[calc(33.333%-1.5rem)] lg:w-[calc(25%-1.5rem)] max-w-[300px]"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-secondary-800 group-hover:text-primary-600 transition-colors duration-300">
                      {item.name || "Accessory"}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${inStock
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  {/* Accessory Image */}
                  <div className="relative aspect-[4/3] mb-4 rounded-xl overflow-hidden bg-secondary-50 group-hover:shadow-inner transition-all duration-300">
                    {item.image ? (
                      <img
                        src={getAccessoryImageUrl(item.image)}
                        alt={item.name || "Accessory"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-secondary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <p className="text-secondary-600 text-sm mb-4 line-clamp-3 h-[60px]">
                    {item.description || "No description available."}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary-600">
                      {priceDisplay}
                    </span>
                    {qty != null && (
                      <span className="text-secondary-500 text-sm">
                        Total: {qty}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-xl border border-secondary-200 overflow-hidden">
                      <button
                        className="px-3 py-2 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 disabled:opacity-50 transition-colors"
                        disabled={!inStock || selectedQty <= 1 || pendingId === item.id}
                        onClick={() => handleQuantityCheck(selectedQty - 1)}
                      >
                        −
                      </button>
                      <div className="px-4 py-2 font-semibold text-secondary-800 min-w-[40px] text-center">
                        {pendingId === item.id ? (
                          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                          selectedQty
                        )}
                      </div>
                      <button
                        className="px-3 py-2 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 disabled:opacity-50 transition-colors"
                        disabled={!inStock || (qty != null && selectedQty >= qty) || pendingId === item.id}
                        onClick={() => handleQuantityCheck(selectedQty + 1)}
                      >
                        +
                      </button>
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
                      setToastConfig({
                        message: "Added to cart successfully",
                        isVisible: true,
                      });
                      setTimeout(() => {
                        setToastConfig({ message: "", isVisible: false });
                      }, 1500);
                    }}
                    className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 md:py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                      />
                    </svg>
                    Add to Cart
                  </button>
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

export default AccessoriesSection;
