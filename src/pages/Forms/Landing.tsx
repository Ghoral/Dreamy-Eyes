import { useEffect, useState } from "react";
import DropzoneComponent from "../../components/form/form-elements/DropZone";
import ComponentCard from "../../components/common/ComponentCard";
import { TrashBinIcon } from "../../icons";
import { supabaseClient } from "../../service/supabase";

type BannerItem = { url: string; originalPath: string };

const LandingForm = () => {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    const loadBanners = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabaseClient.storage
          .from("banner")
          .list(undefined, { limit: 100 });
        if (error) throw error;
        const items: BannerItem[] = [];
        console.log("data", data);

        for (const f of data || []) {
          if (!f.name) continue;
          const { data: urlData } = supabaseClient.storage
            .from("banner")
            .getPublicUrl(f.name);
          items.push({ url: urlData.publicUrl, originalPath: f.name });
        }
        setBanners(items);
      } catch (e) {
        console.error("Error loading banners", e);
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBanners();
  }, []);

  const uploadBanners = async (files: File[]) => {
    if (!files || files.length === 0) return;
    try {
      setIsUploading(true);
      for (const file of files) {
        const { error } = await supabaseClient.storage
          .from("banner")
          .upload(file.name, file, { upsert: true });
        if (error) throw error;
      }
      // refresh list
      const { data } = await supabaseClient.storage
        .from("banner")
        .list(undefined, { limit: 100 });
      const items: BannerItem[] = [];
      for (const f of data || []) {
        if (!f.name) continue;
        const { data: urlData } = supabaseClient.storage
          .from("banner")
          .getPublicUrl(f.name);
        items.push({ url: urlData.publicUrl, originalPath: f.name });
      }
      setBanners(items);
    } catch (e) {
      console.error("Upload error", e);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteBanner = async (originalPath: string) => {
    try {
      const { error } = await supabaseClient.storage
        .from("banner")
        .remove([originalPath]);
      if (error) throw error;
      setBanners((prev) => prev.filter((b) => b.originalPath !== originalPath));
    } catch (e) {
      console.error("Delete error", e);
    }
  };

  return (
    <ComponentCard title="Landing Banners">
      <div className="w-full">
        <DropzoneComponent
          file={[]}
          setFile={uploadBanners}
          title="Upload banners"
          multiple={true}
          uploading={isUploading}
        />
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Image size should be 1920 width and 500
            height (1920×500) for optimal display.
          </p>
        </div>
      </div>
      {isLoading && <div className="text-center mt-4">Loading banners...</div>}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((item) => (
          <div
            key={item.originalPath}
            className="border rounded p-3 flex flex-col gap-3"
          >
            <img
              src={item.url}
              alt="Banner"
              className="w-full h-40 object-cover rounded"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => deleteBanner(item.originalPath)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Delete banner"
                title="Delete banner"
              >
                <TrashBinIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {!isLoading && banners.length === 0 && (
          <div className="text-gray-500">No banners uploaded yet.</div>
        )}
      </div>
    </ComponentCard>
  );
};

export default LandingForm;
