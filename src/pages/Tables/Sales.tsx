import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { supabaseClient } from "../../service/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { PencilIcon, TrashBinIcon, TimeIcon } from "../../icons";
import { Modal } from "../../components/ui/modal";
import {
  showCustomToastError,
  showCustomToastSuccess,
} from "../../utils/toast";
import PermissionGate from "../../components/common/PermissionGate";
import { useUserRole } from "../../hooks/useUserRole";
import { ActivityType, logActivity } from "../../utils/activitylogger";

type Sale = {
  id: string;
  title: string;
  price: number;
  created_at: string;
};

export default function SalesTable() {
  const [rows, setRows] = useState<Sale[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const { isSuperAdmin } = useUserRole();

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data, error, count } = await supabaseClient
        .from("sales")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;

      setRows(data || []);
      setTotalSales(count || 0);
    } catch (e) {
      showCustomToastError(e, "Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page]);

  const openConfirm = (id: string) => {
    setPendingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingId) return;

    try {
      // Get sale details before deletion for logging
      const { data: saleData } = await supabaseClient
        .from("sales")
        .select("images")
        .eq("id", pendingId)
        .single();

      const { error } = await supabaseClient
        .from("sales")
        .delete()
        .eq("id", pendingId);

      if (error) {
        throw error;
      }

      // Delete images from storage if they exist
      if (saleData?.images) {
        try {
          const images = typeof saleData.images === 'string' 
            ? JSON.parse(saleData.images) 
            : saleData.images;
          
          const allImageFiles: string[] = [];
          Object.values(images).forEach((imageList: any) => {
            if (Array.isArray(imageList)) {
              allImageFiles.push(...imageList);
            }
          });

          if (allImageFiles.length > 0) {
            await supabaseClient.storage.from("product-image").remove(allImageFiles);
          }
        } catch (storageError) {
          console.error("Error deleting images from storage:", storageError);
        }
      }

      // Log sale deletion activity
      await logActivity(ActivityType.PRODUCT_DELETE, "sales", "Sales Form");

      showCustomToastSuccess("Sale deleted successfully");
      setRows((rows) => rows.filter((r) => r.id !== pendingId));
    } catch (e: any) {
      showCustomToastError(e.message || e, "Failed to delete sale");
    } finally {
      setConfirmOpen(false);
      setPendingId(null);
    }
  };

  return (
    <ComponentCard title="Sales" desc="Manage sales">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-lg dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 dark:border-white/[0.05] dark:bg-gradient-to-r dark:from-gray-800/50 dark:to-gray-800/70">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                >
                  Title
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                >
                  Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm tracking-wider dark:text-gray-300"
                >
                  Created
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-end text-sm tracking-wider dark:text-gray-300"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 bg-white dark:divide-white/[0.05] dark:bg-transparent">
              {rows.length === 0 && !loading && (
                <TableRow>
                  <TableCell className="px-5 py-8 text-center" colSpan={4}>
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                        <TimeIcon className="h-6 w-6 text-gray-500" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No sales found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {rows.map((sale) => (
                <TableRow
                  key={sale.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-200 hover:shadow-sm group"
                >
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {sale.title}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      ${sale.price?.toFixed(2) ?? "0.00"}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      <TimeIcon className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(sale.created_at).toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-end">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                        onClick={() =>
                          (window.location.href = `/form/sales?id=${sale.id}`)
                        }
                        aria-label="Edit sale"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <PermissionGate
                        fallback={
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed"
                            aria-label="Delete disabled for admin"
                            disabled
                          >
                            <TrashBinIcon className="w-4 h-4" />
                          </button>
                        }
                      >
                        <button
                          type="button"
                          onClick={() => openConfirm(sale.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          aria-label="Delete sale"
                        >
                          <TrashBinIcon className="w-4 h-4" />
                        </button>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalSales > 0 && (
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
            { length: Math.ceil(totalSales / pageSize) },
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
              page >= Math.ceil(totalSales / pageSize)
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            disabled={page >= Math.ceil(totalSales / pageSize) || loading}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>

          <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, totalSales)} of {totalSales} sales
          </span>
        </div>
      )}

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="p-6 w-[360px]">
          <h3 className="text-lg font-semibold mb-2">Delete sale</h3>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this sale? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded border"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-red-600 text-white"
              onClick={confirmDelete}
            >
              Yes, delete
            </button>
          </div>
        </div>
      </Modal>
    </ComponentCard>
  );
}

