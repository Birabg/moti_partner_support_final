import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { Input } from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/useAuth";
import { AuthApi } from "../../api/authApi";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
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
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Incorrect email address or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleHelpSignin() {
    setHelpMessage("");

    if (!form.email) {
      setHelpMessage("Enter your email address so we can send your request.");
      return;
    }

    setHelpLoading(true);
    try {
      await AuthApi.signinHelp({ email: form.email });
      setHelpMessage("Your request has been sent to the system admin team. They will contact you soon.");
    } catch (err) {
      console.error(err);
      setHelpMessage("Unable to send your help request. Please try again later.");
    } finally {
      setHelpLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to access the MOTI Partner Support Portal.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="name@company.com"
          required
        />

        <Input
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          placeholder="Enter your password"
          rightIcon={showPassword ? <FaEyeSlash /> : <FaEye />}
          onRightIconClick={() => setShowPassword((value) => !value)}
          required
        />

        {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <div className="flex flex-col gap-2 text-sm text-slate-500">
          <div className="flex items-center justify-between gap-4">
            <Link to="/register" className="font-medium text-slate-700 hover:text-slate-900">Create account</Link>
            <button
              type="button"
              onClick={handleHelpSignin}
              disabled={helpLoading}
              className="font-medium text-slate-700 hover:text-slate-900"
            >
              {helpLoading ? "Sending..." : "Need help signing in?"}
            </button>
          </div>
          {helpMessage ? (
            <p className="text-sm text-slate-500">{helpMessage}</p>
          ) : null}
        </div>
      </form>
    </AuthLayout>
  );
}