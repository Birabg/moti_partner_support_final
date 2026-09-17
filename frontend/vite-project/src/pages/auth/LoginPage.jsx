import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { Input } from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/useAuth";
import { AuthApi } from "../../api/authApi";
import {
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaUserPlus,
  FaLifeRing,
} from "react-icons/fa";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [helpMessage, setHelpMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [helpLoading, setHelpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setHelpMessage("");
    setLoading(true);

    try {
      await login(form);

      navigate(
        location.state?.from?.pathname || "/dashboard",
        { replace: true }
      );
    } catch (err) {
      console.error(err);
      setError(
        "Incorrect email address or password. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleHelpSignin() {
    setHelpMessage("");

    if (!form.email) {
      setHelpMessage(
        "Enter your email address so we can send your request."
      );
      return;
    }

    setHelpLoading(true);

    try {
      await AuthApi.signinHelp({
        email: form.email,
      });

      setHelpMessage(
        "Your request has been sent to the system admin team. They will contact you soon."
      );
    } catch (err) {
      console.error(err);

      setHelpMessage(
        "Unable to send your help request. Please try again later."
      );
    } finally {
      setHelpLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your MOTI Partner Support workspace."
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* EMAIL */}
        <Input
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              email: e.target.value,
            }))
          }
          placeholder="name@company.com"
          required
          className="
            h-[50px]
            rounded-xl
            border-[#d9dfe7]
            bg-[#fbfcfd]
            px-4
            text-[13px]
            shadow-none
            transition-all
            duration-200
            focus:border-[#567fbd]
            focus:bg-white
            focus:ring-4
            focus:ring-[#567fbd]/10
          "
        />

        {/* PASSWORD */}
        <Input
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={form.password}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              password: e.target.value,
            }))
          }
          placeholder="Enter your password"
          rightIcon={
            showPassword ? (
              <FaEyeSlash size={14} />
            ) : (
              <FaEye size={14} />
            )
          }
          onRightIconClick={() =>
            setShowPassword((value) => !value)
          }
          required
          className="
            h-[50px]
            rounded-xl
            border-[#d9dfe7]
            bg-[#fbfcfd]
            px-4
            text-[13px]
            shadow-none
            transition-all
            duration-200
            focus:border-[#567fbd]
            focus:bg-white
            focus:ring-4
            focus:ring-[#567fbd]/10
          "
        />

        {/* ERROR */}
        {error ? (
          <div
            className="
              rounded-xl
              border border-red-100
              bg-red-50
              px-4 py-3
              text-[12px]
              leading-5
              text-red-600
            "
          >
            {error}
          </div>
        ) : null}

        {/* SIGN IN */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="
            group
            h-[51px]
            w-full
            rounded-xl
            border border-[#1a345b]
            bg-[#1a345b]
            text-[13px]
            font-semibold
            tracking-normal
            shadow-[0_10px_24px_rgba(26,52,91,0.16)]
            transition-all
            duration-200
            hover:-translate-y-[1px]
            hover:bg-[#234270]
            hover:shadow-[0_14px_30px_rgba(26,52,91,0.22)]
          "
        >
          {loading ? (
            "Signing in..."
          ) : (
            <>
              <span>Sign in to portal</span>

              <FaArrowRight
                size={11}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
              />
            </>
          )}
        </Button>

        {/* SECONDARY ACTIONS */}
        <div className="border-t border-slate-100 pt-5">

          <div className="grid grid-cols-2 gap-3">

            <Link
              to="/register"
              className="
                group
                flex items-center justify-center gap-2
                rounded-xl
                border border-slate-200
                bg-white
                px-3 py-3
                text-[11px]
                font-semibold
                text-slate-600
                transition-all
                duration-200
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-900
              "
            >
              <FaUserPlus
                size={11}
                className="text-slate-400 group-hover:text-[#567fbd]"
              />

              Create account
            </Link>

            <button
              type="button"
              onClick={handleHelpSignin}
              disabled={helpLoading}
              className="
                group
                flex items-center justify-center gap-2
                rounded-xl
                border border-slate-200
                bg-white
                px-3 py-3
                text-[11px]
                font-semibold
                text-slate-600
                transition-all
                duration-200
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-900
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <FaLifeRing
                size={11}
                className="text-slate-400 group-hover:text-[#567fbd]"
              />

              {helpLoading
                ? "Sending..."
                : "Need help?"}
            </button>
          </div>

          {/* HELP MESSAGE */}
          {helpMessage ? (
            <div
              className="
                mt-4
                rounded-xl
                border border-slate-100
                bg-slate-50
                px-4 py-3
                text-[11px]
                leading-5
                text-slate-500
              "
            >
              {helpMessage}
            </div>
          ) : null}
        </div>
      </form>
    </AuthLayout>
  );
}
