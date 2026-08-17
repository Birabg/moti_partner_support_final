import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { managerApi } from "../../api/managerApi";
import DashboardCard from "../../components/manager/DashboardCard";
import ManagerHeader from "../../components/manager/ManagerHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function ManagerCasesPage() {
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

  const cases = overview?.caseMetrics?.cases || [];

  return (
    <div className="space-y-6">
      <ManagerHeader user={{ firstName: "Manager", lastName: "" }} orgPath="Case Oversight" managerRole="Manager" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Cases" value={overview?.caseMetrics?.totalAssignedCases || cases.length || 0} caption="Latest cases within manager scope" icon={ClipboardList} accent="amber" loading={loading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Scope Cases</CardTitle>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <p className="text-sm text-slate-500">No cases have been returned for this scope.</p>
          ) : (
            <div className="space-y-3">
              {cases.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{item.caseNumber || item.id}</p>
                  <p className="text-sm text-slate-500">{item.subject || "No subject available"}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
