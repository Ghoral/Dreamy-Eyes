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
import { TimeIcon, EyeIcon, ChevronDownIcon, CloseLineIcon, ChevronUpIcon, BoxIcon } from "../../icons";
import { logActivity } from "../../utils/activitylogger";

interface OrderItem {
  title: string;
  color: string | null;
  color_value: string | null;
  quantity: number;
  amount: number;
}

interface Order {
  id?: string;
  order_number: string;
  created_at: string;
  status: string | null;
  total_amount: number | null;
  delivery_charge?: number | null;
  payment_method?: string | null;
  transaction_id?: string | null;
  payment_url?: string | null;
  profile: {
    first_name: string | null;
    last_name: string | null;
    mobile_number: string | null;
    email?: string | null;
  } | null;
  address: string;
  status_slug?: number;
  items: OrderItem[];
}

export default function DeliveryOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { role } = useUserRole();
  const [statusOptions, setStatusOptions] = useState<any>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [paymentSignedUrls, setPaymentSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchStatus();
    fetchOrders();
  }, []);

  useEffect(() => {
    // Fetch orders when page changes
    fetchOrders();
  }, [page]);

  // Generate signed URL when order is selected for modal
  useEffect(() => {
    if (selectedOrder?.payment_url && !paymentSignedUrls[selectedOrder.id || selectedOrder.order_number]) {
      generatePaymentSignedUrl(selectedOrder.payment_url).then((signedUrl) => {
        if (signedUrl) {
          setPaymentSignedUrls((prev) => ({
            ...prev,
            [selectedOrder.id || selectedOrder.order_number]: signedUrl,
          }));
        }
      });
    }
  }, [selectedOrder]);

  const getStatusLabel = (status: string | null) => {
    const option = statusOptions.find((opt: any) => {
      return opt.value === Number(status);
    });
    return option.label;
  };

  const fetchStatus = async () => {
    try {
      const { data, error } = await supabaseClient.rpc("get_slugs");
      
      if (error) {
        console.error("Error fetching status options:", error);
        setStatusOptions([]);
        return;
      }
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn("No status options returned from get_slugs");
        setStatusOptions([]);
        return;
      }
      
      // Filter to only allow cancelled, shipped, shipped_not_paid, and delivered statuses
      const allowedStatuses = ["cancelled", "shipped", "shipped_not_paid", "shipped not paid", "delivered"];
      const filteredStatuses = data.filter((option: any) => {
        if (!option || !option.label) return false;
        const statusLabel = String(option.label).toLowerCase().trim();
        
        // Check if label matches any allowed status (more flexible matching)
        return allowedStatuses.some(allowed => {
          const normalizedAllowed = allowed.toLowerCase().trim();
          const normalizedLabel = statusLabel.replace(/\s+/g, '_').replace(/-/g, '_');
          const normalizedAllowedNoSpaces = normalizedAllowed.replace(/\s+/g, '_').replace(/-/g, '_');
          
          return statusLabel === normalizedAllowed || 
                 normalizedLabel === normalizedAllowedNoSpaces ||
                 statusLabel.includes(normalizedAllowed) ||
                 normalizedLabel.includes(normalizedAllowedNoSpaces) ||
                 statusLabel.replace(/_/g, ' ') === normalizedAllowed.replace(/_/g, ' ');
        });
      });
      
      // Always show filtered results, or all if filter returns empty
      setStatusOptions(filteredStatuses.length > 0 ? filteredStatuses : data);
    } catch (err) {
      console.error("Error fetching status options:", err);
      setStatusOptions([]);
    }
  };

  const generatePaymentSignedUrl = async (paymentUrl: string): Promise<string | null> => {
    if (!paymentUrl) return null;
    
    // If it's already a full URL, return it
    if (paymentUrl.startsWith('http://') || paymentUrl.startsWith('https://')) {
      return paymentUrl;
    }

    // Bucket name is always "payment"
    const bucketName = "payment";
    
    // The payment_url is the file path within the payment bucket
    // Format: "payment-screenshots/filename.jpg" or just "filename.jpg"
    const filePath = paymentUrl;

    try {
      // Generate signed URL with maximum validity (7 days = 604800 seconds)
      const { data: signedUrlData, error: urlError } = await supabaseClient.storage
        .from(bucketName)
        .createSignedUrl(filePath, 604800); // Maximum validity: 7 days

      if (urlError) {
        console.error("Error generating signed URL for payment:", urlError, "bucket:", bucketName, "filePath:", filePath);
        return null;
      }

      if (signedUrlData) {
        const url = typeof signedUrlData === "string"
          ? signedUrlData
          : signedUrlData?.signedUrl || null;
        return url;
      }
    } catch (err) {
      console.error("Exception generating signed URL for payment:", err, "bucket:", bucketName, "filePath:", filePath);
    }

    return null;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      // Pass array of types: 'shipped' and 'shipped_not_paid' to filter orders
      const res = await supabaseClient.rpc("get_orders", {
        limit_value: pageSize,
        offset_value: (page - 1) * pageSize,
        type: ["shipped", "shipped_not_paid"],
      });

      if (res.error) {
        throw res.error;
      }

      const response = res?.data || { data: [], total: 0 };
      const ordersData = response.data || [];
      
      setOrders(ordersData);
      setTotalOrders(response.total || 0);

      // Generate signed URLs for all payment URLs (don't block on this)
      const signedUrlMap: Record<string, string> = {};
      Promise.all(
        ordersData
          .filter((order: any) => order.payment_url)
          .map(async (order: any) => {
            const signedUrl = await generatePaymentSignedUrl(order.payment_url);
            if (signedUrl) {
              signedUrlMap[order.id || order.order_number] = signedUrl;
            }
          })
      ).then(() => {
        setPaymentSignedUrls(signedUrlMap);
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpansion = (orderNumber: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderNumber)) {
        newSet.delete(orderNumber);
      } else {
        newSet.add(orderNumber);
      }
      return newSet;
    });
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    index: number
  ) => {
    try {
      setUpdatingStatus(orderId);

      const statusLabel = getStatusLabel(newStatus);

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
        title="Delivery Orders | Dreamy Eyes Admin"
        description="Delivery orders overview for Dreamy Eyes Admin"
      />
      <PageBreadcrumb pageTitle="Delivery Orders" />

      {/* Order Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }}
      >
        {selectedOrder && (
          <div className="p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
              Order Details
            </h3>
            
            <div className="space-y-4">
              {/* Order Number & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Order Number
                  </label>
                  <p className="text-gray-800 dark:text-white font-medium mt-1">
                    {selectedOrder.order_number}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      size="sm"
                      color={
                        selectedOrder.status === "Paid" || selectedOrder.status === "Delivered"
                          ? "success"
                          : selectedOrder.status === "Awaiting Payment"
                          ? "warning"
                          : selectedOrder.status === "Cancelled"
                          ? "error"
                          : "primary"
                      }
                    >
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 block">
                  Order Items ({selectedOrder.items?.length || 0})
                </label>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </h4>
                          <span className="font-bold text-gray-900 dark:text-white">
                            ${item.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          {item.color_value && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600"
                                style={{
                                  backgroundColor: item.color_value.startsWith("#")
                                    ? item.color_value
                                    : item.color_value === "red"
                                    ? "#ff0000"
                                    : item.color_value,
                                }}
                              />
                              <span>{item.color || item.color_value}</span>
                            </div>
                          )}
                          <span>
                            <span className="font-medium">Quantity:</span> {item.quantity}
                          </span>
                          <span>
                            <span className="font-medium">Unit Price:</span> ${(item.amount / item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No items found</p>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Customer Information
                </label>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                  <p className="text-gray-800 dark:text-white">
                    <span className="font-medium">Name:</span> {selectedOrder.profile?.first_name || ""} {selectedOrder.profile?.last_name || ""}
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    <span className="font-medium">Email:</span> {selectedOrder.profile?.email || "N/A"}
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    <span className="font-medium">Mobile:</span> {selectedOrder.profile?.mobile_number || "N/A"}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Delivery Address
                </label>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-800 dark:text-white whitespace-pre-wrap break-words">
                    {selectedOrder.address || "N/A"}
                  </p>
                </div>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Total Amount
                  </label>
                  <p className="text-gray-800 dark:text-white font-bold text-lg mt-1">
                    ${selectedOrder.total_amount?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Order Date
                  </label>
                  <p className="text-gray-800 dark:text-white mt-1">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 block">
                  Payment Information
                </label>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method:</span>
                      <p className="text-gray-800 dark:text-white mt-1">
                        {selectedOrder.payment_method ? (
                          <span className="capitalize">{selectedOrder.payment_method.replace('_', ' ')}</span>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Transaction ID:</span>
                      <p className="text-gray-800 dark:text-white mt-1 font-mono text-sm">
                        {selectedOrder.transaction_id || "N/A"}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.payment_url && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment URL:</span>
                      <p className="text-gray-800 dark:text-white mt-1">
                        {paymentSignedUrls[selectedOrder.id || selectedOrder.order_number] ? (
                          <a
                            href={paymentSignedUrls[selectedOrder.id || selectedOrder.order_number]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline break-all"
                          >
                            {paymentSignedUrls[selectedOrder.id || selectedOrder.order_number]}
                          </a>
                        ) : (
                          <span className="text-gray-500">Generating link...</span>
                        )}
                      </p>
                    </div>
                  )}
                  {selectedOrder.delivery_charge !== undefined && selectedOrder.delivery_charge !== null && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivery Charge:</span>
                      <p className="text-gray-800 dark:text-white mt-1">
                        ${selectedOrder.delivery_charge.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedOrder(null);
                }}
              >
                <CloseLineIcon className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <div className="space-y-3">
        <ComponentCard>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-lg dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 dark:border-white/[0.05] dark:bg-gradient-to-r dark:from-gray-800/50 dark:to-gray-800/70">
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Order #
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Date
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
                      Items
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Total
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
                      Payment Method
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Transaction ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                    >
                      Payment URL
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
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 bg-white dark:divide-white/[0.05] dark:bg-transparent">
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell className="px-6 py-12 text-center" colSpan={12}>
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
                    const isExpanded = expandedOrders.has(order.order_number);
                    const items = order.items || [];
                    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

                    return (
                      <>
                      <TableRow
                          key={order.order_number || order.id || index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                          <TableCell className="px-5 py-4 text-start">
                          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {order.order_number}
                          </span>
                        </TableCell>
                          <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            <TimeIcon className="h-4 w-4" />
                            <span className="text-sm">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                          <TableCell className="px-5 py-4 text-start">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                              {order.profile?.first_name || ""} {order.profile?.last_name || ""}
                          </span>
                        </TableCell>
                          <TableCell className="px-5 py-4 text-start">
                            <button
                              onClick={() => toggleOrderExpansion(order.order_number)}
                              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUpIcon className="w-4 h-4" />
                              ) : (
                                <ChevronDownIcon className="w-4 h-4" />
                              )}
                              <span className="text-sm font-medium">
                                {items.length} {items.length === 1 ? "item" : "items"}
                          </span>
                            </button>
                        </TableCell>
                          <TableCell className="px-5 py-4 text-start">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            ${order.total_amount?.toFixed(2) || "0.00"}
                          </span>
                        </TableCell>
                          <TableCell className="px-5 py-4 text-start max-w-[200px]">
                            {order?.address ? (
                              <span
                                className="text-gray-700 dark:text-gray-300 truncate block cursor-pointer hover:text-gray-900 dark:hover:text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                  setShowDetailsModal(true);
                                }}
                                title={order.address}
                              >
                                {order.address.length > 30 
                                  ? `${order.address.substring(0, 30)}...` 
                                  : order.address}
                          </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">N/A</span>
                            )}
                        </TableCell>
                          <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 dark:text-gray-300">
                            {order?.profile?.mobile_number || "N/A"}
                          </span>
                        </TableCell>
                          <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {order?.payment_method ? (
                              <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">N/A</span>
                            )}
                          </span>
                        </TableCell>
                          <TableCell className="px-5 py-4 text-start max-w-[150px]">
                          {order?.transaction_id ? (
                            <span className="text-gray-700 dark:text-gray-300 text-sm font-mono truncate block" title={order.transaction_id}>
                              {order.transaction_id.length > 15 
                                ? `${order.transaction_id.substring(0, 15)}...` 
                                : order.transaction_id}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">N/A</span>
                          )}
                        </TableCell>
                          <TableCell className="px-5 py-4 text-start max-w-[150px]">
                          {order?.payment_url ? (
                            paymentSignedUrls[order.id || order.order_number] ? (
                              <a
                                href={paymentSignedUrls[order.id || order.order_number]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm truncate block underline"
                                title={order.payment_url}
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Payment
                              </a>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-sm">Loading...</span>
                            )
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">N/A</span>
                          )}
                        </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
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
                          >
                            {status}
                          </Badge>
                        </TableCell>
                          <TableCell className="px-5 py-4 text-end">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowDetailsModal(true);
                                }}
                                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                aria-label="View order details"
                                title="View order details"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowDetailsModal(true);
                                }}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                                aria-label="View order details"
                                title="View order details"
                              >
                                <BoxIcon className="w-4 h-4" />
                              </button>
                              <div className="relative min-w-[150px]">
                            <select
                              value={order.status_slug || ""}
                              onChange={(e) =>
                                updateOrderStatus(
                                      order.id || order.order_number,
                                  e.target.value,
                                  index
                                )
                              }
                              disabled={
                                    updatingStatus === (order.id || order.order_number)
                              }
                              className={cn(
                                    "appearance-none w-full px-3 py-2 text-sm",
                                "border border-gray-300 rounded-lg",
                                "bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white",
                                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                    "transition-colors"
                              )}
                            >
                              <option value="" disabled>
                                    Change Status
                              </option>
                              {statusOptions.map((option: any) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </option>
                              ))}
                            </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                                  <ChevronDownIcon className="w-4 h-4" />
                                </div>
                                {updatingStatus === (order.id || order.order_number) && (
                                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-blue-500 border-b-transparent"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* Expanded Items Row */}
                        {isExpanded && items.length > 0 && (
                          <TableRow className="bg-gray-50 dark:bg-gray-800/20">
                            <TableCell colSpan={12} className="px-5 py-4">
                              <div className="space-y-3">
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                  Order Items ({items.length})
                                </div>
                                <div className="space-y-2">
                                  {items.map((item, itemIndex) => (
                                    <div
                                      key={itemIndex}
                                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                    >
                                      <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-shrink-0 w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {itemIndex + 1}
                                          </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                                            {item.title}
                                          </h4>
                                          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                            {item.color_value && (
                                              <div className="flex items-center gap-1.5">
                                                <div
                                                  className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                                                  style={{
                                                    backgroundColor: item.color_value.startsWith("#")
                                                      ? item.color_value
                                                      : item.color_value === "red"
                                                      ? "#ff0000"
                                                      : item.color_value,
                                                  }}
                                                />
                                                <span>{item.color || item.color_value}</span>
                                              </div>
                                            )}
                                            <span>Qty: {item.quantity}</span>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-medium text-gray-900 dark:text-white">
                                            ${item.amount.toFixed(2)}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            ${(item.amount / item.quantity).toFixed(2)} each
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Total Items: {totalItems}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                      ${order.total_amount?.toFixed(2) || "0.00"}
                                    </div>
                                  </div>
                                </div>
                          </div>
                        </TableCell>
                      </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
        {totalOrders > 0 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              className={`px-3 py-1 border rounded text-sm ${
                page === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              disabled={page === 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>

            {Array.from(
              { length: Math.ceil(totalOrders / pageSize) },
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

            <button
              className={`px-3 py-1 border rounded text-sm ${
                page >= Math.ceil(totalOrders / pageSize)
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              disabled={page >= Math.ceil(totalOrders / pageSize) || loading}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>

            <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, totalOrders)} of {totalOrders} orders
            </span>
          </div>
        )}
      </div>
    </>
  );
}

