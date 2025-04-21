import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

const SpecificationsForm = () => {
  // Define validation schema
  const validationSchema = Yup.object({
    specifications: Yup.array().of(
      Yup.object({
        label: Yup.string().required("Label is required"),
        value: Yup.string().required("Value is required"),
      })
    ),
  });

  // Initialize formik
  const formik: any = useFormik({
    initialValues: {
      specifications: [
        { label: "Replacement Schedule", value: "Monthly" },
        { label: "Water Content", value: "42%" },
      ],
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form submitted with values:", values);
    },
  });

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <ComponentCard title="Product Specifications">
          <FieldArray
            name="specifications"
            render={(arrayHelpers) => (
              <div>
                {formik.values.specifications.map(
                  (spec: any, index: number) => (
                    <div
                      key={index}
                      className="flex flex-wrap mb-4 items-start"
                    >
                      <div className="w-full md:w-5/12 pr-2 mb-3 md:mb-0">
                        <Label htmlFor={`specifications.${index}.label`}>
                          Label
                        </Label>
                        <Input
                          type="text"
                          id={`specifications.${index}.label`}
                          name={`specifications.${index}.label`}
                          value={spec.label}
                          onChange={formik.handleChange}
                        />
                        {formik.touched.specifications?.[index]?.label &&
                          formik.errors.specifications?.[index]?.label && (
                            <div className="text-red-500 text-sm mt-1">
                              {formik.errors.specifications[index].label}
                            </div>
                          )}
                      </div>

                      <div className="w-full md:w-5/12 px-2 mb-3 md:mb-0">
                        <Label htmlFor={`specifications.${index}.value`}>
                          Value
                        </Label>
                        <Input
                          type="text"
                          id={`specifications.${index}.value`}
                          name={`specifications.${index}.value`}
                          value={spec.value}
                          onChange={formik.handleChange}
                        />
                        {formik.touched.specifications?.[index]?.value &&
                          formik.errors.specifications?.[index]?.value && (
                            <div className="text-red-500 text-sm mt-1">
                              {formik.errors.specifications[index].value}
                            </div>
                          )}
                      </div>

                      <div className="w-full md:w-2/12 flex items-end pt-6 md:pt-5">
                        <button
                          type="button"
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
                          onClick={() => arrayHelpers.remove(index)}
                          aria-label="Remove"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                )}

                <div className="mt-4 mb-6">
                  <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center"
                    onClick={() => arrayHelpers.push({ label: "", value: "" })}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add More
                  </button>
                </div>
              </div>
            )}
          />

          <div className="mt-8 border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Specification
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formik.values.specifications.map(
                  (spec: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {spec.label || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {spec.value || "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </form>
    </FormikProvider>
  );
};

export default SpecificationsForm;
