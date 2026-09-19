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
import {
  BarChart3,
  Building2,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { managerApi } from "../../api/managerApi";
import { useAuth } from "../../context/useAuth";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ManagerReports() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await managerApi.getScopeOverview();
      setSnapshot(response?.data?.data || null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();

    const handleCasesUpdated = () => {
      load();
    };

    window.addEventListener("cases:updated", handleCasesUpdated);

    return () => {
      window.removeEventListener("cases:updated", handleCasesUpdated);
    };
  }, []);

  const scope =
    snapshot?.department?.name ||
    snapshot?.division?.name ||
    snapshot?.section?.name ||
    "Current scope";

  const managerRole = user?.managerType || "Manager";

  const totalCases = snapshot?.caseMetrics?.totalAssignedCases || 0;
  const totalStaff =
    snapshot?.hierarchyMetrics?.totalSectionStaffCount ||
    snapshot?.hierarchyMetrics?.totalDivisionStaffCount ||
    snapshot?.hierarchyMetrics?.totalDepartmentStaffCount ||
    0;

  const monthlyCases = buildMonthlyTrend(snapshot?.caseMetrics?.cases || []);

  return (
    <div className="min-h-full bg-slate-50/70">
      <main className="ps-container space-y-7 pb-12">

        <section className="relative overflow-hidden rounded-[26px] bg-[#0b1d38] shadow-[0_16px_40px_rgba(15,35,65,0.10)]">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-7 px-6 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Analytics Workspace
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                Reports
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Case analytics and workload trends for your management scope.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[10px] font-medium text-slate-300">
                  <Building2 className="h-3 w-3" />
                  {scope}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[10px] font-medium text-slate-300">
                  <UserCheck className="h-3 w-3" />
                  {managerRole}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[10px] font-medium text-slate-300">
                  <ShieldCheck className="h-3 w-3" />
                  Manager Access
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => load(true)}
              disabled={loading || refreshing}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-[#0b1d38] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={
                  refreshing
                    ? "h-3.5 w-3.5 animate-spin"
                    : "h-3.5 w-3.5"
                }
              />
              Refresh
            </button>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600">
              Performance Overview
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-slate-950">
              Scoped analytics
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Scoped Cases"
              value={totalCases}
              subtitle="Cases visible in the current manager scope"
              loading={loading}
            />
            <StatCard
              title="Scoped Staff"
              value={totalStaff}
              subtitle="Staff within the current manager scope"
              loading={loading}
            />
            <StatCard
              title="Current Scope"
              value={scope}
              subtitle="Operational analytics context"
              loading={loading}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,35,65,0.045)]">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
                Case Analytics
              </p>
              <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                Case workload overview
              </h2>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <p className="mb-5 text-sm text-slate-500">
              Monthly case volume in the current manager scope.
            </p>
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
          </div>
        </section>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-[0_4px_18px_rgba(15,35,65,0.035)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Manager workspace
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                Analytics are scoped to your assigned organizational unit.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

function StatCard({ title, value, subtitle, loading }) {
  return (
    <div className="group rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_25px_rgba(15,35,65,0.045)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,32,55,0.07)]">
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <div className="mt-1.5">
        {loading ? (
          <div className="h-9 w-24 animate-pulse rounded-md bg-slate-100" />
        ) : (
          <p className="truncate text-3xl font-semibold tracking-[-0.04em] text-slate-950">
            {value}
          </p>
        )}
      </div>
      <p className="mt-2 text-[10px] text-slate-400">{subtitle}</p>
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