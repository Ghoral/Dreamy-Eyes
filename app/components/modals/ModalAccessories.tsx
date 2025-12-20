"use client";

import { useEffect, useState } from "react";
import { useUserCountry } from "@/app/hooks/useUserCountry";
import { formatPriceWithCurrency } from "@/app/util";
import { createSupabaseClient } from "@/app/services/supabase/client/supabaseBrowserClient";
import { useCart } from "@/app/context/CartContext";
import Toast from "@/app/components/ui/Toast";

type Accessory = {
  id: number;
  created_at: string;
  name: string | null;
  description: string | null;
  price: number | string | null;
  quantity: number | string | null;
};

export default function ModalAccessories({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { country } = useUserCountry();
  const [items, setItems] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(false);
  const { addAccessoryItem } = useCart();
  const [toastConfig, setToastConfig] = useState<{ message: string; isVisible: boolean }>({
    message: "",
    isVisible: false,
  });
  const [quantityMap, setQuantityMap] = useState<Record<number, number>>({});
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAccessories = async () => {
      setLoading(true);
      try {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from("accessories")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(12);
        if (!error && Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) {
      fetchAccessories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Enhance Your Look</h2>
                <p className="text-primary-100 text-xs mt-1">Must-have accessories to complete your style</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-secondary-600">Loading accessories...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-secondary-600">No accessories available at this time</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border-2 transition-all duration-300 border-secondary-200 bg-gradient-to-br from-white to-secondary-50 hover:border-primary-300 hover:shadow-soft"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-secondary-800">
                          {item.name || "Accessory"}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                      <p className="text-secondary-600 text-sm mb-3 line-clamp-3">
                        {item.description || "No description available."}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary-600">{priceDisplay}</span>
                        {qty != null && (
                          <span className="text-secondary-500 text-sm">Qty: {qty}</span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-xl border border-secondary-200 overflow-hidden">
                          <button
                            className="px-3 py-2 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 disabled:opacity-50"
                            disabled={!inStock || selectedQty <= 1}
                            onClick={() => {
                              const next = Math.max(1, selectedQty - 1);
                              setQuantityMap((m) => ({ ...m, [item.id]: next }));
                            }}
                          >
                            −
                          </button>
                          <div className="px-4 py-2 font-semibold text-secondary-800">{selectedQty}</div>
                          <button
                            className="px-3 py-2 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 disabled:opacity-50"
                            disabled={!inStock || (qty != null && selectedQty >= qty)}
                            onClick={() => {
                              const limit = qty ?? Number.POSITIVE_INFINITY;
                              const next = Math.min(limit, selectedQty + 1);
                              setQuantityMap((m) => ({ ...m, [item.id]: next }));
                            }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          disabled={!inStock || rawPrice == null || pendingId === item.id}
                          onClick={async () => {
                            if (!inStock || rawPrice == null) return;
                            try {
                              setPendingId(item.id);
                              const supabase = createSupabaseClient();
                              const { data, error } = await supabase.rpc(
                                "check_accessory_availability",
                                { accessory_id: item.id }
                              );
                              if (error) {
                                setToastConfig({ message: "Failed to check stock", isVisible: true });
                                setTimeout(() => {
                                  setToastConfig({ message: "", isVisible: false });
                                }, 1500);
                                return;
                              }
                              const available =
                                typeof data === "boolean"
                                  ? data
                                  : (data?.available ?? data?.is_available ?? false);
                              if (!available) {
                                setToastConfig({ message: "Out of stock", isVisible: true });
                                setTimeout(() => {
                                  setToastConfig({ message: "", isVisible: false });
                                }, 1500);
                                return;
                              }
                              const addQty = Math.max(
                                1,
                                Math.min(selectedQty, qty ?? selectedQty)
                              );
                              addAccessoryItem({
                                id: item.id,
                                title: item.name || "Accessory",
                                description: item.description || undefined,
                                price: Number(rawPrice),
                                quantity: addQty,
                                maxQuantity: qty ?? undefined,
                              });
                              setToastConfig({ message: "Added to cart", isVisible: true });
                              setTimeout(() => {
                                setToastConfig({ message: "", isVisible: false });
                              }, 1500);
                            } finally {
                              setPendingId(null);
                            }
                          }}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                            />
                          </svg>
                          Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Toast
            message={toastConfig.message}
            type="success"
            isVisible={toastConfig.isVisible}
            onClose={() => setToastConfig({ message: "", isVisible: false })}
            duration={1500}
          />
        </div>
      </div>
    </>
  );
}

