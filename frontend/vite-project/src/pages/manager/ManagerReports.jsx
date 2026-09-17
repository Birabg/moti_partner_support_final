import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { managerApi } from "../../api/managerApi";
import { useAuth } from "../../context/useAuth";
import ManagerHeader from "../../components/manager/ManagerHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ManagerReports() {
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

    const handleCasesUpdated = () => {
      load();
    };

    window.addEventListener("cases:updated", handleCasesUpdated);

    return () => {
      window.removeEventListener("cases:updated", handleCasesUpdated);
    };
  }, []);

  const scope = snapshot?.department?.name || snapshot?.division?.name || snapshot?.section?.name || "Current scope";
  const totalCases = snapshot?.caseMetrics?.totalAssignedCases || 0;
  const totalStaff = snapshot?.hierarchyMetrics?.totalSectionStaffCount || snapshot?.hierarchyMetrics?.totalDivisionStaffCount || snapshot?.hierarchyMetrics?.totalDepartmentStaffCount || 0;
  const monthlyCases = buildMonthlyTrend(snapshot?.caseMetrics?.cases || []);

  return (
    <div className="space-y-6">
      <ManagerHeader user={user} orgPath={scope} managerRole={user?.managerType || "Manager"} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Scoped Cases" value={totalCases} subtitle="Cases visible in the current manager scope" />
        <StatCard title="Scoped Staff" value={totalStaff} subtitle="Staff within the current manager scope" />
        <StatCard title="Current Scope" value={scope} subtitle="Operational analytics context" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case workload overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-5 text-sm text-slate-500">Monthly case volume in the current manager scope.</p>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCases} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe7f5" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value} cases`, "Cases"]} cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} />
                <Bar dataKey="cases" radius={[6, 6, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-medium text-slate-600">{title}</div>
      <div className="mt-3 text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
    </div>
  );
}

function buildMonthlyTrend(cases = []) {
  const counts = Object.fromEntries(MONTHS.map((month) => [month, 0]));

  cases.forEach((item) => {
    const created = item?.createdAt || item?.date;
    if (!created) return;

    const date = new Date(created);
    if (Number.isNaN(date.getTime())) return;

    const month = MONTHS[date.getMonth()];
    if (month && counts[month] !== undefined) {
      counts[month] += 1;
    }
  });

  return MONTHS.map((month) => ({ month, cases: counts[month] || 0 }));
}

