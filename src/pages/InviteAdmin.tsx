import { useState } from "react";
import ComponentCard from "../components/common/ComponentCard";
import Button from "../components/common/Button";
import { showCustomToastError, showCustomToastSuccess } from "../utils/toast";
import { supabaseClient } from "../service/supabase";
import { appStore } from "../store";

export default function InviteAdmin() {
  const { userData } = appStore();
  const role = userData?.role || "user";
  const [invite, setInvite] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInviteAdmin = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseClient.functions.invoke("create-admin", {
        body: JSON.stringify({ data: invite }),
      });

      if (error) throw error;
      showCustomToastSuccess("Invite email sent (if not existing)");
      setInvite({ first_name: "", last_name: "", email: "" });
    } catch (e) {
      showCustomToastError(e, "Failed to invite admin");
    } finally {
      setLoading(false);
    }
  };

  if (role !== "super_admin") {
    return null;
  }

  return (
    <ComponentCard title="Invite Admin" desc="Invite a new admin by email">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="First name"
          className="px-3 py-2 border rounded"
          value={invite.first_name}
          onChange={(e) => setInvite({ ...invite, first_name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Last name"
          className="px-3 py-2 border rounded"
          value={invite.last_name}
          onChange={(e) => setInvite({ ...invite, last_name: e.target.value })}
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
    </ComponentCard>
  );
}
