import { useEffect, useState } from "react";
import { Building2, Users } from "lucide-react";
import { managerApi } from "../../api/managerApi";
import DashboardCard from "../../components/manager/DashboardCard";
import ManagerHeader from "../../components/manager/ManagerHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

export default function ManagerOrganizationPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await managerApi.getScopeOverview();
        if (!cancelled) {
          setOverview(response?.data?.data || null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    const handleCaseUpdated = () => {
      load();
    };

    const handleFocus = () => {
      load();
    };

    window.addEventListener("cases:updated", handleCaseUpdated);
    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("cases:updated", handleCaseUpdated);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const scope = overview?.department || overview?.division || overview?.section || {};
  const hierarchy = overview?.hierarchyMetrics || {};

  return (
    <div className="space-y-6">
      <ManagerHeader user={{ firstName: "Manager", lastName: "" }} orgPath={scope.name || "Unit Overview"} managerRole="Manager" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Scope" value={scope.name || "—"} caption="Active organization scope" icon={Building2} accent="blue" loading={loading} />
        <DashboardCard title="Staff" value={hierarchy.totalSectionStaffCount || hierarchy.totalDivisionStaffCount || hierarchy.totalDepartmentStaffCount || 0} caption="People under this scope" icon={Users} accent="violet" loading={loading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This manager workspace is scoped to the current unit and automatically reflects the logged-in manager’s access boundary.</p>
        </CardContent>
      </Card>
    </div>
  );
}
