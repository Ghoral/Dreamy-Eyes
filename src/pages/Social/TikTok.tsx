import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/common/Button";
import { supabaseClient } from "../../service/supabase";
import {
  showCustomToastError,
  showCustomToastSuccess,
} from "../../utils/toast";

export default function TikTok() {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabaseClient
          .from("slug")
          .select("value")
          .eq("name", "tiktok")
          .single();
        setLink((data as any)?.value || "");
      } catch (e) {}
    };
    load();
  }, []);

  const save = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseClient
        .from("slug")
        .upsert({ name: "tiktok", value: link });
      if (error) throw error;
      showCustomToastSuccess("TikTok link updated");
    } catch (e) {
      showCustomToastError(e, "Failed to save link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title="Social Media" desc="TikTok profile link">
      <div className="max-w-lg space-y-3">
        <Label htmlFor="tiktok">TikTok Link</Label>
        <Input
          id="tiktok"
          name="tiktok"
          type="url"
          placeholder="https://www.tiktok.com/@your_handle"
          value={link}
          onChange={(e: any) => setLink(e.target.value)}
        />
        <Button onClick={save} loading={loading}>
          Save
        </Button>
      </div>
    </ComponentCard>
  );
}

