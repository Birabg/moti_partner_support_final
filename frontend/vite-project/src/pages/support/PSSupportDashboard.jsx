import { useEffect, useMemo, useState } from "react";
import { Loader2, ClipboardList, Star, ArrowRightLeft } from "lucide-react";
import SupportHeader from "../../components/support/SupportHeader";
import AssignedCasesTable from "../../components/support/AssignedCasesTable";
import RecentFeedback from "../../components/support/RecentFeedback";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

import SupportApi from "../../api/supportApi";

export default function PSSupportDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await SupportApi.getDashboard();
        if (!cancelled) setOverview(res?.data?.data || {});
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();

    const handleCaseUpdated = () => load();
    window.addEventListener("cases:updated", handleCaseUpdated);
    window.addEventListener("focus", handleCaseUpdated);

    const refreshTimer = window.setInterval(load, 15000);

    return () => {
      cancelled = true;
      window.removeEventListener("cases:updated", handleCaseUpdated);
      window.removeEventListener("focus", handleCaseUpdated);
      window.clearInterval(refreshTimer);
    };
  }, []);

  const stats = useMemo(() => {
    const m = overview?.workloadMetrics || {};
    return [
      { label: "Assigned Cases", value: m.totalAssignedHistorically ?? 0, icon: ClipboardList },
      { label: "Open", value: m.activeOpenCount ?? 0, icon: ArrowRightLeft },
      { label: "In Progress", value: m.activeInProgressCount ?? 0, icon: ArrowRightLeft },
      { label: "Resolved", value: m.historicalClosedCount ?? 0, icon: Star },
      { label: "Avg Rating", value: m.averageFeedbackRatingReceived ?? "-", icon: Star },
    ];
  }, [overview]);

  return (
    <div className="space-y-6">
      <SupportHeader compactTitle="My Assigned Work" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{label}</CardTitle>
              <Icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-navy-500" /> : value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Assigned Cases</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{overview?.activeWorkloadList?.length || 0}</span>
            </div>
            <div className="mt-4">
              <AssignedCasesTable rows={overview?.activeWorkloadList || []} loading={loading} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-slate-900">
              <Star className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold">Recent Feedback</h2>
            </div>
            <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
              <RecentFeedback items={(overview?.historicalClosedList || []).slice(0, 3)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
