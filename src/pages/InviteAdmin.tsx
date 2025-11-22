import { useFormik } from "formik";
import ComponentCard from "../components/common/ComponentCard";
import DropzoneComponent from "../components/form/form-elements/DropZone";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Button from "../components/common/Button";
import { useState, useEffect } from "react";
import { supabaseClient } from "../service/supabase";
import { showCustomToastError, showCustomToastSuccess } from "../utils/toast";
import { appStore } from "../store";
import { EyeIcon, EyeCloseIcon } from "../icons";
import { useParams, useNavigate } from "react-router";
import * as Yup from "yup";

const createAdminValidationSchema = Yup.object({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  user_type: Yup.string()
    .oneOf(["admin"], "Invalid user type")
    .required("User type is required"),
  identification: Yup.mixed().required("Identification document is required"),
});

const editAdminValidationSchema = Yup.object({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters"),
  user_type: Yup.string()
    .oneOf(["admin"], "Invalid user type")
    .required("User type is required"),
});

export default function InviteAdmin() {
  const { userData } = appStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const role = userData?.role || "user";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identificationFile, setIdentificationFile] = useState<File | null>(
    null
  );
  const [existingIdentificationKey, setExistingIdentificationKey] = useState<
    string | null
  >(null);
  const [originalIdentificationKey, setOriginalIdentificationKey] = useState<
    string | null
  >(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      user_type: "admin",
      identification: null,
    },
    validationSchema: isEditMode
      ? editAdminValidationSchema
      : createAdminValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        if (isEditMode && id) {
          // Update admin
          let finalIdentificationKey = existingIdentificationKey;

          if (identificationFile) {
            // New file uploaded - upload it first
            const fileName = `admin-${Date.now()}-${identificationFile.name}`;
            const { data: uploadData, error: uploadError } =
              await supabaseClient.storage
                .from("identification")
                .upload(fileName, identificationFile);

            if (uploadError) throw uploadError;

            // Delete old file if it exists
            if (originalIdentificationKey) {
              try {
                const { error: deleteError } = await supabaseClient.storage
                  .from("identification")
                  .remove([originalIdentificationKey]);

                if (deleteError && !deleteError.message.includes("not found")) {
                  console.error(
                    "Failed to delete old identification file:",
                    deleteError
                  );
                }
              } catch (err) {
                console.error("Error deleting old identification file:", err);
              }
            }
            // Use new key
            finalIdentificationKey = fileName;
          } else if (
            !identificationFile &&
            !existingIdentificationKey &&
            originalIdentificationKey
          ) {
            // User removed the existing file - delete from storage and set to null
            try {
              const { error: deleteError } = await supabaseClient.storage
                .from("identification")
                .remove([originalIdentificationKey]);

              if (deleteError && !deleteError.message.includes("not found")) {
                console.error(
                  "Failed to delete identification file:",
                  deleteError
                );
              }
            } catch (err) {
              console.error("Error deleting identification file:", err);
            }
            finalIdentificationKey = null;
          }
          // If existingIdentificationKey is still set, keep it (no changes)

          // Update profile using RPC function
          const { data: updatedProfile, error: profileError } =
            await supabaseClient.rpc("update_profile_by_id", {
              profile_id: id,
              profile_data: {
                first_name: values.first_name,
                last_name: values.last_name,
                email: values.email,
                role: values.user_type,
                identification: finalIdentificationKey,
              },
            });

          if (profileError) throw profileError;
          showCustomToastSuccess("Admin user updated successfully");
          navigate("/admins");
        } else {
          // Create admin - identification is required
          if (!identificationFile) {
            showCustomToastError(
              "Identification document is required",
              "Validation Error"
            );
            setLoading(false);
            return;
          }

          // Upload identification document
          const fileName = `admin-${Date.now()}-${identificationFile.name}`;
          const { data: uploadData, error: uploadError } =
            await supabaseClient.storage
              .from("identification")
              .upload(fileName, identificationFile);

          if (uploadError) throw uploadError;

          // Create admin with identification key
          const { data, error } = await supabaseClient.functions.invoke(
            "create-admin",
            {
              body: JSON.stringify({
                data: {
                  ...values,
                  identification: fileName,
                },
              }),
            }
          );

          if (error) throw error;
          showCustomToastSuccess("Admin user created successfully");
          formik.resetForm();
          setIdentificationFile(null);
        }
      } catch (e: any) {
        showCustomToastError(
          e?.message || e,
          isEditMode ? "Failed to update admin" : "Failed to create admin"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch admin data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchAdminData = async () => {
        try {
          setLoading(true);

          console.log("Fetching admin data for ID:", id);

          // Use RPC function to fetch admin data
          const { data: rpcResponse, error } = await supabaseClient.rpc(
            "get_profile_by_id",
            {
              profile_id: id,
            }
          );

          console.log("RPC response:", { rpcResponse, error });

          if (error) {
            console.error("RPC error:", error);
            showCustomToastError(
              error.message || "Failed to fetch admin data",
              "Error loading admin"
            );
            setTimeout(() => {
              navigate("/admins");
            }, 2000);
            return;
          }

          // RPC function returns the profile data directly
          const adminData = rpcResponse;

          if (!adminData || !adminData.id) {
            console.warn("No admin data returned:", rpcResponse);
            showCustomToastError(
              "Admin profile not found",
              "Failed to load admin data"
            );
            setTimeout(() => {
              navigate("/admins");
            }, 2000);
            return;
          }

          console.log("Setting form values with:", adminData);

          const identificationKey = adminData.identification || null;

          formik.setValues({
            first_name: adminData.first_name || "",
            last_name: adminData.last_name || "",
            email: adminData.email || "",
            password: "", // Don't prefill password
            user_type: adminData.role || "admin", // Map role to user_type for form
            identification: identificationKey ? "existing" : (null as any), // Set a value to pass validation
          });

          setExistingIdentificationKey(identificationKey);
          setOriginalIdentificationKey(identificationKey); // Store original for deletion tracking

          console.log("Identification key set:", identificationKey);
          console.log("Existing identification key state:", identificationKey);

          // Generate signed URL for preview if identification exists
          if (identificationKey) {
            console.log("Generating signed URL for key:", identificationKey);
            try {
              const { data: signedUrlData, error: urlError } =
                await supabaseClient.storage
                  .from("identification")
                  .createSignedUrl(identificationKey, 3600); // 1 hour expiry

              console.log("Signed URL response:", { signedUrlData, urlError });

              if (urlError) {
                console.error("Error generating signed URL:", urlError);
              } else if (signedUrlData) {
                // Handle both response structures: { signedUrl: "..." } or direct string
                const url =
                  typeof signedUrlData === "string"
                    ? signedUrlData
                    : signedUrlData?.signedUrl || null;
                if (url) {
                  console.log("Setting signed URL:", url);
                  console.log(
                    "Before setSignedUrl - signedUrl state will be:",
                    url
                  );
                  setSignedUrl(url);
                  console.log("After setSignedUrl called");
                } else {
                  console.warn(
                    "Could not extract signed URL from:",
                    signedUrlData
                  );
                }
              } else {
                console.warn("No signedUrlData returned");
              }
            } catch (err) {
              console.error("Exception generating signed URL:", err);
            }
          } else {
            console.log("No identification key to generate signed URL");
          }
        } catch (error: any) {
          console.error("Error fetching admin data:", error);
          const errorMessage =
            error?.message || error?.toString() || "Failed to load admin data";
          console.error("Error details:", errorMessage);
          console.error("Full error object:", error);
          showCustomToastError(
            `Error: ${errorMessage}. Check console for details.`,
            "Error loading admin"
          );
          // DON'T navigate away - let user see the error and stay on page
          // User can manually go back if needed
        } finally {
          setLoading(false);
        }
      };

      fetchAdminData();
    }
  }, [id, isEditMode, navigate]);

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      // Check if it's a File object
      if (file instanceof File) {
        setIdentificationFile(file);
        formik.setFieldValue("identification", file, false); // Don't validate on change
        setExistingIdentificationKey(null); // Clear existing key when new file is selected
        setSignedUrl(null); // Clear signed URL
      }
      // If it's a string (signed URL), ignore - this is just for display
    } else {
      // If files array is empty (user clicked X to remove)
      // Just clear the file selection - don't trigger form submission
      setIdentificationFile(null);
      formik.setFieldValue("identification", null, false); // Don't validate on change
      // In edit mode, if there was an existing file, we'll handle deletion on submit
      // For now, just clear the display
      if (isEditMode && existingIdentificationKey && !identificationFile) {
        // User removed existing file - mark for deletion
        setExistingIdentificationKey(null);
        setSignedUrl(null);
      }
    }
  };

  if (role !== "super_admin") {
    return null;
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      <ComponentCard
        title={isEditMode ? "Edit Admin" : "Create Admin"}
        desc={
          isEditMode
            ? "Update admin user information"
            : "Create a new admin user with email and password"
        }
      >
        {/* First Name */}
        <div className="mb-6">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            type="text"
            id="first_name"
            name="first_name"
            placeholder="Enter first name"
            value={formik.values.first_name}
            onChange={formik.handleChange}
            error={!!(formik.touched.first_name && formik.errors.first_name)}
          />
          {formik.touched.first_name && formik.errors.first_name && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.first_name}
            </div>
          )}
        </div>

        {/* Last Name */}
        <div className="mb-6">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            type="text"
            id="last_name"
            name="last_name"
            placeholder="Enter last name"
            value={formik.values.last_name}
            onChange={formik.handleChange}
            error={!!(formik.touched.last_name && formik.errors.last_name)}
          />
          {formik.touched.last_name && formik.errors.last_name && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.last_name}
            </div>
          )}
        </div>

        {/* Email */}
        <div className="mb-6">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Enter email address"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={!!(formik.touched.email && formik.errors.email)}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.email}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder={
                isEditMode ? "Enter new password (optional)" : "Enter password"
              }
              value={formik.values.password}
              onChange={formik.handleChange}
              className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 pr-10 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                formik.touched.password && formik.errors.password
                  ? "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800"
                  : "bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none cursor-pointer z-10"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5 hover:fill-gray-700 dark:hover:fill-gray-300" />
              ) : (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5 hover:fill-gray-700 dark:hover:fill-gray-300" />
              )}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.password}
            </div>
          )}
        </div>

        {/* User Type */}
        <div className="mb-6">
          <Label htmlFor="user_type">User Type</Label>
          <select
            id="user_type"
            name="user_type"
            value={formik.values.user_type}
            onChange={formik.handleChange}
            className={`w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden bg-transparent text-gray-900 dark:text-gray-300 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 ${
              formik.touched.user_type && formik.errors.user_type
                ? "border-red-500"
                : ""
            }`}
          >
            <option value="admin">Admin</option>
          </select>
          {formik.touched.user_type && formik.errors.user_type && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.user_type}
            </div>
          )}
        </div>

        {/* Identification Document */}
        <div className="mb-6">
          <Label htmlFor="identification">
            Identification Document{" "}
            {isEditMode && "(optional - upload new to replace)"}
          </Label>
          {signedUrl && existingIdentificationKey && !identificationFile && (
            <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Current identification:
              </p>
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline text-sm font-medium"
              >
                View current identification
              </a>
            </div>
          )}
          {/* Debug display - always show in edit mode */}
          {isEditMode && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <strong>Debug:</strong> signedUrl=
              {signedUrl ? `✓ (${signedUrl.substring(0, 50)}...)` : "✗"},
              existingKey=
              {existingIdentificationKey
                ? `✓ (${existingIdentificationKey})`
                : "✗"}
              , file={identificationFile ? "✗ (has file)" : "✓ (no file)"}
              <br />
              Condition result:{" "}
              {signedUrl && existingIdentificationKey && !identificationFile
                ? "TRUE - Should show"
                : "FALSE - Won't show"}
            </div>
          )}
          <DropzoneComponent
            bucket="identification"
            file={identificationFile ? [identificationFile] : []}
            title="Upload identification document (image or PDF)"
            multiple={false}
            setFile={handleFileChange}
            uploading={loading}
          />
          {signedUrl && existingIdentificationKey && !identificationFile && (
            <div className="mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setExistingIdentificationKey(null);
                  setOriginalIdentificationKey(null);
                  setSignedUrl(null);
                  formik.setFieldValue("identification", null);
                }}
                className="text-sm text-red-600 hover:text-red-700 underline"
              >
                Remove current identification
              </button>
            </div>
          )}
          {formik.touched.identification &&
            formik.errors.identification &&
            !isEditMode && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.identification}
              </div>
            )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isEditMode ? "Update Admin" : "Create Admin"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (isEditMode) {
                navigate("/admins");
              } else {
                formik.resetForm();
                setIdentificationFile(null);
              }
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            disabled={loading}
          >
            {isEditMode ? "Cancel" : "Reset"}
          </button>
        </div>
      </ComponentCard>
    </form>
  );
}
