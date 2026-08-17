import { useEffect, useState } from "react";
import {
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import { CustomerApi } from "../../api/customerApi";
import { StaffApi } from "../../api/staffApi";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState(
    "Verifying your email..."
  );

  useEffect(() => {
    const verify = async () => {
      const token = params.get("token");
      const type = params.get("type");

      console.log(
        "Verification Token:",
        token
      );

      console.log(
        "Verification Type:",
        type
      );

      if (!token) {
        setMessage(
          "Invalid verification link."
        );
        return;
      }

      try {
        /*
          TEMPORARY FIX

          Since the backend is currently generating:
          ?type=http://localhost:5173

          We will treat EVERYTHING except "customer"
          as a staff verification.
        */

        const normalizedType =
          type?.toLowerCase();

        if (
          normalizedType ===
          "customer"
        ) {
          await CustomerApi.verifyEmail(
            token
          );
        } else {
          await StaffApi.verifyEmail(
            token
          );
        }

        setMessage(
          "Thank you for your patience. Your email has been verified successfully and is now awaiting System Administrator approval."
        );
      } catch (error) {
        console.log(
          "Verification Error:",
          error
        );

        setMessage(
          "Verification failed or the link has expired. Please request a new verification email or contact support."
        );
      }
    };

    verify();
  }, [params]);

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-slate-100
        p-5
      "
    >
      <div
        className="
          bg-white
          rounded-lg
          shadow-sm
          max-w-xl
          w-full
          p-10
          text-center
        "
      >
        <h1
          className="
            text-3xl
            font-bold
            text-green-700
          "
        >
          Email Verification
        </h1>

        <p
          className="
            mt-6
            text-lg
            text-slate-700
            leading-8
          "
        >
          {message}
        </p>

        {message
          .toLowerCase()
          .includes("verified") && (
          <button
            onClick={() =>
              navigate("/login")
            }
            className="
              mt-8
              px-6
              py-3
              rounded-xl
              bg-green-700
              text-white
              hover:bg-green-800
              transition
            "
          >
            Go To Login
          </button>
        )}
      </div>
    </div>
  );
}