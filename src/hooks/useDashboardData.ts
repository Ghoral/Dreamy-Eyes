import { useState, useEffect } from "react";
import { supabaseClient } from "../service/supabase";
import { Tables } from "../types/database";

interface DashboardData {
  userCount: number;
  orderCount: number;
  monthlySales: { month: string; amount: number }[];
  ordersByCountry: { country: string; count: number }[];
  loading: boolean;
  error: string | null;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    userCount: 0,
    orderCount: 0,
    monthlySales: [],
    ordersByCountry: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch user count
        const { count: userCount, error: userError } = await supabaseClient
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "user");

        if (userError) throw userError;

        // Fetch order count
        const { count: orderCount, error: orderError } = await supabaseClient
          .from("orders")
          .select("*", { count: "exact", head: true });

        if (orderError) throw orderError;

        // Fetch monthly sales data (orders with status 'paid')
        const { data: monthlySalesData, error: salesError } =
          await supabaseClient
            .from("orders")
            .select("total_amount, created_at")
            .eq("status", "paid");

        if (salesError) throw salesError;

        // Process monthly sales data
        const monthlySales = processMonthlySales(monthlySalesData || []);

        // Fetch orders by country
        const { data: ordersByCountryData, error: countryError } =
          await supabaseClient.from("orders").select(`
            id,
            user_id
          `);

        if (countryError) throw countryError;

        // Process orders by country data
        const ordersByCountry = await processOrdersByCountry(
          ordersByCountryData || []
        );

        setData({
          userCount: userCount || 0,
          orderCount: orderCount || 0,
          monthlySales,
          ordersByCountry,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "An error occurred",
        }));
      }
    }

    fetchDashboardData();
  }, []);

  return data;
}

function processMonthlySales(
  orders: { total_amount: number; created_at: string }[]
) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyData = new Array(12).fill(0);

  orders.forEach((order) => {
    const date = new Date(order.created_at);
    const monthIndex = date.getMonth();
    monthlyData[monthIndex] += order.total_amount;
  });

  return months.map((month, index) => ({
    month,
    amount: monthlyData[index],
  }));
}

async function processOrdersByCountry(orders: any[]) {
  const countryCounts: { [key: string]: number } = {};

  // Get unique user_ids from orders
  const userIds = [...new Set(orders.map((order) => order.user_id))];

  // Fetch address data for these user_ids
  const { data: addresses, error } = await supabaseClient
    .from("address")
    .select("user_id, country")
    .in("user_id", userIds);

  if (error) throw error;

  // Create a map of user_id to country
  const userCountryMap = new Map(
    addresses.map((addr) => [addr.user_id, addr.country])
  );

  // Count orders by country
  orders.forEach((order) => {
    const country = userCountryMap.get(order.user_id);
    if (country) {
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    }
  });

  return Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 countries
}
