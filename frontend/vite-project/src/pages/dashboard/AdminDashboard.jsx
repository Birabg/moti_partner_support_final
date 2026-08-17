import DashboardHeader from "../../components/admin/DashboardHeader";
import DashboardCards from "../../components/admin/DashboardCards";
import CasesAnalytics from "../../components/admin/CasesAnalytics";

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <DashboardHeader />
            <DashboardCards />
            <CasesAnalytics />
        </div>
    );
}