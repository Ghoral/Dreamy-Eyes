import * as Yup from "yup";

export const productValidationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  sub_title: Yup.string().required("Sub Title is required"),
  description: Yup.string().required("Description is required"),
  images: Yup.array().min(1, "At least one image is required"),
  price: Yup.number().required("Price is required"),
  quantity: Yup.number().required("Quantity is required"),
  power: Yup.number().required("Power is required"),
});
