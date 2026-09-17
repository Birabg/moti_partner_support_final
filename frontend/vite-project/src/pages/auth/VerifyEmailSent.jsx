import { useLocation, Link } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";

export default function VerifyEmailSent() {
  const { state } = useLocation();

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We've sent a verification link to your email."
    >
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">

        <h2 className="text-xl font-semibold text-green-700">
          Check your inbox
        </h2>

        <p className="mt-4 text-gray-700">
          We sent a verification email to:
        </p>

        <p className="mt-2 font-semibold">
          {state?.email}
        </p>

        <p className="mt-6 text-sm text-gray-600">
          Click the verification link in the email before signing in.
        </p>

        <Link
          to="/login"
          className="mt-6 inline-block text-navy-700 font-semibold"
        >
          Back to Login
        </Link>

      </div>
    </AuthLayout>
  );
}
