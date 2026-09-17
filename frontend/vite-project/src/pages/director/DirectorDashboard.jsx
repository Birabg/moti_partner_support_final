import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaArrowUp,
  FaBuilding,
  FaChartBar,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaExclamationTriangle,
  FaLayerGroup,
  FaSitemap,
  FaUsers,
} from "react-icons/fa";
import { directorApi } from "../../api/directorApi";

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
          totalOrganizations: orgList.filter(
            (organization) => organization.isActive !== false
          ).length,
          activeUsers:
            usersData.count ??
            (Array.isArray(usersData.data) ? usersData.data.length : 0),
        });
      } catch (caughtError) {
        console.error("Director dashboard load error", caughtError);

        const apiMessage =
          caughtError?.response?.data?.message ||
          caughtError?.response?.data ||
          caughtError?.message ||
          String(caughtError);

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

  /*
  ============================================================
  CASE COUNTS
  ============================================================
  */

  const caseMetrics = useMemo(() => {
    const open = Number(caseSummary.open || 0);

    const assigned = Number(
      caseSummary.assigned ??
        caseSummary.ASSIGNED ??
        0
    );

    const inProgress = Number(caseSummary.inProgress || 0);

    const pending = Number(
      caseSummary.pending ??
        caseSummary.PENDING ??
        0
    );

    const escalated = Number(
      caseSummary.escalated ??
        caseSummary.ESCALATED ??
        0
    );

    const resolved = Number(
      caseSummary.resolved ??
        caseSummary.RESOLVED ??
        0
    );

    const customerConfirmation = Number(
      caseSummary.customerConfirmation ??
        caseSummary.CUSTOMER_CONFIRMATION ??
        0
    );

    const closed = Number(
      caseSummary.closed ??
        caseSummary.CLOSED ??
        0
    );

    const total =
      open +
      assigned +
      inProgress +
      pending +
      escalated +
      resolved +
      customerConfirmation +
      closed;

    const completed = resolved + closed;

    const resolutionRate =
      total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    return {
      open,
      assigned,
      inProgress,
      pending,
      escalated,
      resolved,
      customerConfirmation,
      closed,
      completed,
      total,
      resolutionRate,
    };
  }, [caseSummary]);

  /*
  ============================================================
  STATUS DATA
  ============================================================
  */

  const statusItems = [
    {
      label: "Open",
      value: caseMetrics.open,
      description: "Awaiting action",
      icon: FaClock,
      bar: "bg-[#527eb9]",
      iconBox: "bg-[#edf4fd] text-[#527eb9]",
    },
    {
      label: "Assigned",
      value: caseMetrics.assigned,
      description: "Assigned to support",
      icon: FaClipboardList,
      bar: "bg-[#6489bd]",
      iconBox: "bg-[#edf4fd] text-[#527eb9]",
    },
    {
      label: "In Progress",
      value: caseMetrics.inProgress,
      description: "Currently being handled",
      icon: FaLayerGroup,
      bar: "bg-[#c58a27]",
      iconBox: "bg-[#fff7e8] text-[#c58a27]",
    },
    {
      label: "Pending",
      value: caseMetrics.pending,
      description: "Waiting for action",
      icon: FaClock,
      bar: "bg-[#b88b4a]",
      iconBox: "bg-[#fff7e8] text-[#b88b4a]",
    },
    {
      label: "Escalated",
      value: caseMetrics.escalated,
      description: "Requires attention",
      icon: FaExclamationTriangle,
      bar: "bg-[#c65b5b]",
      iconBox: "bg-[#fdf0f0] text-[#c65b5b]",
    },
    {
      label: "Resolved",
      value: caseMetrics.resolved,
      description: "Resolution completed",
      icon: FaCheckCircle,
      bar: "bg-[#37876c]",
      iconBox: "bg-[#edf8f4] text-[#37876c]",
    },
  ];

  /*
  ============================================================
  ORGANIZATION PERFORMANCE
  ============================================================
  */

  const organizationRows = useMemo(() => {
    return (summary?.organizations || [])
      .slice(0, 6)
      .map((organization) => {
        const cases =
          Number(
            organization.metrics?.totalCasesCount ??
              organization.totalCasesCount ??
              0
          );

        return {
          ...organization,
          cases,
        };
      });
  }, [summary]);

  /*
  ============================================================
  QUICK ACTIONS
  ============================================================
  */

  const quickLinks = [
    {
      to: "/director/users",
      label: "Users",
      description: "Manage active users",
      icon: FaUsers,
    },
    {
      to: "/director/department-management",
      label: "Departments",
      description: "Manage organizational hierarchy",
      icon: FaSitemap,
    },
    {
      to: "/director/case-analytics",
      label: "Case Analytics",
      description: "Review support performance",
      icon: FaChartBar,
    },
  ];

  /*
  ============================================================
  LOADING STATE
  ============================================================
  */

  if (loading && !summary) {
    return (
      <div className="min-h-full space-y-7">

        <div className="h-[250px] animate-pulse rounded-[24px] bg-[#10233e]" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[150px] animate-pulse rounded-[20px] bg-white border border-slate-200"
            />
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="h-[380px] animate-pulse rounded-[22px] bg-white border border-slate-200" />
          <div className="h-[380px] animate-pulse rounded-[22px] bg-white border border-slate-200" />
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-full space-y-7">

      {/* ======================================================
          EXECUTIVE HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-[24px] bg-[#0b1b33] text-white shadow-[0_18px_50px_rgba(11,27,51,0.14)]">

        <div className="pointer-events-none absolute -right-32 -top-40 h-[430px] w-[430px] rounded-full bg-[#416da8]/20 blur-[95px]" />

        <div className="pointer-events-none absolute -bottom-48 left-1/3 h-[380px] w-[380px] rounded-full bg-[#658abd]/10 blur-[100px]" />

        <div
          className="
            pointer-events-none absolute inset-0 opacity-[0.045]
            [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
            [background-size:36px_36px]
          "
        />

        <div className="relative z-10 px-6 py-8 sm:px-9 sm:py-10">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-2xl">

              <div className="mb-5 flex items-center gap-2">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                  Executive Workspace
                </span>

              </div>

              <h1 className="font-display text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
                Executive Overview
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                Monitor organization-wide support performance,
                case health, user activity, and operational trends
                from one central workspace.
              </p>

            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">

              <div className="rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur-md">

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">
                  Organizations
                </p>

                <p className="mt-1 font-display text-xl font-bold tracking-[-0.03em]">
                  {summary?.totalOrganizations || 0}
                </p>

              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur-md">

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">
                  Active users
                </p>

                <p className="mt-1 font-display text-xl font-bold tracking-[-0.03em]">
                  {summary?.activeUsers || 0}
                </p>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">

          <FaExclamationTriangle className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">
              Dashboard data unavailable
            </p>

            <p className="mt-1 text-xs text-red-600/80">
              {error}
            </p>
          </div>

        </div>
      )}

      {/* ======================================================
          EXECUTIVE KPIs
      ====================================================== */}

      <section>

        <div className="mb-4 flex items-end justify-between">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#567fbd]">
              Organization
            </p>

            <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
              Performance at a glance
            </h2>
          </div>

          <div className="hidden items-center gap-2 text-[10px] text-slate-400 sm:flex">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            Live overview

          </div>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL CASES */}

          <ExecutiveMetric
            label="Total Cases"
            value={caseMetrics.total}
            description="Across all organizations"
            icon={FaClipboardList}
            tone="blue"
          />

          {/* ACTIVE ORGANIZATIONS */}

          <ExecutiveMetric
            label="Active Organizations"
            value={summary?.totalOrganizations || 0}
            description="Organizations currently active"
            icon={FaBuilding}
            tone="blue"
          />

          {/* ACTIVE USERS */}

          <ExecutiveMetric
            label="Active Users"
            value={summary?.activeUsers || 0}
            description="Users currently active"
            icon={FaUsers}
            tone="blue"
          />

          {/* RESOLUTION */}

          <ExecutiveMetric
            label="Resolution Rate"
            value={`${caseMetrics.resolutionRate}%`}
            description={`${caseMetrics.completed} completed cases`}
            icon={FaCheckCircle}
            tone="green"
          />

        </div>
      </section>

      {/* ======================================================
          CASE PERFORMANCE + STATUS
      ====================================================== */}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">

        {/* CASE PERFORMANCE */}

        <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

            <div className="flex items-start justify-between gap-4">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4fd] text-[#527eb9]">
                    <FaChartBar className="text-sm" />
                  </div>

                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Support operations
                    </p>

                    <h2 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
                      Case performance
                    </h2>

                  </div>

                </div>

                <p className="mt-3 text-[11px] leading-5 text-slate-400">
                  Current distribution of support cases across the
                  organization.
                </p>

              </div>

              <div className="hidden text-right sm:block">

                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Completion
                </p>

                <p className="mt-1 font-display text-2xl font-bold tracking-[-0.04em] text-[#37876c]">
                  {caseMetrics.resolutionRate}%
                </p>

              </div>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            <div className="space-y-4">

              {statusItems.map((item) => {

                const percentage =
                  caseMetrics.total > 0
                    ? Math.max(
                        item.value > 0 ? 4 : 0,
                        Math.round(
                          (item.value / caseMetrics.total) * 100
                        )
                      )
                    : 0;

                const Icon = item.icon;

                return (
                  <div key={item.label}>

                    <div className="mb-2 flex items-center justify-between">

                      <div className="flex items-center gap-2.5">

                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.iconBox}`}
                        >
                          <Icon className="text-xs" />
                        </div>

                        <div>

                          <p className="text-[11px] font-semibold text-slate-600">
                            {item.label}
                          </p>

                          <p className="text-[9px] text-slate-400">
                            {item.description}
                          </p>

                        </div>

                      </div>

                      <span className="font-display text-sm font-bold text-[#101a28]">
                        {item.value}
                      </span>

                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className={`h-full rounded-full ${item.bar} transition-all duration-700`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              })}

            </div>

            <div className="mt-7 grid grid-cols-3 gap-3">

              <MiniMetric
                label="Resolved"
                value={caseMetrics.resolved}
              />

              <MiniMetric
                label="Closed"
                value={caseMetrics.closed}
              />

              <MiniMetric
                label="Escalated"
                value={caseMetrics.escalated}
              />

            </div>

          </div>
        </section>

        {/* EXECUTIVE HEALTH */}

        <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

          <div className="border-b border-slate-100 px-5 py-5">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf8f4] text-[#37876c]">
                <FaCheckCircle className="text-sm" />
              </div>

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Executive health
                </p>

                <h2 className="mt-0.5 text-base font-bold text-[#101a28]">
                  Operational snapshot
                </h2>

              </div>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            {/* Resolution ring */}

            <div className="flex items-center gap-5 rounded-2xl bg-slate-50/80 p-5">

              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">

                <svg
                  viewBox="0 0 100 100"
                  className="h-24 w-24 -rotate-90"
                >

                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-200"
                  />

                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-[#37876c]"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={
                      2 *
                      Math.PI *
                      40 *
                      (1 -
                        caseMetrics.resolutionRate /
                          100)
                    }
                  />

                </svg>

                <div className="absolute text-center">

                  <p className="font-display text-xl font-bold tracking-[-0.04em] text-[#101a28]">
                    {caseMetrics.resolutionRate}%
                  </p>

                </div>

              </div>

              <div>

                <p className="text-[11px] font-bold text-[#101a28]">
                  Resolution performance
                </p>

                <p className="mt-1 text-[10px] leading-5 text-slate-400">
                  {caseMetrics.completed} of{" "}
                  {caseMetrics.total} tracked cases have
                  reached resolution or closure.
                </p>

              </div>

            </div>

            {/* Attention */}

            <div className="mt-4 rounded-2xl border border-[#f0e0c4] bg-[#fffaf1] p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff0d4] text-[#c58a27]">
                  <FaExclamationTriangle className="text-xs" />
                </div>

                <div>

                  <p className="text-[11px] font-bold text-[#101a28]">
                    Cases requiring attention
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-slate-500">
                    {caseMetrics.escalated} escalated cases
                    are currently present in the support
                    workload.
                  </p>

                </div>

              </div>

              <Link
                to="/director/case-analytics"
                className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#527eb9] transition-colors hover:text-[#1a345b]"
              >
                Review analytics
                <FaArrowRight className="text-[9px]" />
              </Link>

            </div>

          </div>
        </section>
      </div>

      {/* ======================================================
          ORGANIZATION PERFORMANCE
      ====================================================== */}

      <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Organization
            </p>

            <h2 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
              Organization performance
            </h2>

          </div>

          <span className="text-[10px] text-slate-400">
            Active organizations
          </span>

        </div>

        {organizationRows.length === 0 ? (

          <div className="px-6 py-12 text-center">

            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-300">
              <FaBuilding />
            </div>

            <p className="mt-3 text-[11px] font-semibold text-slate-500">
              No organization summary available
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[680px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/50">

                  <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Organization
                  </th>

                  <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Cases
                  </th>

                  <th className="px-6 py-3 text-right text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Overview
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {organizationRows.map((organization) => {

                  const isActive =
                    organization.isActive !== false;

                  const organizationShare =
                    caseMetrics.total > 0
                      ? Math.round(
                          (organization.cases /
                            caseMetrics.total) *
                            100
                        )
                      : 0;

                  return (
                    <tr
                      key={organization.id}
                      className="group transition-colors hover:bg-slate-50/60"
                    >

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4fd] text-[#527eb9]">
                            <FaBuilding className="text-xs" />
                          </div>

                          <div>

                            <p className="text-[11px] font-bold text-[#101a28]">
                              {organization.name ||
                                organization.code ||
                                "Organization"}
                            </p>

                            {organization.code &&
                              organization.name && (
                                <p className="mt-0.5 text-[9px] text-slate-400">
                                  {organization.code}
                                </p>
                              )}

                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`
                            inline-flex items-center gap-1.5
                            rounded-full px-2.5 py-1
                            text-[9px] font-bold
                            ${
                              isActive
                                ? "bg-[#edf8f4] text-[#37876c]"
                                : "bg-slate-100 text-slate-500"
                            }
                          `}
                        >

                          <span
                            className={`
                              h-1.5 w-1.5 rounded-full
                              ${
                                isActive
                                  ? "bg-[#37876c]"
                                  : "bg-slate-400"
                              }
                            `}
                          />

                          {isActive
                            ? "Active"
                            : "Inactive"}

                        </span>

                      </td>

                      <td className="px-6 py-4 text-right">

                        <span className="font-display text-sm font-bold text-[#101a28]">
                          {organization.cases}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex items-center justify-end gap-3">

                          <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 sm:block">

                            <div
                              className="h-full rounded-full bg-[#527eb9]"
                              style={{
                                width: `${Math.min(
                                  organizationShare,
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                          <span className="w-9 text-right text-[9px] font-semibold text-slate-400">
                            {organizationShare}%
                          </span>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* ======================================================
          QUICK ACTIONS
      ====================================================== */}

      <section>

        <div className="mb-4">

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#567fbd]">
            Management
          </p>

          <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
            Executive tools
          </h2>

        </div>

        <div className="grid gap-4 md:grid-cols-3">

          {quickLinks.map(
            ({ to, label, description, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="
                  group relative overflow-hidden
                  rounded-[20px]
                  border border-slate-200/80
                  bg-white
                  p-5
                  shadow-[0_8px_30px_rgba(16,32,55,0.045)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:border-slate-300
                  hover:shadow-[0_16px_38px_rgba(16,32,55,0.075)]
                "
              >

                <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-[#edf4fd] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10">

                  <div className="flex items-start justify-between">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4fd] text-[#527eb9]">
                      <Icon className="text-sm" />
                    </div>

                    <FaArrowUp className="rotate-45 text-xs text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#527eb9]" />

                  </div>

                  <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Director tool
                  </p>

                  <h3 className="mt-1.5 text-sm font-bold text-[#101a28]">
                    {label}
                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-slate-400">
                    {description}
                  </p>

                  <div className="mt-5 flex items-center gap-1.5 text-[10px] font-bold text-[#527eb9]">

                    Open workspace

                    <FaArrowRight className="text-[9px] transition-transform group-hover:translate-x-0.5" />

                  </div>

                </div>

              </Link>
            )
          )}

        </div>

      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-2">

          <FaBuilding className="text-[#567fbd]" />

          MOTI Partner Support Platform

        </div>

        <div>
          Executive organization workspace
        </div>

      </div>

    </div>
  );
}

/* ============================================================
   EXECUTIVE METRIC
============================================================ */

function ExecutiveMetric({
  label,
  value,
  description,
  icon: Icon,
  tone = "blue",
}) {
  const tones = {
    blue: {
      icon: "bg-[#edf4fd] text-[#527eb9]",
      line: "bg-[#527eb9]",
    },
    green: {
      icon: "bg-[#edf8f4] text-[#37876c]",
      line: "bg-[#37876c]",
    },
    amber: {
      icon: "bg-[#fff7e8] text-[#c58a27]",
      line: "bg-[#c58a27]",
    },
  };

  const currentTone = tones[tone] || tones.blue;

  return (
    <div
      className="
        group relative overflow-hidden
        rounded-[20px]
        border border-slate-200/80
        bg-white
        p-5
        shadow-[0_8px_30px_rgba(16,32,55,0.045)]
        transition-all duration-300
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:shadow-[0_16px_38px_rgba(16,32,55,0.075)]
      "
    >

      <div
        className={`
          absolute left-0 top-0
          h-[3px] w-0
          ${currentTone.line}
          transition-all duration-300
          group-hover:w-full
        `}
      />

      <div className="flex items-start justify-between">

        <div
          className={`
            flex h-10 w-10 items-center justify-center
            rounded-xl
            ${currentTone.icon}
          `}
        >
          <Icon className="text-sm" />
        </div>

        <FaArrowUp className="rotate-45 text-[10px] text-slate-300" />

      </div>

      <div className="mt-6">

        <p className="text-[10px] font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1.5 font-display text-[30px] font-bold tracking-[-0.045em] text-[#101a28]">
          {value}
        </p>

        <p className="mt-2 text-[10px] text-slate-400">
          {description}
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   MINI METRIC
============================================================ */

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">

      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 font-display text-lg font-bold tracking-[-0.03em] text-[#101a28]">
        {value}
      </p>

    </div>
  );
}
