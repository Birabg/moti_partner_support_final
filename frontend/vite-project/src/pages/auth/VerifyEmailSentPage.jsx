import { useLocation, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function VerifyEmailSentPage() {
  const { state } = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-5">
      <div className="bg-white rounded-lg shadow-sm p-10 max-w-lg w-full text-center">
        <CheckCircle2
          size={80}
          className="mx-auto text-green-600"
        />

        <h1 className="text-3xl font-bold mt-5">
          Registration Successful
        </h1>

        <p className="mt-5 text-slate-600">
          Thank you for registering. Your request is now being prepared for review.
        </p>

        <p className="mt-3 text-slate-600">
          We have sent a verification email to:
        </p>

        <p className="font-bold text-green-700 mt-2">
          {state?.email}
        </p>

        <p className="mt-5 text-slate-600">
          Please check your inbox and click the verification link.
        </p>

        <p className="mt-3 text-slate-600">
          After verifying your email, your account will stay pending until a System Administrator reviews it. Thank you for your patience.
        </p>

        <Link
          to="/login"
          className="
            inline-block
            mt-8
            px-6
            py-3
            bg-dark blue-700
            text-white
            rounded-xl
          "
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}