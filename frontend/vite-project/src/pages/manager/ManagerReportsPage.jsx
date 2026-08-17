import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { managerApi } from "../../api/managerApi";
import DashboardCard from "../../components/manager/DashboardCard";
import ManagerHeader from "../../components/manager/ManagerHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

export default function ManagerReportsPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await managerApi.getMetrics();
        setOverview(response?.data?.data || null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      <ManagerHeader user={{ firstName: "Manager", lastName: "" }} orgPath="Reports & Analytics" managerRole="Manager" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Reports" value={overview?.summary?.totalCases || 0} caption="Current report summary" icon={BarChart3} accent="rose" loading={loading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Realtime manager insights stay rooted in the scoped dashboard route and backend analytics view.</p>
        </CardContent>
      </Card>
    </div>
  );
}
