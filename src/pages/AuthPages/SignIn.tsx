import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | Dreamy Eyes Admin"
        description="Sign in to Dreamy Eyes Admin"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
