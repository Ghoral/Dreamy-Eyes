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

type Product = {
  id: string;
  title: string;
  price: number;
  updated_at: string;
  created_at: string;
};

export default function ProductsTable() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { isSuperAdmin } = useUserRole();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient.rpc("get_products");

      if (error) throw error;

      setRows((data as any) || []);
    } catch (e) {
      showCustomToastError(e, "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openConfirm = (id: string) => {
    setPendingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingId) return;

    try {
      // Get product details before deletion for logging

      const { data, error } = await supabaseClient.rpc("delete_product", {
        _product_id: pendingId,
      });

      if (error) {
        throw error;
      }

      const imagesToDelete: string[] = data.images_to_delete || [];

      await supabaseClient.storage.from("product-image").remove(imagesToDelete);

      // Log product deletion activity
      await logActivity(ActivityType.PRODUCT_DELETE, "product", "Product Form");

      showCustomToastSuccess(data.message || "Product deleted successfully");
      setRows((rows) => rows.filter((r) => r.id !== pendingId));
    } catch (e: any) {
      showCustomToastError(e.message || e, "Failed to delete product");
    } finally {
      setConfirmOpen(false);
      setPendingId(null);
    }
  };

  return (
    <ComponentCard title="Products" desc="Manage products">
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
                        No products found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {rows.map((p) => (
                <TableRow key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all duration-200 hover:shadow-sm group">
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {p.title}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      ${p.price?.toFixed(2) ?? "0.00"}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      <TimeIcon className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(p.created_at).toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-end">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                        onClick={() =>
                          (window.location.href = `/form/product?id=${p.id}`)
                        }
                        aria-label="Edit product"
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
                          onClick={() => openConfirm(p.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          aria-label="Delete product"
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

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="p-6 w-[360px]">
          <h3 className="text-lg font-semibold mb-2">Delete product</h3>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this product? This action cannot be
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
