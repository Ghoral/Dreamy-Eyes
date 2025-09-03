import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { Modal } from "../../components/ui/modal";
import { TrashBinIcon } from "../../icons";
import { supabaseClient } from "../../service/supabase";
import {
  showCustomToastSuccess,
  showCustomToastError,
} from "../../utils/toast";

type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
};

export default function Admins() {
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabaseClient.rpc("get_profiles_by_role", {
      p_role: "admin",
      p_limit: pageSize,
      p_page: page,
    });
    if (error) console.error("RPC error get_profiles_by_role", error);
    const rows = (data as Profile[]) || [];
    setAdmins(rows);
    setHasMore(rows.length === pageSize);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, [page]);

  const openConfirm = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setLoading(true);
    try {
      const { error } = await supabaseClient.functions.invoke("delete-user", {
        body: JSON.stringify({ user_id: pendingDeleteId }),
      });
      if (error) throw error as any;
      showCustomToastSuccess("User deleted successfully");
      await fetchAdmins();
    } catch (e) {
      showCustomToastError(e, "Failed to delete user");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  return (
    <ComponentCard title="Admins" desc="Manage admin accounts">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-3 pr-4">{p.email || "-"}</td>
                <td className="py-3 pr-4">
                  {[p.first_name, p.last_name].filter(Boolean).join(" ") || "-"}
                </td>
                <td className="py-3 pr-4">
                  <button
                    type="button"
                    onClick={() => openConfirm(p.id)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                    aria-label="Delete admin"
                    disabled={loading}
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && !loading && (
              <tr>
                <td className="py-6 text-gray-500" colSpan={4}>
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-center gap-2 mt-4">
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
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="p-6 w-[360px]">
          <h3 className="text-lg font-semibold mb-2">Delete admin</h3>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this admin? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded border"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50 flex items-center gap-2"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading && (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Yes, delete
            </button>
          </div>
        </div>
      </Modal>
    </ComponentCard>
  );
}
