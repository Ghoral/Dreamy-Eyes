import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";

const DropzoneComponent = ({
  title = "",
  file,
  setFile,
  multiple = false,
}: {
  title?: string;
  file?: File | string | null | (File | string)[];
  setFile?: any;
  multiple?: boolean;
}) => {
  const [previews, setPreviews] = useState<
    { id: string; url: string; file: File | string }[]
  >([]);

  useEffect(() => {
    // Clean up previous preview URLs
    previews.forEach((preview) => {
      if (preview.file instanceof File && preview.url.startsWith("blob:")) {
        URL.revokeObjectURL(preview.url);
      }
    });

    // Reset previews
    let newPreviews: { id: string; url: string; file: File | string }[] = [];

    if (multiple && Array.isArray(file)) {
      // Handle multiple files
      newPreviews = file.map((f) => {
        if (f instanceof File) {
          const previewUrl = URL.createObjectURL(f);
          return {
            id: `${f.name}-${Date.now() * Math.random()}`,
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
    } else if (!multiple && file && !Array.isArray(file)) {
      // Handle single file (original behavior)
      if (file instanceof File) {
        const previewUrl = URL.createObjectURL(file);
        newPreviews = [
          {
            id: `${file.name}-${Date.now()}`,
            url: previewUrl,
            file,
          },
        ];
      } else if (typeof file === "string") {
        newPreviews = [
          {
            id: `${file}-${Date.now()}`,
            url: file,
            file,
          },
        ];
      }
    }

    setPreviews(newPreviews);

    // Cleanup function
    return () => {
      newPreviews.forEach((preview) => {
        if (preview.file instanceof File && preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [file, multiple]);

  const onDrop = (acceptedFiles: File[]) => {
    if (multiple) {
      // Add new files to existing files
      const currentFiles = Array.isArray(file) ? file : [];
      setFile?.([...currentFiles, ...acceptedFiles]);
    } else {
      // Original behavior - just use the first file
      const selectedFile = acceptedFiles[0];
      setFile?.(selectedFile);
    }
  };

  const removeFile = (indexToRemove: number) => {
    if (multiple && Array.isArray(file)) {
      const newFiles = [...file];
      newFiles.splice(indexToRemove, 1);
      setFile?.(newFiles);
    } else {
      // Original behavior for single file
      if (previews[0]?.url.startsWith("blob:")) {
        URL.revokeObjectURL(previews[0].url);
      }
      setFile?.(null);
    }
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

  // Determine the UI to show based on mode and whether files exist
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

      {/* Multiple file preview grid */}
      {showMultiplePreviews && (
        <div className="p-5 border-t border-gray-300 dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={preview.id} className="relative group">
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
