import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { supabaseClient } from "../../service/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { cn } from "../../lib/utils";
import { useUserRole } from "../../hooks/useUserRole";
import { Modal } from "../../components/ui/modal";
import { TimeIcon } from "../../icons";
import { logActivity } from "../../utils/activitylogger";

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
  status_slug: number;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    orderId: string;
    newStatus: string;
  } | null>(null);
  const { isSuperAdmin, role } = useUserRole();
  const [statusOptions, setStatusOptions] = useState<any>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchStatus();
  }, [page]);

  const getStatusLabel = (status: string | null) => {
    const option = statusOptions.find((opt: any) => {
      return opt.value === Number(status);
    });
    return option.label;
  };

  const fetchStatus = async () => {
    try {
      const { data } = await supabaseClient.rpc("get_slugs");
      setStatusOptions(data);
    } catch (err) {
    } finally {
    }
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

  const handleStatusChange = (
    orderId: string,
    newStatus: string,
    currentStatus: string | null,
    index: number
  ) => {
    const newLabel = getStatusLabel(newStatus);
    const currentLabel = currentStatus ?? "";
    setSelectedIndex(index);

    const allowedTransitions: Record<string, string[]> = {
      "Awaiting Payment": ["Paid", "Shipped", "Delivered", "Cancelled"],
      Paid: ["Shipped", "Delivered"],
      Shipped: ["Delivered"],
      Delivered: [],
      Cancelled: [],
    };

    const allowed = allowedTransitions[currentLabel] || [];

    if (!allowed.includes(newLabel)) {
      setPendingStatusChange({ orderId, newStatus });
      setShowWarningModal(true);
      return;
    }

    updateOrderStatus(orderId, newStatus, index);
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    index: number
  ) => {
    try {
      setUpdatingStatus(orderId);

      const statusLabel = getStatusLabel(newStatus);

      // Update in database
      const { error } = await supabaseClient.rpc("update_order_status", {
        _order_id: orderId,
        _new_status: newStatus,
      });

      if (error) {
        throw error;
      }

      const tempData = [...orders];
      tempData[index].status = statusLabel;
      tempData[index].status_slug = Number(newStatus);
      setOrders(tempData);
      // Log the activity
      await logActivity(
        "update",
        "orders",
        `Updated order status to ${statusLabel}`
      );
    } catch (err) {
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

      {/* Warning Modal for Super Admin */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        className="p-6"
      >
        <div className="text-center">
          <div className="mb-5 flex justify-center">
            <div className="rounded-full bg-warning-50 p-3">
              <svg
                className="h-8 w-8 text-warning-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white">
            Change Paid Order Status?
          </h3>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            This order has already been marked as paid. Are you sure you want to
            change its status?
          </p>
          <div className="flex justify-center space-x-3">
            <button
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              onClick={() => setShowWarningModal(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-warning-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-warning-600 focus:outline-none focus:ring-2 focus:ring-warning-500 focus:ring-offset-2 dark:bg-warning-600 dark:hover:bg-warning-700"
              onClick={() => {
                if (pendingStatusChange) {
                  updateOrderStatus(
                    pendingStatusChange.orderId,
                    pendingStatusChange.newStatus,
                    selectedIndex ?? 0
                  );
                  setPendingStatusChange(null);
                }
                setShowWarningModal(false);
              }}
            >
              Yes, Change Status
            </button>
          </div>
        </div>
      </Modal>

      <div className="space-y-6">
        <ComponentCard title="All Orders">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-lg dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 dark:border-white/[0.05] dark:bg-gradient-to-r dark:from-gray-800/50 dark:to-gray-800/70">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Order Id
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Ordered Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Customer
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Product
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Color
                    </TableCell>

                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Address
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Contact
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 bg-white dark:divide-white/[0.05] dark:bg-transparent">
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell className="px-5 py-8 text-center" colSpan={10}>
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                            <TimeIcon className="h-6 w-6 text-gray-500" />
                          </div>
                          <p className="text-gray-500 font-medium">
                            No orders found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {orders.map((order, index: number) => {
                    const status = order.status;

                    return (
                      <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all duration-200 hover:shadow-sm group">
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {order.order_number}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            <TimeIcon className="h-4 w-4" />
                            <span className="text-sm">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {order.profile?.first_name} {order.profile?.last_name}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <span className="text-gray-700 dark:text-gray-300">
                            {order?.title || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {order.customer_name}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            ${order.total_amount?.toFixed(2) || "0.00"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <span className="text-gray-700 dark:text-gray-300">
                            {order?.address || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <span className="text-gray-700 dark:text-gray-300">
                            {order?.profile?.mobile_number || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <Badge
                            size="sm"
                            color={
                              status === "Paid" || status === "Delivered"
                                ? "success"
                                : status === "Awaiting Payment"
                                ? "warning"
                                : status === "Cancelled"
                                ? "error"
                                : "primary"
                            }
                            className="transform transition-all duration-200 hover:scale-105 hover:shadow-sm"
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <div className="relative min-w-[180px]">
                            <select
                              value={order.status_slug || ""}
                              onChange={(e) =>
                                handleStatusChange(
                                  order.id,
                                  e.target.value,
                                  order.status,
                                  index
                                )
                              }
                              disabled={
                                updatingStatus === order.id ||
                                (order.status === "paid" && role === "admin")
                              }
                              className={cn(
                                "appearance-none w-full px-4 py-2 text-sm font-medium",
                                "border border-gray-300 rounded-lg",
                                "bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white",
                                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "shadow-sm transition-all duration-200 ease-in-out",
                                "hover:border-blue-400 hover:shadow"
                              )}
                            >
                              <option value="" disabled>
                                Select status
                              </option>
                              {statusOptions.map((option: any) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                  className="py-1"
                                >
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                              <svg
                                className="w-4 h-4 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                              </svg>
                            </div>
                            {updatingStatus === order.id && (
                              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
