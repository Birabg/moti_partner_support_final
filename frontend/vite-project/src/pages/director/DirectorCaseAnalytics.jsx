import { useEffect, useMemo, useState } from "react";
import { FaChartBar, FaClipboardList, FaCheckCircle } from "react-icons/fa";
import { directorApi } from "../../api/directorApi";
import DirectorHeader from "../../components/director/DirectorHeader";
import CaseStats from "../../components/cases/CaseStats";
import CasesAnalytics from "../../components/admin/CasesAnalytics";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

export default function DirectorCaseAnalytics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadMetrics() {
      try {
        setLoading(true);
        const response = await directorApi.getCaseAnalytics();
        if (!isMounted) return;
        setMetrics(response?.data?.data || {});
      } catch (caughtError) {
        console.error(caughtError);
        if (isMounted) setError("Unable to load case analytics.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMetrics();

    // Listen for case updates and refresh analytics
    const handleCasesUpdated = () => {
      loadMetrics();
    };

    window.addEventListener("cases:updated", handleCasesUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("cases:updated", handleCasesUpdated);
    };
  }, []);

  const summary = metrics || {};

  const statusCases = useMemo(() => {
    const buildList = (status, count) => Array.from({ length: Number(count || 0) }, () => ({ status }));

    return [
      ...buildList("OPEN", summary.open),
      ...buildList("ASSIGNED", summary.assigned ?? summary.ASSIGNED ?? 0),
      ...buildList("IN_PROGRESS", summary.inProgress),
      ...buildList("PENDING", summary.pending ?? summary.PENDING ?? 0),
      ...buildList("ESCALATED", summary.escalated ?? summary.ESCALATED ?? 0),
      ...buildList("RESOLVED", summary.resolved ?? summary.RESOLVED ?? 0),
      ...buildList("CUSTOMER_CONFIRMATION", summary.customerConfirmation ?? summary.CUSTOMER_CONFIRMATION ?? 0),
      ...buildList("CLOSED", summary.closed ?? summary.CLOSED ?? 0),
    ];
  }, [summary]);

  return (
    <div className="space-y-6">
      <DirectorHeader
        eyebrow="Director"
        title="Case Analytics"
        subtitle="Global case trends and status metrics"
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <CaseStats cases={statusCases} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <CasesAnalytics />
      </div>

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-slate-900">Case progress</h2>
          <p className="mt-4 text-sm text-slate-600">This summary is driven by the backend global case metrics endpoint.</p>
        </CardContent>
      </Card>
    </div>
  );
}

