import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/useAuth";

import AppLayout from "./components/layout/AppLayout";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import VerifyEmailSentPage from "./pages/auth/VerifyEmailSentPage";
import RegistrationSuccessPage from "./pages/auth/RegistrationSuccessPage";


// ADMIN
import CaseTrackingPage from "./pages/admin/CaseTrackingPage";
import AdminFeedbackPage from "./pages/admin/FeedbackPage";
import ReportsPage from "./pages/admin/ReportsPage";
import ProfilePage from "./pages/admin/ProfilePage";
import DepartmentManagementPage from "./pages/admin/DepartmentManagementPage";
import ProductService from "./pages/admin/ProductService";
import ApprovalPage from "./pages/admin/ApprovalPage";
import OrganizationPage from "./pages/admin/OrganizationPage";
import OrganizationDetailsPage from "./pages/admin/OrganizationDetailsPage";


// CUSTOMER
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CreateCase from "./pages/customer/CreateCase";
import MyCases from "./pages/customer/MyCases";
import CaseDetails from "./pages/customer/CaseDetails";
import CaseResolutionFeedbackPage from "./pages/customer/CaseResolutionFeedbackPage";
import CaseResolutionRejectPage from "./pages/customer/CaseResolutionRejectPage";
import CustomerFeedback from "./pages/customer/CustomerFeedback";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerNotifications from "./pages/customer/NotificationsPage";

// MANAGER
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerOrganization from "./pages/manager/ManagerOrganization";
import ManagerStaff from "./pages/manager/ManagerStaff";
import ManagerCases from "./pages/manager/ManagerCases";
import ManagerAssignCase from "./pages/manager/ManagerAssignCase";
import ManagerReports from "./pages/manager/ManagerReports";
import ManagerProfile from "./pages/manager/ManagerProfile";

// DIRECTOR
import DirectorDashboard from "./pages/director/DirectorDashboard";
import DirectorUsers from "./pages/director/DirectorUsers";
import DirectorOrganizationStructure from "./pages/director/DirectorOrganizationStructure";
import DirectorCaseAnalytics from "./pages/director/DirectorCaseAnalytics";
import DirectorOrganizationSummary from "./pages/director/DirectorOrganizationSummary";
import DirectorProfile from "./pages/director/DirectorProfile";

// SUPPORT
import PSSupportDashboard from "./pages/support/PSSupportDashboard";
import AssignedCases from "./pages/support/AssignedCases";
import CaseDetail from "./pages/support/CaseDetail";
import History from "./pages/support/History";
import FeedbackAnalytics from "./pages/support/FeedbackAnalytics";
import SupportProfile from "./pages/support/Profile";

// GENERAL
import DashboardPage from "./pages/DashboardPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFoundPage from "./pages/NotFoundPage";

function getDefaultRouteForUser(user) {
 if (!user) return "/login";

 const isSystemAdmin = Boolean(user.isSAdmin || user.role === "SYSTEM_ADMIN" || user.userType === "SYSTEM_ADMIN");
 const isDirector = Boolean(user.isDirector || user.role === "DIRECTOR" || user.userType === "DIRECTOR");
 const isManager = Boolean(user.isManager || user.role === "MANAGER" || user.userType === "MANAGER" || user.managerType);
 const isSupport = Boolean(user.isPSsupport || user.role === "PS_SUPPORT" || user.userType === "PS_SUPPORT");

 if (isSystemAdmin) return "/dashboard";
 if (isDirector) return "/director/dashboard";
 if (isManager) return "/manager/dashboard";
 if (isSupport) return "/support";
 if (user.partyType === "CUSTOMER" || user.isCustomer) return "/customer/dashboard";
 return "/dashboard";
}

function DefaultRouteRedirect() {
 const { user } = useAuth();
 const target = getDefaultRouteForUser(user);

 return <Navigate to={target} replace />;
}

