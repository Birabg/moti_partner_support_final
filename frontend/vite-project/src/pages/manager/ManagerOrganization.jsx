import { useEffect, useState } from "react";
import { Building2, Users } from "lucide-react";
import { managerApi } from "../../api/managerApi";
import { useAuth } from "../../context/useAuth";
import DashboardCard from "../../components/manager/DashboardCard";
import ManagerHeader from "../../components/manager/ManagerHeader";
import OrganizationTree from "../../components/manager/OrganizationTree";
import { Card, CardContent } from "../../components/ui/card";

export default function ManagerOrganization() {
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

  const scope = snapshot?.department || snapshot?.division || snapshot?.section || {};
  const hierarchy = snapshot?.hierarchyMetrics || {};

  return (
    <div className="space-y-6">
      <ManagerHeader user={user} orgPath={scope.name || "Organization Overview"} managerRole={user?.managerType || "Manager"} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <DashboardCard title="Scope" value={scope.name || "—"} caption="Current manager scope" icon={Building2} accent="blue" loading={loading} />
        <DashboardCard title="Staff" value={hierarchy.totalSectionStaffCount || hierarchy.totalDivisionStaffCount || hierarchy.totalDepartmentStaffCount || 0} caption="Visible staff in scope" icon={Users} accent="violet" loading={loading} />
      </div>
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-md font-semibold text-slate-900">Organization Tree</h2>
          <OrganizationTree snapshot={snapshot} />
        </CardContent>
      </Card>
    </div>
  );
}
