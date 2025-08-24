"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseClient } from "../services/supabase/client/supabaseBrowserClient";

interface Order {
  order_number: string;
  id: string;
  product_id: string;
  quantity: number;
  status: string;
  created_at: string;
  title: string;
  images: string;
  total_amount: number;
  color: string;
  address: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const supabase = createSupabaseClient();

      // Check if user is authenticated
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      // Call the get_my_orders RPC function
      const { data: ordersData, error: ordersError } = await (
        supabase as any
      ).rpc("get_my_orders");

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        setError("Failed to load orders");
        return;
      }

      setOrders((ordersData as Order[]) || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getImageUrl = (images: string, color: string) => {
    try {
      const parsedImages = JSON.parse(images);
      const colorImages = parsedImages[color];
      if (colorImages && colorImages.length > 0) {
        return `${process.env.NEXT_PUBLIC_IMAGE_URL}/product-image/${colorImages[0]}`;
      }
      // Fallback to first available image
      const firstColor = Object.keys(parsedImages)[0];
      if (firstColor && parsedImages[firstColor].length > 0) {
        return `${process.env.NEXT_PUBLIC_IMAGE_URL}/product-image/${parsedImages[firstColor][0]}`;
      }
    } catch (error) {
      console.error("Error parsing images:", error);
    }
    return "/images/logo.png"; // Default fallback
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 pt-28 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary-600 text-lg">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 pt-28 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">
              Error Loading Orders
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadOrders}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 pt-28 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-secondary-800 mb-4">
            My Orders
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            Track your orders and view order history
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-soft p-12 text-center border border-secondary-100">
            <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-secondary-800 mb-2">
              No Orders Yet
            </h3>
            <p className="text-secondary-600 mb-6">
              Start shopping to see your orders here
            </p>
            <button
              onClick={() => router.push("/shop")}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-lg"
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl shadow-soft border border-secondary-100 overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-secondary-50 to-primary-50 px-8 py-6 border-b border-secondary-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-secondary-800 mb-1">
                        Order #{order.order_number}
                      </h3>
                      <p className="text-secondary-600">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-2xl font-bold text-primary-600">
                        ${order.total_amount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Product Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start space-x-6">
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-secondary-100 overflow-hidden flex-shrink-0">
                          <Image
                            src={getImageUrl(order.images, order.color)}
                            alt={order.title}
                            width={96}
                            height={96}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-secondary-800 mb-2">
                            {order.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-3">
                            <span>Quantity: {order.quantity}</span>
                            <span>Color: {order.color}</span>
                          </div>
                          <p className="text-secondary-600 text-sm">
                            Product ID: {order.product_id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div>
                      <h5 className="font-semibold text-secondary-800 mb-3">
                        Shipping Address
                      </h5>
                      <div className="bg-secondary-50 rounded-xl p-4">
                        <p className="text-sm text-secondary-700 leading-relaxed">
                          {order.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
