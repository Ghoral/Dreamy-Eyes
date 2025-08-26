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
import { PencilIcon, TrashBinIcon } from "../../icons";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/common/Button";
import {
  showCustomToastError,
  showCustomToastSuccess,
} from "../../utils/toast";

type Product = {
  id: string;
  title: string;
  price: number;
  updated_at: string;
};

export default function ProductsTable() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      console.log("data", data);

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
      const { error } = await supabaseClient
        .from("products")
        .delete()
        .eq("id", pendingId);
      if (error) throw error;
      showCustomToastSuccess("Product deleted successfully");
      await fetchProducts();
    } catch (e) {
      showCustomToastError(e, "Failed to delete product");
    } finally {
      setConfirmOpen(false);
      setPendingId(null);
    }
  };

  return (
    <ComponentCard title="Products" desc="Manage products">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                >
                  Title
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                >
                  Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                >
                  Updated
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-end text-theme-xs"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {rows.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-5 py-6 text-center text-gray-500"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="px-5 py-4 text-start">
                    {p.title}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    ${p.price?.toFixed(2) ?? "0.00"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    {new Date(p.updated_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-end">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          (window.location.href = `/form/product?id=${p.id}`)
                        }
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => openConfirm(p.id)}
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </Button>
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
