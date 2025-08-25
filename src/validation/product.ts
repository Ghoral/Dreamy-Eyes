import * as Yup from "yup";

export const productValidationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  sub_title: Yup.string().required("Sub Title is required"),
  description: Yup.string().required("Description is required"),
  images: Yup.array().min(1, "At least one image is required"),
  price: Yup.number().required("Price is required"),
  power: Yup.number().required("Power is required"),
  color_quantity: Yup.array()
    .of(
      Yup.object().shape({
        color: Yup.string().required("Color is required"),
        label: Yup.string().required("Label is required"),
        quantity: Yup.number()
          .typeError("Quantity must be a number")
          .required("Quantity is required")
          .min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "Color quantities required"),
});
