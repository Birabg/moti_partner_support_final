import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { managerApi } from "../../api/managerApi";
import { useAuth } from "../../context/useAuth";
import DashboardCard from "../../components/manager/DashboardCard";
import ManagerHeader from "../../components/manager/ManagerHeader";
import CaseTable from "../../components/manager/CaseTable";
import { Card, CardContent } from "../../components/ui/card";

export default function ManagerCases() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await managerApi.getScopeOverview();
        if (!cancelled) {
          setSnapshot(response?.data?.data || null);
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

  const cases = snapshot?.caseMetrics?.cases || [];
  const scopeName = snapshot?.department?.name || snapshot?.division?.name || snapshot?.section?.name || "Case Oversight";

  return (
    <div className="space-y-6">
      <ManagerHeader user={user} orgPath={scopeName} managerRole={user?.managerType || "Manager"} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <DashboardCard title="Cases" value={snapshot?.caseMetrics?.totalAssignedCases || cases.length || 0} caption="Cases in current scope" icon={ClipboardList} accent="amber" loading={loading} />
      </div>
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-md font-semibold text-slate-900">Managed Cases</h2>
          <CaseTable rows={cases} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