export default function App() {


return (

<Routes>


{/* ================= PUBLIC ================= */}


<Route
path="/"
element={<DefaultRouteRedirect />}
/>

<Route
path="/login"
element={<LoginPage />}
/>


<Route
path="/register"
element={<RegisterPage />}
/>


<Route
path="/verify-email"
element={<VerifyEmailPage />}
/>


<Route
path="/verify-email-sent"
element={<VerifyEmailSentPage />}
/>


<Route
path="/registration-success"
element={<RegistrationSuccessPage />}
/>

<Route
path="/cases/:id/feedback"
element={<CaseResolutionFeedbackPage />}
/>

<Route
path="/cases/:id/reopen"
element={<CaseResolutionRejectPage />}
/>

<Route
path="/unauthorized"
element={<UnauthorizedPage />}
/>




{/* ================= ALL AUTH USERS ================= */}

<Route

element={

<ProtectedRoute>

<AppLayout />

</ProtectedRoute>

}

>


<Route

path="/dashboard"

element={<DashboardPage />}

/>


<Route
path="/manager/dashboard"
element={<ManagerDashboard />}
/>

<Route
path="/manager/organization"
element={<ManagerOrganization />}
/>

<Route
path="/manager/staff"
element={<ManagerStaff />}
/>

<Route
path="/manager/cases"
element={<ManagerCases />}
/>

<Route
path="/manager/assign-case"
element={<ManagerAssignCase />}
/>

<Route
path="/manager/reports"
element={<ManagerReports />}
/>

<Route
path="/manager/profile"
element={<ManagerProfile />}
/>

<Route
    path="/support"
    element={<PSSupportDashboard />}
/>

<Route
    path="/support/cases"
    element={<AssignedCases />}
/>

<Route
    path="/support/case/:id"
    element={<CaseDetail />}
/>

<Route
    path="/support/history"
    element={<History />}
  />

<Route
    path="/support/feedback"
    element={<FeedbackAnalytics />}
  />

<Route
    path="/support/profile"
    element={<SupportProfile />}
  />

<Route
    path="/customer/dashboard"

    element={<CustomerDashboard />}

/>



<Route

path="/customer/create-case"

element={<CreateCase />}

/>



<Route

path="/customer/my-cases"

element={<MyCases />}

/>



<Route

path="/customer/case/:id"

element={<CaseDetails />}

/>

<Route
    path="/customer/cases/:id"
    element={<CaseDetails />}
/>

<Route
    path="/customer/feedback"
    element={<CustomerFeedback />}
/>

<Route
    path="/customer/notifications"
    element={<CustomerNotifications />}
/>

<Route
    path="/customer/profile"
    element={<CustomerProfile />}
/>

  <Route
    path="/director"
    element={<Navigate to="/director/dashboard" replace />}
  />

  <Route
    path="/director/dashboard"
    element={
      <ProtectedRoute roles={["DIRECTOR"]}>
        <DirectorDashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/director/users"
    element={
      <ProtectedRoute roles={["DIRECTOR"]}>
        <DirectorUsers />
      </ProtectedRoute>
    }
  />

  <Route
    path="/director/department-management"
    element={
      <ProtectedRoute roles={["DIRECTOR"]}>
        <DirectorOrganizationStructure />
      </ProtectedRoute>
    }
  />

  <Route
    path="/director/case-analytics"
    element={
      <ProtectedRoute roles={["DIRECTOR"]}>
        <DirectorCaseAnalytics />
      </ProtectedRoute>
    }
  />

  <Route
    path="/director/organization-summary"
    element={
      <ProtectedRoute roles={["DIRECTOR"]}>
        <DirectorOrganizationSummary />
      </ProtectedRoute>
    }
  />

  <Route
    path="/director/profile"
    element={
      <ProtectedRoute roles={["DIRECTOR"]}>
        <DirectorProfile />
      </ProtectedRoute>
    }
  />

</Route>





{/* ================= SYSTEM ADMIN ================= */}



<Route


element={

<ProtectedRoute roles={["SYSTEM_ADMIN"]}>

<AppLayout />

</ProtectedRoute>


}


>



<Route

path="/admin/approval"

element={<ApprovalPage />}

/>



<Route

path="/admin/cases"

element={<CaseTrackingPage />}

/>



<Route

path="/admin/department-management"

element={<DepartmentManagementPage />}

/>



<Route

path="/admin/product-service"

element={<ProductService />}

/>



<Route

path="/organizations"

element={<OrganizationPage />}

/>



<Route

path="/organizations/:id"

element={<OrganizationDetailsPage />}

/>



<Route

path="/admin/organizations/:id"

element={<OrganizationDetailsPage />}

/>



<Route

path="/feedback"

element={<AdminFeedbackPage />}

/>



<Route

path="/reports"

element={<ReportsPage />}

/>



<Route

path="/profile"

element={<ProfilePage />}

/>



</Route>





{/* ================= 404 ================= */}


<Route

path="*"

element={<NotFoundPage />}

/>


</Routes>

);

}
