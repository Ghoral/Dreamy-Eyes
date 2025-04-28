import { useEffect, useState } from "react";
import DropzoneComponent from "../../components/form/form-elements/DropZone";
import ComponentCard from "../../components/common/ComponentCard";
import { supabaseClient } from "../../service/supabase";

const LandingForm = () => {
  const [logo, setLogo] = useState<any>([]);
  const [banner, setBanner] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkFileExists = async (url: string): Promise<boolean> => {
      try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok && response.status !== 404;
      } catch (error) {
        console.error("Error checking file existence:", error);
        return false;
      }
    };

    const loadFiles = async () => {
      setIsLoading(true);

      try {
        const files = ["logo.png", "banner.png"];
        const results = await Promise.all(
          files.map(async (filePath) => {
            const { data } = supabaseClient.storage
              .from("config")
              .getPublicUrl(filePath);

            const publicUrl = data.publicUrl;
            const exists = await checkFileExists(publicUrl);

            return {
              path: filePath,
              url: publicUrl,
              exists,
            };
          })
        );

        // Only set URLs for files that actually exist
        const logoFile = results.find((file) => file.path === "logo.png");
        if (logoFile && logoFile.exists) {
          setLogo([logoFile.url]);
        } else {
          setLogo([]);
        }

        const bannerFile = results.find((file) => file.path === "banner.png");
        if (bannerFile && bannerFile.exists) {
          setBanner([bannerFile.url]);
        } else {
          setBanner([]);
        }
      } catch (error) {
        console.error("Error loading files:", error);
        setLogo([]);
        setBanner([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFiles();
  }, []);

  const uploadLogo = async (files: File[]) => {
    if (!files || files.length === 0) {
      setLogo([]);
      return;
    }

    const fileToUpload = files[0];

    try {
      if (fileToUpload.name !== "logo.png") {
        console.error("File must be named logo.png");
        alert("Please upload a file named logo.png");
        return;
      }

      const { data, error } = await supabaseClient.storage
        .from("config")
        .upload("logo.png", fileToUpload, { upsert: true });

      if (error) {
        console.error("Error uploading logo:", error);
        return;
      }

      const { data: urlData } = supabaseClient.storage
        .from("config")
        .getPublicUrl("logo.png");

      setLogo([urlData.publicUrl]);
    } catch (error) {
      console.error("Error in logo upload process:", error);
    }
  };

  const uploadBanner = async (files: File[]) => {
    if (!files || files.length === 0) {
      setBanner([]);
      return;
    }

    const fileToUpload = files[0];

    try {
      if (fileToUpload.name !== "banner.png") {
        console.error("File must be named banner.png");
        alert("Please upload a file named banner.png");
        return;
      }

      const { data, error } = await supabaseClient.storage
        .from("config")
        .upload("banner.png", fileToUpload, { upsert: true });

      if (error) {
        console.error("Error uploading banner:", error);
        return;
      }

      const { data: urlData } = supabaseClient.storage
        .from("config")
        .getPublicUrl("banner.png");

      setBanner([urlData.publicUrl]);
    } catch (error) {
      console.error("Error in banner upload process:", error);
    }
  };

  return (
    <ComponentCard title="Dashboard">
      <div className="flex gap-2">
        <div className="w-full h-80">
          <DropzoneComponent
            file={logo}
            setFile={uploadLogo}
            title="Logo (must be named logo.png)"
            multiple={false}
          />
        </div>
        <div className="w-full h-80">
          <DropzoneComponent
            file={banner}
            setFile={uploadBanner}
            title="Banner (must be named banner.png)"
            multiple={false}
          />
        </div>
      </div>
      {isLoading && <div className="text-center mt-4">Loading files...</div>}
    </ComponentCard>
  );
};

export default LandingForm;
