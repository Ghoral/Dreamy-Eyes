import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Button from "../../components/common/Button";
import { supabaseClient } from "../../service/supabase";
import {
  showCustomToastError,
  showCustomToastSuccess,
} from "../../utils/toast";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const email = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("email");
    return raw ? decodeURIComponent(raw) : "";
  }, [location.search]);

  const handleSubmit = async () => {
    if (!password || password.length < 6) {
      showCustomToastError({
        message: "Password must be at least 6 characters",
      });
      return;
    }
    if (password !== confirmPassword) {
      showCustomToastError({ message: "Passwords do not match" });
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabaseClient.auth.updateUser({ password });
      if (error) throw error;
      showCustomToastSuccess("Password updated successfully");
      await supabaseClient.auth.signOut();
      navigate("/signin");
    } catch (e) {
      showCustomToastError(e, "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <ComponentCard title="Dreamy Eyes Admin" desc="Set your new password">
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <Input type="email" value={email} disabled />
          </div>
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e: any) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <Button onClick={handleSubmit} loading={loading}>
            Set Password
          </Button>
        </div>
      </ComponentCard>
    </div>
  );
}
