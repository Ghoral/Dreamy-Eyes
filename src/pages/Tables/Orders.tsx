import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { supabaseClient } from "../../service/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";

interface Order {
  id: string;
  order_number: string;
  title: string;
  created_at: string;
  status: string | null;
  total_amount: number | null;
  user_id: string | null;
  color: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    mobile_number: string;
  } | null;
  address: string;
}

const statusOptions = [
  { label: "Awaiting Payment", value: "awaiting" },
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
  { label: "Cancelled", value: "cancelled" },
];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const getStatusLabel = (status: string | null) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.label : status || "N/A";
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await supabaseClient.rpc("get_orders", {
        limit_value: pageSize,
        offset_value: (page - 1) * pageSize,
      });
      const rows = (res?.data as Order[]) || [];
      setOrders(rows);
      setHasMore(rows.length === pageSize);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);

      // Update in database
      const { error } = await supabaseClient
        .from("orders") // Replace 'orders' with your actual table name
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        throw error;
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Orders | Dreamy Eyes Admin"
        description="Orders overview for Dreamy Eyes Admin"
      />
      <PageBreadcrumb pageTitle="Orders" />
      <div className="space-y-6">
        <ComponentCard title="All Orders">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Order ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Ordered Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Customer
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Product
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Color
                    </TableCell>

                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Address
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Contact
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell className="px-5 py-6 text-center text-gray-500">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {order.order_number}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {order.profile?.first_name} {order.profile?.last_name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {order?.title || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {order?.color || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        ${order.total_amount?.toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {order?.address || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {order?.profile?.mobile_number || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={
                            order.status === "paid"
                              ? "success"
                              : order.status === "pending"
                              ? "warning"
                              : order.status === "cancelled"
                              ? "error"
                              : order.status === "awaiting"
                              ? "info"
                              : "primary"
                          }
                        >
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <select
                          value={order.status || ""}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          disabled={updatingStatus === order.id}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="" disabled>
                            Select status
                          </option>
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {updatingStatus === order.id && (
                          <div className="mt-1">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
        <div className="flex items-center justify-center gap-2 mt-2">
          {Array.from(
            { length: page + (hasMore ? 1 : 0) },
            (_, i) => i + 1
          ).map((p) => (
            <button
              key={p}
              className={`px-3 py-1 border rounded text-sm ${
                p === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              disabled={loading}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
