import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router";
import { showCustomToastError } from "../../utils/toast";
import { supabaseClient } from "../../service/supabase";
import { Loader2 } from "lucide-react";

export default function SignInForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      const res = await supabaseClient.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (res.error) {
        throw res.error;
      }
      // Check admin role BEFORE navigating
      const { data: profile, error: roleErr } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("email", values.email)
        .single();
      if (roleErr || profile?.role !== "admin") {
        await supabaseClient.auth.signOut();
        navigate("/signin");
        throw new Error("Only admins can sign in.");
      }
      console.log("error no here common ");

      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      setLoading(false);
      showCustomToastError(error, "Sign in failed");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please sign in to your account
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && formik.errors.email}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && formik.errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeCloseIcon className="size-5" />
                ) : (
                  <EyeIcon className="size-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Checkbox
              id="remember"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              label="Remember me"
            />
            <Link
              to="/forgot-password"
              className="text-sm text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          {/* Sign up removed */}
        </form>
      </div>
    </div>
  );
}
