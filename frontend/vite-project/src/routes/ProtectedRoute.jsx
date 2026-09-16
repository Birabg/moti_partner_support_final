import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({
  children,
  roles = [],
}) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div
        className="
        flex
        items-center
        justify-center
        h-screen
        text-xl
        font-semibold
        "
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (roles.length === 0) {
    return children;
  }

  if (roles.includes("SYSTEM_ADMIN")) {
    if (user.isSAdmin || user.role === "SYSTEM_ADMIN" || user.userType === "SYSTEM_ADMIN") {
      return children;
    }
  }

  if (roles.includes("MANAGER")) {
    if (user.isManager || user.role === "MANAGER" || user.userType === "MANAGER" || user.managerType) {
      return children;
    }
  }

  if (roles.includes("DIRECTOR")) {
    if (user.isDirector || user.role === "DIRECTOR" || user.userType === "DIRECTOR") {
      return children;
    }
  }

  if (roles.includes("PS_SUPPORT")) {
    if (user.isPSsupport || user.role === "PS_SUPPORT" || user.userType === "PS_SUPPORT") {
      return children;
    }
  }

  if (roles.includes("CUSTOMER")) {
    if (user.partyType === "CUSTOMER") {
      return children;
    }
  }

  return (
    <Navigate
      to="/unauthorized"
      replace
    />
  );
}