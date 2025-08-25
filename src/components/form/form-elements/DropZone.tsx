import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";
import { supabaseClient } from "../../../service/supabase";

const DropzoneComponent = ({
  bucket = "config",
  title = "",
  file,
  setFile,
  multiple = false,
  onReorder,
  setFieldValue = () => {},
  uploading = false,
}: {
  bucket?: string;
  title?: string;
  file?: any;
  setFile?: any;
  multiple?: boolean;
  onReorder?: (files: any[]) => void;
  setFieldValue?: (index: number) => void;
  uploading?: boolean;
}) => {
  const [previews, setPreviews] = useState<
    { id: string; url: string; file: File | string }[]
  >([]);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    previews.forEach((preview) => {
      if (preview.file instanceof File && preview.url.startsWith("blob:")) {
        URL.revokeObjectURL(preview.url);
      }
    });

    let newPreviews: { id: string; url: string; file: File | string }[] = [];

    if (multiple && Array.isArray(file)) {
      newPreviews = file.map((f) => {
        if (f instanceof File) {
          const previewUrl = URL.createObjectURL(f);
          return {
            id: `${f?.name}-${Date.now() * Math.random()}`,
            url: previewUrl,
            file: f,
          };
        } else {
          return {
            id: `${f}-${Date.now() * Math.random()}`,
            url: f as string,
            file: f,
          };
        }
      });
    } else if (!multiple && Array.isArray(file)) {
      newPreviews = file.map((f: any) => {
        if (f instanceof File) {
          const previewUrl = URL.createObjectURL(f);
          return {
            id: `${f?.name}-${Date.now() * Math.random()}`,
            url: previewUrl,
            file: f,
          };
        } else {
          return {
            id: `${f}-${Date.now() * Math.random()}`,
            url: f as string,
            file: f,
          };
        }
      });
    }

    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((preview) => {
        if (preview.file instanceof File && preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [file, multiple]);

  const onDrop = (acceptedFiles: File[]) => {
    const filesWithTimestamp = acceptedFiles.map((file) => {
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const newFileName = `${fileName}_${timestamp}.${fileExtension}`;

      return new File([file], newFileName, { type: file.type });
    });

    if (multiple) {
      const currentFiles = Array.isArray(file) ? file : [];
      setFile?.([...currentFiles, ...filesWithTimestamp]);
    } else {
      setFile?.([filesWithTimestamp[0]]);
    }
  };

  const removeFile = async (indexToRemove: number) => {
    const fileToRemove = file[indexToRemove];

    try {
      setRemoving(true);
      const { error } = await supabaseClient.storage
        .from(bucket)
        .remove([fileToRemove.name]);

      if (error) {
        console.error("Error removing file from storage:", error);
      }
    } catch (err) {
      console.error("Failed to remove file from storage:", err);
    } finally {
      setRemoving(false);
    }

    const newFiles = [...file];
    newFiles.splice(indexToRemove, 1);
    setFile?.(newFiles);
    setFieldValue(indexToRemove);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
    multiple,
  });

  const reorderPreviews = (startIndex: number, endIndex: number) => {
    const result = Array.from(previews);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    setPreviews(result);

    if (onReorder) {
      const reorderedFiles = result.map((preview) => preview.file);
      onReorder(reorderedFiles);
    }
  };

  const showDropzone = multiple || previews.length === 0;
  const showSinglePreview = !multiple && previews.length > 0;
  const showMultiplePreviews = multiple && previews.length > 0;

  return (
    <div className="transition border border-gray-300 border-dashed dark:border-gray-700 rounded-xl hover:border-brand-500 relative bg-gray-50 dark:bg-gray-900">
      {showDropzone && (
        <form
          {...getRootProps()}
          className={`dropzone p-7 lg:p-10 text-center cursor-pointer
              ${
                isDragActive
                  ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                  : ""
              }
            `}
          id="demo-upload"
        >
          <input {...getInputProps()} />
          <div className="dz-message flex flex-col items-center">
            <div className="mb-[22px] flex justify-center">
              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                <svg
                  className="fill-current"
                  width="29"
                  height="28"
                  viewBox="0 0 29 28"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                  />
                </svg>
              </div>
            </div>
            <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
              {title}
            </h4>
            <span className="text-sm text-gray-700 dark:text-gray-400 mb-5 block">
              Drag and drop your PNG, JPG, WebP, SVG images here or browse
            </span>
            <span className="font-medium underline text-theme-sm text-brand-500">
              Browse File{multiple ? "s" : ""}
            </span>
          </div>
        </form>
      )}
      {(uploading || removing) && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl">
          <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Single file preview (original behavior) */}
      {showSinglePreview && (
        <div className="relative w-full">
          <button
            onClick={() => removeFile(0)}
            className="absolute top-2 right-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-red-500 hover:text-white transition"
            aria-label="Remove image"
          >
            ✕
          </button>
          <img
            src={previews[0]?.url}
            alt="Uploaded preview"
            className="w-full max-h-[400px] object-contain rounded-xl"
          />
        </div>
      )}

      {showMultiplePreviews && (
        <div className="p-5 border-t border-gray-300 dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div
                key={preview.id}
                className="relative group"
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("text/plain", index.toString())
                }
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const startIndex = Number(
                    e.dataTransfer.getData("text/plain")
                  );
                  reorderPreviews(startIndex, index);
                }}
              >
                {(uploading || removing) && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg z-10">
                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-red-500 hover:text-white transition"
                  aria-label="Remove image"
                >
                  ✕
                </button>
                <img
                  src={preview.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropzoneComponent;
