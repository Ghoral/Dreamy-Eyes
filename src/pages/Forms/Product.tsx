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

const ProductForm = () => {
  const [specifications, setSpecifications] = useState<any>({});
  const [colorImageMap, setColorImageMap] = useState<any>({});
  const [selectedColor, setSelectedColor] = useState<string>("#2563eb");
  const [colorQuantities, setColorQuantities] = useState<{
    [color: string]: { quantity: string; label: string };
  }>({});

  const formik = useFormik({
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
    onSubmit: (values: IProduct) => {
      onSubmit(values);
    },
  });

  const onSubmit = async (values: IProduct) => {
    const { color, ...rest } = values;

    const color_quantity = values.color.map((colorValue) => ({
      color: colorValue,
      quantity: colorQuantities[colorValue]?.quantity || "0",
      label: colorQuantities[colorValue]?.label || colorValue,
    }));

    const body = {
      ...rest,
      images: getColorFileNameMap(colorImageMap),
      specifications: specifications.keyValuePairs,
      color_quantity: color_quantity,
    };
    console.log("mogo nooo");
    console.log("Submitting:", body); // Debug log
    await supabaseClient.from("product").insert(body);
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

  const handleColorQuantityChange = (color: string, quantity: string) => {
    setColorQuantities((prev) => ({
      ...prev,
      [color]: {
        ...prev[color],
        quantity,
      },
    }));
  };

  const handleColorLabelChange = (color: string, label: string) => {
    setColorQuantities((prev) => ({
      ...prev,
      [color]: {
        ...prev[color],
        label,
      },
    }));
  };

  const handleColorChange = (colors: string[]) => {
    formik.setFieldValue("color", colors);

    // Set the newest color as selected
    if (colors.length > 0) {
      setSelectedColor(colors[colors.length - 1]);
    }

    // Initialize quantity and label for new colors
    colors.forEach((color) => {
      if (!(color in colorQuantities)) {
        setColorQuantities((prev) => ({
          ...prev,
          [color]: { quantity: "0", label: color },
        }));
      }
    });

    // Remove quantities and labels for colors that are no longer selected
    setColorQuantities((prev) => {
      const newQuantities = { ...prev };
      Object.keys(newQuantities).forEach((color) => {
        if (!colors.includes(color)) {
          delete newQuantities[color];
        }
      });
      return newQuantities;
    });
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <ComponentCard title="Product">
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
        <div className="mb-6">
          <Label htmlFor="title">Sub Title</Label>
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
        <div className="mb-6">
          <Label htmlFor="sub-description">Description Preview</Label>
          <div
            className="border p-4 rounded min-h-[150px]"
            dangerouslySetInnerHTML={{ __html: formik.values.description }}
          />
        </div>
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
        <div className="mb-6">
          <Label htmlFor="quantity">Specification</Label>
          <SpecificationsForm setSpecifications={setSpecifications} />
          {formik.touched.title && formik.errors.title && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.title}
            </div>
          )}
        </div>
        <div className="mb-6">
          <DropzoneComponent
            bucket="product-image"
            file={colorImageMap[selectedColor]}
            setFile={handleImageChangeColor}
            title="Product Images"
            multiple
            onReorder={(items: any) => {
              formik.setFieldValue("images", items);
            }}
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
                      onChange={(e) => {
                        handleColorLabelChange(selectedColor, e.target.value);
                      }}
                      placeholder="e.g. Red"
                    />
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
                        handleColorQuantityChange(selectedColor, e.target.value)
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

        <div className="mt-8">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Save Product
          </button>
        </div>
      </ComponentCard>
    </form>
  );
};

export default ProductForm;
