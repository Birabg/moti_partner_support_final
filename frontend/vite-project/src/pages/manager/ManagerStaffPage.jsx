import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { managerApi } from "../../api/managerApi";
import DashboardCard from "../../components/manager/DashboardCard";
import ManagerHeader from "../../components/manager/ManagerHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

export default function ManagerStaffPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await managerApi.getScopeOverview();
        setOverview(response?.data?.data || null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const staff = overview?.hierarchyMetrics?.staffMembers || [];

  return (
    <div className="space-y-6">
      <ManagerHeader user={{ firstName: "Manager", lastName: "" }} orgPath="Staff Directory" managerRole="Manager" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Staff Members" value={staff.length || 0} caption="Visible staff in scope" icon={Users} accent="green" loading={loading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Staff</CardTitle>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <p className="text-sm text-slate-500">No staff members were returned for this scope.</p>
          ) : (
            <div className="space-y-3">
              {staff.slice(0, 8).map((member, index) => (
                <Card key={member.id || `${member.name}-${index}`} className="p-4">
                  <CardTitle className="text-base">{member.name || member.manager || member.title || "Staff Member"}</CardTitle>
                  <CardContent>{member.email || member.role || "No email on file"}</CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

