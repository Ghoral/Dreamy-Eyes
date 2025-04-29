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

const ProductForm = () => {
  const [specifications, setSpecifications] = useState<any>({});
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
    },
    validationSchema: productValidationSchema,
    onSubmit: (values: IProduct) => {
      onSubmit(values);
    },
  });

  const onSubmit = async (values: IProduct) => {
    const images = values.images?.map((item) => `${item.name}`).join(",");
    const color = values.color?.join(",");
    const body = {
      ...values,
      images,
      color,
      specifications: specifications.keyValuePairs,
    };

    await supabaseClient.from("lens").insert(body);
  };

  const handleImageChange = async (files: any) => {
    formik.setFieldValue("images", files);
    console.log("files -> ", files);

    try {
      if (files?.length) {
        const fileToUpload = files[files.length - 1];
        const { error } = await supabaseClient.storage
          .from("lens-images")
          .upload(fileToUpload.name, fileToUpload, { upsert: true });

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      showCustomToastError(error);
    }
  };

  const handleEditorChange = (content: any) => {
    formik.setFieldValue("description", content);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <ComponentCard title="Product">
        <div className="mb-6">
          <DropzoneComponent
            file={formik.values.images}
            setFile={handleImageChange}
            title="Product Images"
            multiple
            onReorder={(items) => {
              formik.setFieldValue("images", items);
            }}
            bucket="lens-images"
          />
          {formik.touched.images && formik.errors.images && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.images}
            </div>
          )}
        </div>
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
            file={formik.values.images}
            setFile={handleImageChange}
            title="Product Images"
            multiple
            onReorder={(items) => {
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
            onChange={(colors) => formik.setFieldValue("color", colors)}
            values={formik.values.color}
          />
        </div>

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
