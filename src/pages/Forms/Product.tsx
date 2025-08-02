import { useFormik } from "formik";
import ComponentCard from "../../components/common/ComponentCard";
import DropzoneComponent from "../../components/form/form-elements/DropZone";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Editor } from "@tinymce/tinymce-react";
import SpecificationsForm from "../Components/SpecificationForm";
import { IProduct } from "../../interface/product";
import { productValidationSchema } from "../../validation/product";
import { useState } from "react";
import { supabaseClient } from "../../service/supabase";
import { showCustomToastError } from "../../utils/toast";
import MultiColorSelector from "../../components/common/ColorPicker";
import { getColorFileNameMap } from "../../utils";
import Button from "../../components/common/Button";

const ProductForm = () => {
  const [specifications, setSpecifications] = useState<any>({});
  const [colorImageMap, setColorImageMap] = useState<any>({});
  const [selectedColor, setSelectedColor] = useState<string>("#2563eb");
  const [colorQuantities, setColorQuantities] = useState<{
    [color: string]: { quantity: string; label: string };
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const formik: any = useFormik({
    initialValues: {
      title: "",
      sub_title: "",
      description: "",
      images: [],
      price: undefined,
      quantity: undefined,
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
      } finally {
        setIsLoading(false);
      }
    },
  });

  const onSubmit = async (values: IProduct) => {
    try {
      const { color, ...rest } = values;

      const color_quantity = values.color_quantity;

      const body = {
        ...rest,
        images: getColorFileNameMap(colorImageMap),
        specifications: specifications.keyValuePairs,
        color_quantity: color_quantity,
      };

      await supabaseClient.from("product").insert(body);
    } catch (error) {}
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

  const handleImageChangeColor = async (files: File[]) => {
    try {
      await handleImageChange(files);
      if (selectedColor) {
        setColorImageMap((prev: any) => {
          const existingFiles: File[] = prev[selectedColor] || [];

          const existingFileNames = new Set(
            existingFiles.map((file) => file.name)
          );

          const newUniqueFiles = files.filter(
            (file) => !existingFileNames.has(file.name)
          );

          return {
            ...prev,
            [selectedColor]: [...existingFiles, ...newUniqueFiles],
          };
        });
      }
    } catch (error) {
      showCustomToastError(error);
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
        setColorQuantities((prev) => {
          const updated = {
            ...prev,
            [color]: { quantity: "0", label: "" },
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
  };

  const removeImageFromColor = (color: string, index: number) => {
    setColorImageMap((prev: any) => {
      const updatedFiles = [...(prev[color] || [])];
      if (index < 0 || index >= updatedFiles.length) {
        return prev;
      }
      updatedFiles.splice(index, 1);

      if (updatedFiles.length === 0) {
        const { [color]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [color]: updatedFiles,
      };
    });
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

        {/* Quantity */}
        <div className="mb-6">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            type="number"
            id="quantity"
            name="quantity"
            value={formik.values.quantity}
            onChange={formik.handleChange}
          />
          {formik.touched.quantity && formik.errors.quantity && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.quantity}
            </div>
          )}
        </div>

        {/* Specification */}
        <div className="mb-6">
          <Label htmlFor="quantity">Specification</Label>
          <SpecificationsForm setSpecifications={setSpecifications} />
        </div>

        {/* Dropzone & Color Selector */}
        <div className="mb-6">
          <DropzoneComponent
            bucket="product-image"
            file={colorImageMap[selectedColor]}
            setFile={handleImageChangeColor}
            title="Product Images"
            multiple
            setFieldValue={(index: number) =>
              removeImageFromColor(selectedColor, index)
            }
            onReorder={(items: any) => formik.setFieldValue("images", items)}
          />
          {formik.touched.images && formik.errors.images && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.images}
            </div>
          )}
          <MultiColorSelector
            disabled={
              !!!formik?.values?.images?.length ||
              formik.values.color.length === formik.values.images.length
            }
            onChange={handleColorChange}
            values={formik.values.color}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        </div>

        {/* Color Quantities Section */}
        {selectedColor && formik.values.color.includes(selectedColor) && (
          <div className="mb-6" style={{ width: 200 }}>
            <Label>Color Quantities for Selected Color</Label>
            <div className="space-y-4 mt-3">
              <div className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: selectedColor }}
                ></div>
                <div className="flex-1 space-y-2">
                  <div>
                    <Label htmlFor="color-label" className="text-sm">
                      Color Name
                    </Label>
                    <Input
                      type="text"
                      id="color-label"
                      name="color-label"
                      value={colorQuantities[selectedColor]?.label || ""}
                      onChange={(e) =>
                        updateColorQuantity(
                          selectedColor,
                          "label",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Red"
                    />
                    {/* Show validation error for label */}
                    {formik.errors.color_quantity &&
                      Array.isArray(formik.errors.color_quantity) &&
                      formik.errors.color_quantity[
                        formik.values.color.indexOf(selectedColor)
                      ]?.label && (
                        <div className="text-red-500 text-sm mt-1">
                          {
                            formik.errors.color_quantity[
                              formik.values.color.indexOf(selectedColor)
                            ].label
                          }
                        </div>
                      )}
                  </div>

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
                    {/* Show validation error for quantity */}
                    {formik.errors.color_quantity &&
                      Array.isArray(formik.errors.color_quantity) &&
                      formik.errors.color_quantity[
                        formik.values.color.indexOf(selectedColor)
                      ]?.quantity && (
                        <div className="text-red-500 text-sm mt-1">
                          {
                            formik.errors.color_quantity[
                              formik.values.color.indexOf(selectedColor)
                            ].quantity
                          }
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <Button onClick={formik.handleSubmit} loading={isLoading}>
          Save Product
        </Button>
      </ComponentCard>
    </form>
  );
};

export default ProductForm;
