import { useFormik } from "formik";
import ComponentCard from "../../components/common/ComponentCard";
import DropzoneComponent from "../../components/form/form-elements/DropZone";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Editor } from "@tinymce/tinymce-react";
import SpecificationsForm from "../Components/SpecificationForm";
import { IProduct } from "../../interface/product";
import { useEffect, useState } from "react";
import { supabaseClient } from "../../service/supabase";
import {
  showCustomToastError,
  showCustomToastSuccess,
} from "../../utils/toast";
import { useLocation } from "react-router";
import MultiColorSelector from "../../components/common/ColorPicker";
import { getColorFileNameMap } from "../../utils";
import Button from "../../components/common/Button";
import { productValidationSchema } from "../../validation/product";

const ProductForm = () => {
  const [specifications, setSpecifications] = useState<any>({});
  const [colorImageMap, setColorImageMap] = useState<any>({});
  const [updatedColorImageMap, setUpdateColorImageMap] = useState<any>({});
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [colorQuantities, setColorQuantities] = useState<{
    [color: string]: { quantity: string; label: string };
  }>({});
  const [dbColors, setDbColors] = useState<
    { id: string; name: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [primaryThumbnail, setPrimaryThumbnail] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
console.log('updatedColorImageMap',updatedColorImageMap);

  // Get product ID from URL if present
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const idFromUrl = params.get("id");

  useEffect(() => {
    fetchColors();

    if (idFromUrl) {
      setProductId(idFromUrl);
      setIsEditMode(true);
      fetchProductData(idFromUrl);
    }
  }, [idFromUrl]);

  const fetchColors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("colors")
        .select("id, name, value")
        .order("name");

      if (error) throw error;
      setDbColors(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Fetch product data by ID
  const fetchProductData = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient.rpc("get_product_by_id", {
        pid: id,
      });

      if (error) throw error;
      if (data) {
        const product = data;
        formik.setValues({
          title: product.title || "",
          sub_title: product.sub_title || "",
          description: product.description || "",
          images: [],
          price: product.price,
          power: product.power,
          color: [],
          color_quantity: [],
        });

        if (product.specifications) {
          const specs = product.specifications;
          const specArray = Object.keys(specs).map((key) => ({
            label: key,
            value: specs[key],
          }));

          setSpecifications({
            keyValuePairs: specs,
            specifications: specArray,
          });
        }

        if (product.images && product.color_quantity) {
          const images = product.images;
          const colorQuantity = product.color_quantity;

          // Convert image names into public URLs
          const imageUrlMap: Record<string, string[]> = {};

          for (const [color, imageList] of Object.entries(JSON.parse(images))) {
            const urls = (imageList as string[]).map((fileName) => {
              const { data } = supabaseClient.storage
                .from("product-image")
                .getPublicUrl(fileName);

              return data?.publicUrl || "";
            });
            // Filter out any URLs that are just 'http' strings or empty strings
            const filteredUrls = urls.filter(url => url !== "http" && url !== "");
            imageUrlMap[color] = filteredUrls;
          }

          const colors = colorQuantity.map((cq: any) => cq.color);
          let colorToSelect = colors[0];
          formik.setFieldValue("images", JSON.parse(images)[colorToSelect]);
          setColorImageMap(JSON.parse(images));
          formik.setFieldValue("color", colors);
          formik.setFieldValue("color_quantity", colorQuantity);

          const colorQuantitiesObj: {
            [color: string]: { quantity: string; label: string };
          } = {};
          colorQuantity.forEach((cq: any) => {
            colorQuantitiesObj[cq.color] = {
              quantity: cq.quantity.toString(),
              label: cq.label,
            };
          });

          setColorQuantities(colorQuantitiesObj);
          setUpdateColorImageMap(imageUrlMap);

          // Handle thumbnail

          if (product.primary_thumbnail) {
            setPrimaryThumbnail(product.primary_thumbnail);

            for (const [color, imageList] of Object.entries(imageUrlMap)) {
              if ((imageList as string[]).includes(product.primary_thumbnail)) {
                colorToSelect = color;
                break;
              }
            }
          }

          setSelectedColor(colorToSelect);
        }
      }
    } catch (error) {
      showCustomToastError(error, "Failed to load product data");
    } finally {
      setLoading(false);
    }
  };

  const formik: any = useFormik({
    initialValues: {
      title: "",
      sub_title: "",
      description: "",
      images: [],
      price: undefined,
      power: undefined,
      color: [],
      color_quantity: [],
    },
    validationSchema: productValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await onSubmit(values);
      } catch (error) {
        showCustomToastError(error, "Failed to save product");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const onSubmit = async (values: IProduct) => {
    try {
      const { color, ...rest } = values;

      // Validate: every selected color must have at least one image
      const missingImageColors = (values.color || []).filter(
        (c: string) =>
          !Array.isArray(colorImageMap[c]) || colorImageMap[c]?.length === 0
      );

      if (missingImageColors.length > 0) {
        const missingColorLabels = missingImageColors.map(
          (hex: any) => dbColors.find((clr) => clr.value === hex)?.name || hex
        );

        formik.setFieldError(
          "images",
          `Please upload at least one image for: ${missingColorLabels.join(
            ", "
          )}`
        );
        return;
      }

      const color_quantity = values.color_quantity;

      const body = {
        ...rest,
        images: getColorFileNameMap(colorImageMap),
        primary_thumbnail: primaryThumbnail,
        specifications: specifications.keyValuePairs,
        color_quantity: color_quantity,
      };

      if (isEditMode && productId) {
        const { data, error } = await supabaseClient.rpc("update_product", {
          _id: productId,
          _title: body.title,
          _sub_title: body.sub_title,
          _description: body.description,
          _images: body.images,
          _price: body.price,
          _power: body.power,
          _color_quantity: body.color_quantity,
          _specifications: body.specifications,
        });

        if (error) {
          console.error("RPC error:", error);
          throw error;
        }

        if (!data.success) {
          throw new Error(data.error || "Failed to update product");
        }

        showCustomToastSuccess(data.message || "Product updated successfully");
      } else {
        // Insert new product
        const { error } = await supabaseClient.from("products").insert(body);
        if (error) throw error;
        showCustomToastSuccess("Product created successfully");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      showCustomToastError(error.message || error, "Failed to save product");
    }
  };

  const handleImageChange = async (files: File[]) => {
    formik.setFieldValue("images", files);

    try {
      if (files?.length) {
        const fileToUpload = files[files.length - 1];
        const { error } = await supabaseClient.storage
          .from("product-image")
          .upload(fileToUpload.name, fileToUpload, { upsert: true });

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      showCustomToastError(error);
    }
  };

  const [uploading, setUploading] = useState(false);

  const handleImageChangeColor = async (files: File[]) => {
    try {
      setUploading(true);
      await handleImageChange(files);
      if (selectedColor) {
        // Handle new file uploads in colorImageMap
        setColorImageMap((prev: any) => {
          const existingFiles: File[] = prev[selectedColor] || [];

          const existingFileNames = new Set(
            existingFiles.map((file) => {
              return typeof file === "string" ? file : file.name;
            })
          );

          const newUniqueFiles = files.filter(
            (file) => !existingFileNames.has(file.name)
          );

          const updatedMap = {
            ...prev,
            [selectedColor]: [...existingFiles, ...newUniqueFiles],
          } as any;

          // If this is the first image for this color and no primary thumbnail is set,
          // or if the primary thumbnail was from this color but was removed,
          // set this as the primary thumbnail
          if (newUniqueFiles.length > 0) {
            const isFirstImageForColor = existingFiles.length === 0;
            const isPrimaryThumbnailMissing = !primaryThumbnail;
            const wasPrimaryThumbnailFromThisColor =
              primaryThumbnail &&
              existingFiles.length > 0 &&
              !existingFiles.some((file) => {
                const fileName = typeof file === "string" ? file : file.name;
                return fileName === primaryThumbnail;
              });

            if (
              isFirstImageForColor ||
              isPrimaryThumbnailMissing ||
              wasPrimaryThumbnailFromThisColor
            ) {
              const newPrimaryFile = newUniqueFiles[0];
              const newPrimaryFileName = newPrimaryFile.name;
              setPrimaryThumbnail(newPrimaryFileName);
            }
          }

          // Dynamic inline error: compute missing color images
          const missingImageColors = (formik.values.color || []).filter(
            (c: string) =>
              !Array.isArray(updatedMap[c]) || updatedMap[c]?.length === 0
          );

          if (missingImageColors.length > 0) {
            const missingColorLabels = missingImageColors.map(
              (hex: any) =>
                dbColors.find((clr) => clr.value === hex)?.name || hex
            );

            formik.setFieldError(
              "images",
              `Please upload at least one image for: ${missingColorLabels.join(
                ", "
              )}`
            );
          } else {
            formik.setFieldError("images", undefined as any);
          }
          
          // Update Formik state with the array of files for the current color
          formik.setFieldValue("images", updatedMap[selectedColor] || []);

          return updatedMap;
        });
        
        // In edit mode, also update the updatedColorImageMap for URL strings
        if (idFromUrl) {
          setUpdateColorImageMap((prev: any) => {
            // Get the public URLs for the new files
            const newUrls = files.map(file => {
              const { data } = supabaseClient.storage
                .from("product-image")
                .getPublicUrl(file.name);
              return data?.publicUrl || "";
            });
            
            // Filter out any URLs that are just 'http' strings
            const filteredNewUrls = newUrls.filter(url => url !== "http" && url !== "");
            
            // Combine with existing URLs for this color
            const existingUrls = prev[selectedColor] || [];
            // Filter out any existing URLs that are just 'http' strings
            const filteredExistingUrls = existingUrls.filter((url: string) => url !== "http" && url !== "");
            
            return {
              ...prev,
              [selectedColor]: [...filteredExistingUrls, ...filteredNewUrls]
            };
          });
        }
      } else {
        // If no color is selected, set an empty array
        formik.setFieldValue("images", []);
      }
    } catch (error) {
      showCustomToastError(error);
    } finally {
      setUploading(false);
    }
  };

  const handleEditorChange = (content: any) => {
    formik.setFieldValue("description", content);
  };

  // Unified function to update label or quantity AND sync to Formik's color_quantity
  const updateColorQuantity = (
    color: string,
    field: "label" | "quantity",
    value: string
  ) => {
    setColorQuantities((prev) => {
      const updated = {
        ...prev,
        [color]: {
          ...prev[color],
          [field]: value,
        },
      };

      // Sync to formik
      const color_quantity = Object.keys(updated).map((c) => ({
        color: c,
        quantity: updated[c]?.quantity || "0",
        label: updated[c]?.label || "",
      }));

      formik.setFieldValue("color_quantity", color_quantity);

      return updated;
    });
  };

  const handleColorChange = (colors: string[]) => {
    formik.setFieldValue("color", colors);

    // Set newest color selected
    if (colors.length > 0) {
      setSelectedColor(colors[colors.length - 1]);
    }

    // Initialize quantity and label for new colors
    colors.forEach((color) => {
      if (!(color in colorQuantities)) {
        const dbColorObj = dbColors.find((c) => c.value === color);
        setColorQuantities((prev) => {
          const updated = {
            ...prev,
            [color]: {
              quantity: "0",
              label: dbColorObj?.name || "", // map label from dbColors
            },
          };

          // Sync to formik on adding new color
          const color_quantity = Object.keys(updated).map((c) => ({
            color: c,
            quantity: updated[c]?.quantity || "0",
            label: updated[c]?.label || "",
          }));

          formik.setFieldValue("color_quantity", color_quantity);

          return updated;
        });
      }
    });

    // Remove quantities and labels for colors no longer selected
    setColorQuantities((prev) => {
      const newQuantities = { ...prev };
      Object.keys(newQuantities).forEach((color) => {
        if (!colors.includes(color)) {
          delete newQuantities[color];
        }
      });

      // Sync formik after removal too
      const color_quantity = Object.keys(newQuantities).map((c) => ({
        color: c,
        quantity: newQuantities[c]?.quantity || "0",
        label: newQuantities[c]?.label || "",
      }));
      formik.setFieldValue("color_quantity", color_quantity);

      return newQuantities;
    });

    // Recompute image validation dynamically for all selected colors
    const missingImageColors = (colors || []).filter(
      (c: string) =>
        !Array.isArray(colorImageMap[c]) || colorImageMap[c]?.length === 0
    );

    if (missingImageColors.length > 0) {
      const missingColorLabels = missingImageColors.map(
        (hex) => dbColors.find((clr) => clr.value === hex)?.name || hex
      );

      formik.setFieldError(
        "images",
        `Please upload at least one image for: ${missingColorLabels.join(", ")}`
      );
    } else {
      formik.setFieldError("images", undefined as any);
    }
  };

  const removeImageFromColor = (color: string, index: number) => {
    // Handle removal from colorImageMap (for new uploads)
    setColorImageMap((prev: any) => {
      const updatedFiles = [...(prev[color] || [])];
      if (index < 0 || index >= updatedFiles.length) {
        return prev;
      }

      const removedFile = updatedFiles[index];
      const removedFileName =
        typeof removedFile === "string" ? removedFile : removedFile.name;
      const isRemovingPrimaryThumbnail = primaryThumbnail === removedFileName;

      updatedFiles.splice(index, 1);

      if (isRemovingPrimaryThumbnail) {
        if (updatedFiles.length > 0) {
          const newPrimaryFile = updatedFiles[0];
          const newPrimaryFileName =
            typeof newPrimaryFile === "string"
              ? newPrimaryFile
              : newPrimaryFile.name;
          setPrimaryThumbnail(newPrimaryFileName);
        } else {
          const otherColorWithImages = Object.entries(prev)
            .filter(
              ([c, files]) =>
                c !== color && Array.isArray(files) && files.length > 0
            )
            .map(([c, files]) => ({ color: c, files: files as any[] }))[0];

          if (otherColorWithImages) {
            const newPrimaryFile = otherColorWithImages.files[0];
            const newPrimaryFileName =
              typeof newPrimaryFile === "string"
                ? newPrimaryFile
                : newPrimaryFile.name;
            setPrimaryThumbnail(newPrimaryFileName);

            setSelectedColor(otherColorWithImages.color);
          } else {
            setPrimaryThumbnail(null);
          }
        }
      }

      if (updatedFiles.length === 0) {
        const { [color]: _, ...rest } = prev;
        return rest;
      }
      const mappedValue = {
        ...prev,
        [color]: updatedFiles,
      };
      
      // Update Formik state with the array of files for the current color
      formik.setFieldValue("images", updatedFiles);
      return mappedValue;
    });
    
    // Also handle removal from updatedColorImageMap (for edit mode with URLs)
    if (idFromUrl) {
      setUpdateColorImageMap((prev: any) => {
        if (!prev[color] || !Array.isArray(prev[color])) return prev;
        
        const updatedUrls = [...prev[color]];
        if (index < 0 || index >= updatedUrls.length) return prev;
        
        updatedUrls.splice(index, 1);
        
        // Filter out any URLs that are just 'http' strings or empty strings
        const filteredUrls = updatedUrls.filter((url: string) => url !== "http" && url !== "");
        
        return {
          ...prev,
          [color]: filteredUrls
        };
      });
    }
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <ComponentCard title="Product">
        {/* Title */}
        <div className="mb-6">
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
          />
          {formik.touched.title && formik.errors.title && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.title}
            </div>
          )}
        </div>

        {/* Sub Title */}
        <div className="mb-6">
          <Label htmlFor="sub_title">Sub Title</Label>
          <Input
            type="text"
            id="sub_title"
            name="sub_title"
            value={formik.values.sub_title}
            onChange={formik.handleChange}
          />
          {formik.touched.sub_title && formik.errors.sub_title && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.sub_title}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <Label htmlFor="description">Description</Label>
          <Editor
            apiKey={import.meta.env.VITE_TINY_MCE!}
            value={formik.values.description}
            onEditorChange={handleEditorChange}
            init={{
              height: 300,
              menubar: false,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "code",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | formatselect | " +
                "bold italic backcolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
            onBlur={() => formik.setFieldTouched("description", true)}
          />
          {formik.touched.description && formik.errors.description && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.description}
            </div>
          )}
        </div>

        {/* Description Preview */}
        <div className="mb-6">
          <Label htmlFor="sub-description">Description Preview</Label>
          <div
            className="border p-4 rounded min-h-[150px]"
            dangerouslySetInnerHTML={{ __html: formik.values.description }}
          />
        </div>

        {/* Price */}
        <div className="mb-6">
          <Label htmlFor="price">Price</Label>
          <Input
            type="number"
            id="price"
            name="price"
            value={formik.values.price}
            onChange={formik.handleChange}
          />
          {formik.touched.price && formik.errors.price && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.price}
            </div>
          )}
        </div>

        {/* Power */}
        <div className="mb-6">
          <Label htmlFor="power">Power</Label>
          <Input
            type="number"
            id="power"
            name="power"
            value={formik.values.power}
            onChange={formik.handleChange}
          />
          {formik.touched.power && formik.errors.power && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.power}
            </div>
          )}
        </div>

        {/* Specification */}
        <div className="mb-6">
          <Label htmlFor="quantity">Specification</Label>
          <SpecificationsForm
            setSpecifications={setSpecifications}
            initialSpecifications={specifications.specifications || []}
          />
        </div>

        {/* Dropzone & Color Selector */}
        <div className="mb-6">
          <div className="mb-6">
            <MultiColorSelector
              dbColors={dbColors}
              isLoading={loading}
              disabled={
                !!!formik?.values?.images?.length ||
                formik.values.color.length === formik.values.images.length
              }
              onChange={handleColorChange}
              values={formik.values.color}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
            />
            {/* Color Quantities Section */}
            {selectedColor && formik.values.color.includes(selectedColor) && (
              <div className="mb-6" style={{ width: 200 }}>
                <Label>Selected Color</Label>
                <div className="space-y-4 mt-3">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: selectedColor }}
                    ></div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label htmlFor="color-quantity" className="text-sm">
                          Quantity
                        </Label>
                        <Input
                          type="number"
                          id="color-quantity"
                          name="color-quantity"
                          value={colorQuantities[selectedColor]?.quantity || ""}
                          onChange={(e) =>
                            updateColorQuantity(
                              selectedColor,
                              "quantity",
                              e.target.value
                            )
                          }
                          placeholder="Enter quantity"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {formik.errors.color_quantity &&
              Array.isArray(formik.errors.color_quantity) &&
              (() => {
                const firstError = formik.errors.color_quantity.find(
                  (error: any) => error?.quantity
                );
                return firstError ? (
                  <div className="text-red-500 text-sm">
                    {firstError.quantity}
                  </div>
                ) : null;
              })()}
          </div>
          <DropzoneComponent
            disabled={!selectedColor}
            bucket="product-image"
            file={
              selectedColor ? (
                !!idFromUrl && updatedColorImageMap[selectedColor] ? 
                  updatedColorImageMap[selectedColor] : 
                  colorImageMap[selectedColor] || []
              ) : []
            }
            setFile={handleImageChangeColor}
            title="Product Images"
            multiple
            uploading={uploading}
            onPrimaryChange={(name) => setPrimaryThumbnail(name)}
            setFieldValue={(index: number) =>
              removeImageFromColor(selectedColor ?? "", index)
            }
            onReorder={(items: any) => formik.setFieldValue("images", items)}
          />
          {!selectedColor && (
            <div className="text-red-500 text-sm mt-2 text-left">
              Please select a color from above to continue
            </div>
          )}
          {formik.errors.images && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.images}
            </div>
          )}
        </div>

        <Button onClick={formik.handleSubmit} loading={isLoading}>
          {isEditMode ? "Update Product" : "Save Product"}
        </Button>
      </ComponentCard>
    </form>
  );
};

export default ProductForm;
