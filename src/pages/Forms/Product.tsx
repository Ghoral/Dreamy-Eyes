import { useFormik } from "formik";
import * as Yup from "yup";
import ComponentCard from "../../components/common/ComponentCard";
import DropzoneComponent from "../../components/form/form-elements/DropZone";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import { Editor } from "@tinymce/tinymce-react";
import SpecificationsForm from "../Components/SpecificationForm";

const ProductForm = () => {
  // Define validation schema
  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    images: Yup.array().min(1, "At least one image is required"),
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      images: [],
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form submitted with values:", values);
      // Here you would typically send the data to your API
    },
  });

  // Handle image updates and sync with formik
  const handleImageChange = (files: any) => {
    formik.setFieldValue("images", files);
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
          <Label htmlFor="sub-description">Sub Description</Label>
          <TextArea
            value={formik.values.description}
            onChange={(e: any) =>
              formik.setFieldValue("description", e.target.value)
            }
            rows={6}
          />
          {formik.touched.description && formik.errors.description && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.description}
            </div>
          )}
        </div>

        <div className="mb-6">
          <Label htmlFor="price">Price</Label>
          <Input
            type="number"
            id="price"
            name="price"
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
          <Label htmlFor="power">Power</Label>
          <Input
            type="number"
            id="power"
            name="power"
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
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            type="number"
            id="quantity"
            name="quantity"
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
          <Label htmlFor="quantity">Specification</Label>
          <SpecificationsForm />
          {formik.touched.title && formik.errors.title && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.title}
            </div>
          )}
        </div>
        <div className="mb-6">
          <label
            htmlFor="hs-color-input"
            className="block text-sm font-medium mb-2 dark:text-white"
          >
            Color
          </label>
          <input
            type="color"
            className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
            id="hs-color-input"
            value="#2563eb"
            title="Choose your color"
          ></input>
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
