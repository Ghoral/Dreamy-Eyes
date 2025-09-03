import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";
import { supabaseClient } from "../../../service/supabase";
import { TrashBinIcon } from "../../../icons";

const DropzoneComponent = ({
  bucket = "config",
  title = "",
  file,
  setFile,
  multiple = false,
  onReorder,
  setFieldValue = () => {},
  uploading = false,
  disabled = false, // New prop to control disabled state
  primaryIndex,
  onPrimaryChange,
}: {
  bucket?: string;
  title?: string;
  file?: any;
  setFile?: any;
  multiple?: boolean;
  onReorder?: (files: any[]) => void;
  setFieldValue?: (index: number) => void;
  uploading?: boolean;
  disabled?: boolean; // Add disabled prop type
  primaryIndex?: number;
  onPrimaryChange?: (fileName: string) => void;
}) => {
  const [previews, setPreviews] = useState<
    { id: string; url: string; file: File | string }[]
  >([]);
  const [removing, setRemoving] = useState(false);
  const [localPrimary, setLocalPrimary] = useState<number | null>(null);

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

    // Initialize primary selection
    if (newPreviews.length > 0) {
      const initIdx = typeof primaryIndex === "number" ? primaryIndex : 0;
      setLocalPrimary(initIdx);
      const f: any = newPreviews[initIdx]?.file;
      const name = f?.name ?? (typeof f === "string" ? f : "");
      onPrimaryChange?.(name);
    } else {
      setLocalPrimary(null);
    }

    return () => {
      newPreviews.forEach((preview) => {
        if (preview.file instanceof File && preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [file, multiple]);

  const onDrop = (acceptedFiles: File[]) => {
    if (disabled) return; // Prevent drop when disabled

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
    if (disabled) return; // Prevent removal when disabled

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
    disabled, // Pass disabled state to useDropzone
  });

  const reorderPreviews = (startIndex: number, endIndex: number) => {
    if (disabled) return; // Prevent reordering when disabled

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
    <div
      className={`transition border border-gray-300 border-dashed dark:border-gray-700 rounded-xl hover:border-brand-500 relative ${
        disabled
          ? "bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed"
          : "bg-gray-50 dark:bg-gray-900"
      }`}
    >
      {showDropzone && (
        <form
          {...getRootProps()}
          className={`dropzone p-7 lg:p-10 text-center ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          } ${
            isDragActive && !disabled
              ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
              : ""
          }`}
          id="demo-upload"
        >
          <input {...getInputProps()} disabled={disabled} />
          <div className="dz-message flex flex-col items-center">
            <div className="mb-3 flex justify-center">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${
                  disabled
                    ? "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-600"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                </svg>
              </div>
            </div>
            <h4
              className={`mb-1 font-semibold text-base ${
                disabled
                  ? "text-gray-500 dark:text-gray-600"
                  : "text-gray-800 dark:text-white/90"
              }`}
            >
              {disabled ? "Please select a color first" : title}
            </h4>
            <span
              className={`text-xs mb-2 block ${
                disabled
                  ? "text-gray-400 dark:text-gray-600"
                  : "text-gray-700 dark:text-gray-400"
              }`}
            >
              {disabled
                ? "Color selection required to upload images"
                : "Drag & drop images here, or click to browse"}
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
            disabled={disabled}
            className={`absolute top-2 right-2 border border-gray-300 dark:border-gray-600 rounded-full w-7 h-7 flex items-center justify-center shadow transition ${
              disabled
                ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-red-500 hover:text-white"
            }`}
            aria-label="Remove image"
          >
            ✕
          </button>
          <img
            src={previews[0]?.url}
            alt="Uploaded preview"
            className={`w-full max-h-[400px] object-contain rounded-xl ${
              disabled ? "opacity-50" : ""
            }`}
          />
        </div>
      )}

      {showMultiplePreviews && (
        <div className="p-5 border-t border-gray-300 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div
                key={preview.id}
                className={`relative border rounded p-3 flex flex-col gap-3 ${
                  disabled ? "opacity-50" : ""
                }`}
                draggable={!disabled}
                onDragStart={(e) => {
                  if (disabled) {
                    e.preventDefault();
                    return;
                  }
                  e.dataTransfer.setData("text/plain", index.toString());
                }}
                onDragOver={(e) => {
                  if (!disabled) e.preventDefault();
                }}
                onDrop={(e) => {
                  if (disabled) return;
                  const startIndex = Number(
                    e.dataTransfer.getData("text/plain")
                  );
                  reorderPreviews(startIndex, index);
                }}
              >
                {(uploading || removing) && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center rounded z-10">
                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <img
                  src={preview.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-40 object-contain rounded"
                />

                {multiple && (
                  <div className="absolute top-2 left-2">
                    <label className="inline-flex items-center gap-1 text-[11px] bg-white/85 dark:bg-gray-800/80 px-2 py-1 rounded shadow">
                      <input
                        type="radio"
                        name="primary-thumbnail"
                        checked={
                          (typeof primaryIndex === "number"
                            ? primaryIndex
                            : localPrimary) === index
                        }
                        onChange={() => {
                          setLocalPrimary(index);
                          const f: any = previews[index]?.file;
                          const name =
                            f?.name ?? (typeof f === "string" ? f : "");
                          onPrimaryChange?.(name);
                        }}
                        disabled={disabled}
                      />
                      Primary
                    </label>
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                      disabled
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                    aria-label="Delete image"
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropzoneComponent;
