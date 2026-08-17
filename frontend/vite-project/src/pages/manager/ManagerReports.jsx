import { useEffect, useState } from "react";
import { BarChart3, ClipboardList, Users } from "lucide-react";
import { managerApi } from "../../api/managerApi";
import { useAuth } from "../../context/useAuth";
import DashboardCard from "../../components/manager/DashboardCard";
import ManagerHeader from "../../components/manager/ManagerHeader";
import { Card, CardContent } from "../../components/ui/card";

export default function ManagerReports() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await managerApi.getScopeOverview();
        setSnapshot(response?.data?.data || null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const scope = snapshot?.department?.name || snapshot?.division?.name || snapshot?.section?.name || "Current scope";
  const totalCases = snapshot?.caseMetrics?.totalAssignedCases || 0;
  const totalStaff = snapshot?.hierarchyMetrics?.totalSectionStaffCount || snapshot?.hierarchyMetrics?.totalDivisionStaffCount || snapshot?.hierarchyMetrics?.totalDepartmentStaffCount || 0;

  return (
    <div className="space-y-6">
      <ManagerHeader user={user} orgPath={scope} managerRole={user?.managerType || "Manager"} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Scoped Cases" value={totalCases} caption="Cases visible in the current manager scope" icon={ClipboardList} accent="amber" loading={loading} />
        <DashboardCard title="Scoped Staff" value={totalStaff} caption="Staff members visible in the current manager scope" icon={Users} accent="green" loading={loading} />
        <DashboardCard title="Executive Summary" value={scope} caption="Current scope endpoint used for the analytics shell" icon={BarChart3} accent="rose" loading={loading} />
      </div>
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-2 text-md font-semibold text-slate-900">Executive Analytics</h2>
          <p className="text-sm text-slate-500">Manager reporting is now driven by the same scoped backend analytics response that powers the dashboard, organization, staff, and cases views.</p>
        </CardContent>
      </Card>
    </div>
  );
}
