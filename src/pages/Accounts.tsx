import { useEffect, useState } from "react";
import ComponentCard from "../components/common/ComponentCard";
import Button from "../components/common/Button";
import { supabaseClient } from "../service/supabase";
import { TrashBinIcon } from "../icons";
import { ActivityType, logActivity } from "../utils/activitylogger";

type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
};

export default function Accounts() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const fetchProfiles = async () => {
    setLoading(true);
    const { data } = await supabaseClient
      .from("profiles")
      .select("id,email,first_name,last_name,role")
      .order("created_at", { ascending: false });
    const all = (data || []) as Profile[];
    setUsers(all.filter((p) => p.role === "user"));
    setAdmins(all.filter((p) => p.role === "admin"));
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleDelete = async (id: string) => {
    setLoading(true);

    const userToDelete = [...users, ...admins].find((p) => p.id === id);
    await supabaseClient.from("profiles").delete().eq("id", id);

    await logActivity(ActivityType.USER_DELETE, "user", "User Management");

    await fetchProfiles();
  };

  const handleInviteAdmin = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseClient.from("profiles").insert({
        id: crypto.randomUUID(),
        email: invite.email,
        first_name: invite.first_name,
        last_name: invite.last_name,
        role: "admin",
      } as any);
      if (error) throw error;

      // Log admin invitation activity
      await logActivity(ActivityType.ADMIN_INVITE, "user", "User Management");

      setInvite({ first_name: "", last_name: "", email: "" });
      await fetchProfiles();
    } catch (e) {
      console.error("Invite admin error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title="Users & Admins">
      <div className="overflow-x-auto">
        <h3 className="font-semibold mb-2">Users</h3>
        <table className="min-w-full text-sm mb-8">
          <thead>
            <tr className="text-left border-b">
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-3 pr-4">{p.email || "-"}</td>
                <td className="py-3 pr-4">
                  {[p.first_name, p.last_name].filter(Boolean).join(" ") || "-"}
                </td>
                <td className="py-3 pr-4">
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                    aria-label="Delete user"
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr>
                <td className="py-6 text-gray-500" colSpan={4}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <h3 className="font-semibold mb-2">Admins</h3>
        <table className="min-w-full text-sm mb-8">
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
                    onClick={() => handleDelete(p.id)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                    aria-label="Delete admin"
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

        <div className="border rounded p-4">
          <h4 className="font-semibold mb-3">Invite Admin</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="First name"
              className="px-3 py-2 border rounded"
              value={invite.first_name}
              onChange={(e) =>
                setInvite({ ...invite, first_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Last name"
              className="px-3 py-2 border rounded"
              value={invite.last_name}
              onChange={(e) =>
                setInvite({ ...invite, last_name: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              className="px-3 py-2 border rounded"
              value={invite.email}
              onChange={(e) => setInvite({ ...invite, email: e.target.value })}
            />
          </div>
          <div className="mt-3">
            <Button onClick={handleInviteAdmin} loading={loading}>
              Invite
            </Button>
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
