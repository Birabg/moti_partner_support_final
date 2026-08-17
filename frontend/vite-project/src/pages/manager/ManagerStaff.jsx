import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { managerApi } from "../../api/managerApi";
import { useAuth } from "../../context/useAuth";
import DashboardCard from "../../components/manager/DashboardCard";
import ManagerHeader from "../../components/manager/ManagerHeader";
import StaffTable from "../../components/manager/StaffTable";
import { Card, CardContent } from "../../components/ui/card";

export default function ManagerStaff() {
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

  const staff = snapshot?.hierarchyMetrics?.staffMembers || [];
  const scopeName = snapshot?.department?.name || snapshot?.division?.name || snapshot?.section?.name || "Staff Directory";

  return (
    <div className="space-y-6">
      <ManagerHeader user={user} orgPath={scopeName} managerRole={user?.managerType || "Manager"} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <DashboardCard title="Staff Members" value={staff.length || 0} caption="Visible staff in scope" icon={Users} accent="green" loading={loading} />
      </div>
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-md font-semibold text-slate-900">Staff Table</h2>
          <StaffTable rows={staff} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
