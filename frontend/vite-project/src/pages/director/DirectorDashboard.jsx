import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaChartBar, FaUsers, FaBuilding, FaSitemap, FaClipboardList } from "react-icons/fa";
import { directorApi } from "../../api/directorApi";
import DirectorHeader from "../../components/director/DirectorHeader";
import CaseStats from "../../components/cases/CaseStats";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

export default function DirectorDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        setLoading(true);
        setError("");

        const [caseResp, orgListResp, userResp] = await Promise.all([
          directorApi.getCaseAnalytics(),
          directorApi.getOrganizationListAdmin(),
          directorApi.getUsersOverview(),
        ]);

        if (!isMounted) return;

        const caseSummary = caseResp?.data?.data || {};
        const orgList = orgListResp?.data?.data || [];
        const usersData = userResp?.data || {};

        setSummary({
          caseSummary,
          organizations: orgList,
          totalOrganizations: orgList.filter((o) => o.isActive !== false).length,
          activeUsers: usersData.count ?? (usersData.data?.length ?? 0),
        });
      } catch (caughtError) {
        // eslint-disable-next-line no-console
        console.error('Director dashboard load error', caughtError);
        const apiMessage = caughtError?.response?.data?.message || caughtError?.response?.data || caughtError?.message || String(caughtError);
        if (isMounted) {
          setError(`Unable to load director analytics: ${apiMessage}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    // Listen for case updates and refresh summary
    const handleCasesUpdated = () => {
      loadSummary();
    };

    window.addEventListener("cases:updated", handleCasesUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("cases:updated", handleCasesUpdated);
    };
  }, []);

  const caseSummary = summary?.caseSummary || {};

  const statusCases = useMemo(() => {
    const buildList = (status, count) => Array.from({ length: Number(count || 0) }, () => ({ status }));

    return [
      ...buildList("OPEN", caseSummary.open),
      ...buildList("ASSIGNED", caseSummary.assigned ?? caseSummary.ASSIGNED ?? 0),
      ...buildList("IN_PROGRESS", caseSummary.inProgress),
      ...buildList("PENDING", caseSummary.pending ?? caseSummary.PENDING ?? 0),
      ...buildList("ESCALATED", caseSummary.escalated ?? caseSummary.ESCALATED ?? 0),
      ...buildList("RESOLVED", caseSummary.resolved ?? caseSummary.RESOLVED ?? 0),
      ...buildList("CUSTOMER_CONFIRMATION", caseSummary.customerConfirmation ?? caseSummary.CUSTOMER_CONFIRMATION ?? 0),
      ...buildList("CLOSED", caseSummary.closed ?? caseSummary.CLOSED ?? 0),
    ];
  }, [caseSummary]);

  const stats = [
    { label: "Active Organizations", value: loading ? "—" : summary?.totalOrganizations || 0, icon: FaBuilding },
    { label: "Active Users", value: loading ? "—" : summary?.activeUsers || 0, icon: FaUsers },
  ];

  const quickLinks = [
    { to: "/director/users", label: "Users", value: "View active users", icon: FaUsers },
    { to: "/director/department-management", label: "Department Management", value: "Unit hierarchy", icon: FaSitemap },
    { to: "/director/case-analytics", label: "Case Analytics", value: "Performance view", icon: FaChartBar },
  ];

  const handleStatusClick = (status) => {
    // Notify other pages that cases changed / filters should update.
    // Include status in detail for potential listeners, but maintain backwards compatibility.
    try {
      window.dispatchEvent(new CustomEvent("cases:updated", { detail: { status } }));
    } catch (err) {
      // Fallback to simple event if CustomEvent fails in some environments
      window.dispatchEvent(new CustomEvent("cases:updated"));
    }
  };

  return (
    <div className="space-y-6">
      <DirectorHeader
        eyebrow="Director Dashboard"
        title="Executive Overview"
        subtitle="High-level organization and case insights"
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <CaseStats cases={statusCases} onStatusClick={handleStatusClick} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{label}</CardTitle>
              <Icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-md font-semibold text-slate-900">Director quick links</h2>
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            {quickLinks.map(({ to, label, value, icon: Icon }) => (
              <Link key={to} to={to} className="rounded-md border border-slate-200 p-4 hover:border-navy-300 hover:bg-navy-50/40 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <h3 className="font-semibold text-slate-900 mt-1">{value}</h3>
                  </div>
                  <Icon className="h-5 w-5 text-navy-500" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-slate-900">
            <FaBuilding className="h-5 w-5 text-navy-600" />
            <h2 className="text-lg font-semibold">Organization overview</h2>
          </div>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading organizations...</p>
            ) : !summary || (summary.organizations?.length === 0) ? (
              <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">No organization summary available.</p>
            ) : (
              summary.organizations.slice(0, 4).map((org) => (
                <div key={org.id} className="rounded-md border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{org.name || org.code || "Organization"}</p>
                  <p className="text-sm text-slate-500">Cases: {org.metrics?.totalCasesCount ?? org.totalCasesCount ?? 0}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
