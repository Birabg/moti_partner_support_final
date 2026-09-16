import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaArrowUp,
  FaChartBar,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaExclamationTriangle,
  FaLayerGroup,
  FaSyncAlt,
} from "react-icons/fa";

import { directorApi } from "../../api/directorApi";

export default function DirectorCaseAnalytics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadMetrics(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await directorApi.getCaseAnalytics();

      setMetrics(response?.data?.data || {});
    } catch (caughtError) {
      console.error("Director case analytics error", caughtError);

      const apiMessage =
        caughtError?.response?.data?.message ||
        caughtError?.response?.data ||
        caughtError?.message ||
        "Unable to load case analytics.";

      setError(String(apiMessage));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        setLoading(true);
        setError("");

        const response = await directorApi.getCaseAnalytics();

        if (!isMounted) return;

        setMetrics(response?.data?.data || {});
      } catch (caughtError) {
        console.error("Director case analytics error", caughtError);

        if (isMounted) {
          const apiMessage =
            caughtError?.response?.data?.message ||
            caughtError?.response?.data ||
            caughtError?.message ||
            "Unable to load case analytics.";

          setError(String(apiMessage));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    const handleCasesUpdated = () => {
      loadMetrics(true);
    };

    window.addEventListener("cases:updated", handleCasesUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("cases:updated", handleCasesUpdated);
    };
  }, []);

  const caseMetrics = useMemo(() => {
    const data = metrics || {};

    const open = Number(data.open ?? data.OPEN ?? 0);

    const assigned = Number(
      data.assigned ??
        data.ASSIGNED ??
        0
    );

    const inProgress = Number(
      data.inProgress ??
        data.IN_PROGRESS ??
        0
    );

    const pending = Number(
      data.pending ??
        data.PENDING ??
        0
    );

    const escalated = Number(
      data.escalated ??
        data.ESCALATED ??
        0
    );

    const resolved = Number(
      data.resolved ??
        data.RESOLVED ??
        0
    );

    const customerConfirmation = Number(
      data.customerConfirmation ??
        data.CUSTOMER_CONFIRMATION ??
        0
    );

    const closed = Number(
      data.closed ??
        data.CLOSED ??
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

    const active =
      open +
      assigned +
      inProgress +
      pending +
      escalated +
      customerConfirmation;

    const completed = resolved + closed;

    const resolutionRate =
      total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    const activeRate =
      total > 0
        ? Math.round((active / total) * 100)
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
      total,
      active,
      completed,
      resolutionRate,
      activeRate,
    };
  }, [metrics]);

  const statusItems = [
    {
      label: "Open",
      value: caseMetrics.open,
      description: "Awaiting initial action",
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
      description: "Requires management attention",
      icon: FaExclamationTriangle,
      bar: "bg-[#c65b5b]",
      iconBox: "bg-[#fdf0f0] text-[#c65b5b]",
    },
    {
      label: "Customer Confirmation",
      value: caseMetrics.customerConfirmation,
      description: "Waiting for customer response",
      icon: FaClock,
      bar: "bg-[#8b78b5]",
      iconBox: "bg-[#f4f0fb] text-[#8b78b5]",
    },
    {
      label: "Resolved",
      value: caseMetrics.resolved,
      description: "Resolution completed",
      icon: FaCheckCircle,
      bar: "bg-[#37876c]",
      iconBox: "bg-[#edf8f4] text-[#37876c]",
    },
    {
      label: "Closed",
      value: caseMetrics.closed,
      description: "Case fully completed",
      icon: FaCheckCircle,
      bar: "bg-[#2f735e]",
      iconBox: "bg-[#edf8f4] text-[#37876c]",
    },
  ];

  if (loading && !metrics) {
    return (
      <div className="min-h-full space-y-7">

        {/* Hero skeleton */}
        <div className="h-[230px] animate-pulse rounded-[24px] bg-[#10233e]" />

        {/* KPI skeletons */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[150px] animate-pulse rounded-[20px] border border-slate-200 bg-white"
            />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="h-[500px] animate-pulse rounded-[22px] border border-slate-200 bg-white" />
          <div className="h-[500px] animate-pulse rounded-[22px] border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-7">

      {/* =====================================================
          HERO
      ===================================================== */}

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
                  Executive Analytics
                </span>

              </div>

              <h1 className="font-display text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
                Case Analytics
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                Monitor global support workload, case progress,
                resolution performance, and cases requiring
                management attention.
              </p>

            </div>

            <button
              type="button"
              onClick={() => loadMetrics(true)}
              disabled={refreshing}
              className="
                inline-flex items-center justify-center gap-2
                rounded-xl border border-white/10
                bg-white/[0.055]
                px-4 py-3
                text-xs font-semibold text-white/70
                backdrop-blur-md
                transition
                hover:bg-white/[0.09]
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <FaSyncAlt
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Refreshing..." : "Refresh analytics"}
            </button>

          </div>

        </div>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">

          <FaExclamationTriangle className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">
              Analytics data unavailable
            </p>

            <p className="mt-1 text-xs text-red-600/80">
              {error}
            </p>
          </div>

        </div>
      )}

      {/* =====================================================
          KPI SECTION
      ===================================================== */}

      <section>

        <div className="mb-4 flex items-end justify-between">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#567fbd]">
              Global support
            </p>

            <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
              Performance at a glance
            </h2>
          </div>

          <div className="hidden items-center gap-2 text-[10px] text-slate-400 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live analytics
          </div>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <AnalyticsMetric
            label="Total Cases"
            value={caseMetrics.total}
            description="Across the entire platform"
            icon={FaClipboardList}
            tone="blue"
          />

          <AnalyticsMetric
            label="Active Cases"
            value={caseMetrics.active}
            description="Cases still requiring action"
            icon={FaLayerGroup}
            tone="amber"
          />

          <AnalyticsMetric
            label="Completed"
            value={caseMetrics.completed}
            description="Resolved or closed cases"
            icon={FaCheckCircle}
            tone="green"
          />

          <AnalyticsMetric
            label="Resolution Rate"
            value={`${caseMetrics.resolutionRate}%`}
            description={`${caseMetrics.completed} completed cases`}
            icon={FaChartBar}
            tone="green"
          />

        </div>

      </section>

      {/* =====================================================
          MAIN ANALYTICS
      ===================================================== */}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">

        {/* =================================================
            STATUS BREAKDOWN
        ================================================= */}

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
                      Case status breakdown
                    </h2>

                  </div>

                </div>

                <p className="mt-3 text-[11px] leading-5 text-slate-400">
                  Current distribution of cases across every
                  workflow stage in the organization.
                </p>

              </div>

              <div className="hidden text-right sm:block">

                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Total cases
                </p>

                <p className="mt-1 font-display text-2xl font-bold tracking-[-0.04em] text-[#101a28]">
                  {caseMetrics.total}
                </p>

              </div>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            <div className="space-y-5">

              {statusItems.map((item) => {

                const percentage =
                  caseMetrics.total > 0
                    ? Math.round(
                        (item.value / caseMetrics.total) * 100
                      )
                    : 0;

                const Icon = item.icon;

                return (
                  <div key={item.label}>

                    <div className="mb-2 flex items-center justify-between">

                      <div className="flex items-center gap-2.5">

                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.iconBox}`}
                        >
                          <Icon className="text-xs" />
                        </div>

                        <div>

                          <p className="text-[11px] font-semibold text-slate-700">
                            {item.label}
                          </p>

                          <p className="text-[9px] text-slate-400">
                            {item.description}
                          </p>

                        </div>

                      </div>

                      <div className="text-right">

                        <p className="font-display text-sm font-bold text-[#101a28]">
                          {item.value}
                        </p>

                        <p className="text-[9px] font-medium text-slate-400">
                          {percentage}%
                        </p>

                      </div>

                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className={`h-full rounded-full ${item.bar} transition-all duration-700`}
                        style={{
                          width:
                            item.value > 0
                              ? `${Math.max(percentage, 3)}%`
                              : "0%",
                        }}
                      />

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

        </section>

        {/* =================================================
            EXECUTIVE HEALTH
        ================================================= */}

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

            <div className="flex flex-col items-center rounded-2xl bg-slate-50/80 p-6 text-center">

              <div className="relative flex h-36 w-36 items-center justify-center">

                <svg
                  viewBox="0 0 100 100"
                  className="h-36 w-36 -rotate-90"
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
                      (1 - caseMetrics.resolutionRate / 100)
                    }
                  />

                </svg>

                <div className="absolute">

                  <p className="font-display text-3xl font-bold tracking-[-0.05em] text-[#101a28]">
                    {caseMetrics.resolutionRate}%
                  </p>

                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Resolution
                  </p>

                </div>

              </div>

              <p className="mt-5 text-[11px] font-bold text-[#101a28]">
                Resolution performance
              </p>

              <p className="mt-1 max-w-xs text-[10px] leading-5 text-slate-400">
                {caseMetrics.completed} of{" "}
                {caseMetrics.total} tracked cases have
                reached resolution or closure.
              </p>

            </div>

            {/* Summary metrics */}

            <div className="mt-4 grid grid-cols-2 gap-3">

              <HealthMetric
                label="Active workload"
                value={caseMetrics.active}
                description={`${caseMetrics.activeRate}% of cases`}
              />

              <HealthMetric
                label="Completed"
                value={caseMetrics.completed}
                description="Resolved + closed"
              />

              <HealthMetric
                label="Escalated"
                value={caseMetrics.escalated}
                description="Needs attention"
                warning={caseMetrics.escalated > 0}
              />

              <HealthMetric
                label="Pending"
                value={caseMetrics.pending}
                description="Waiting for action"
              />

            </div>

            {/* Attention */}

            <div className="mt-4 rounded-2xl border border-[#f0e0c4] bg-[#fffaf1] p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff0d4] text-[#c58a27]">
                  <FaExclamationTriangle className="text-xs" />
                </div>

                <div>

                  <p className="text-[11px] font-bold text-[#101a28]">
                    Management attention
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-slate-500">
                    {caseMetrics.escalated > 0
                      ? `${caseMetrics.escalated} escalated case${
                          caseMetrics.escalated === 1 ? "" : "s"
                        } currently require management attention.`
                      : "There are currently no escalated cases requiring attention."}
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

      {/* =====================================================
          STATUS SUMMARY
      ===================================================== */}

      <section>

        <div className="mb-4">

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#567fbd]">
            Case lifecycle
          </p>

          <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
            Workflow summary
          </h2>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <WorkflowCard
            label="Open"
            value={caseMetrics.open}
            description="Cases awaiting action"
            icon={FaClock}
            tone="blue"
          />

          <WorkflowCard
            label="In Progress"
            value={caseMetrics.inProgress}
            description="Cases actively being handled"
            icon={FaLayerGroup}
            tone="amber"
          />

          <WorkflowCard
            label="Resolved"
            value={caseMetrics.resolved}
            description="Cases with completed resolution"
            icon={FaCheckCircle}
            tone="green"
          />

          <WorkflowCard
            label="Closed"
            value={caseMetrics.closed}
            description="Fully completed cases"
            icon={FaCheckCircle}
            tone="green"
          />

        </div>

      </section>

      {/* =====================================================
          MANAGEMENT ACTION
      ===================================================== */}

      <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Management workspace
            </p>

            <h2 className="mt-1 text-base font-bold text-[#101a28]">
              Need a broader view?
            </h2>

            <p className="mt-1 max-w-xl text-[10px] leading-5 text-slate-400">
              Review users, organizations, and other executive
              management information from the Director workspace.
            </p>

          </div>

          <Link
            to="/director"
            className="
              inline-flex shrink-0 items-center justify-center gap-2
              rounded-xl
              bg-[#0b1b33]
              px-5 py-3
              text-[10px] font-bold text-white
              transition
              hover:bg-[#142b4d]
            "
          >
            Executive dashboard
            <FaArrowRight className="text-[9px]" />
          </Link>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-2">

          <FaChartBar className="text-[#567fbd]" />

          MOTI Partner Support Platform

        </div>

        <div>
          Global case analytics workspace
        </div>

      </div>

    </div>
  );
}


/* ============================================================
   ANALYTICS METRIC
============================================================ */

function AnalyticsMetric({
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
   HEALTH METRIC
============================================================ */

function HealthMetric({
  label,
  value,
  description,
  warning = false,
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        p-3.5
        ${
          warning
            ? "border-[#f0e0c4] bg-[#fffaf1]"
            : "border-slate-100 bg-slate-50/70"
        }
      `}
    >

      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p
        className={`
          mt-1.5 font-display text-lg font-bold tracking-[-0.03em]
          ${warning ? "text-[#c58a27]" : "text-[#101a28]"}
        `}
      >
        {value}
      </p>

      <p className="mt-1 text-[9px] text-slate-400">
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   WORKFLOW CARD
============================================================ */

function WorkflowCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "blue",
}) {
  const styles = {
    blue: {
      icon: "bg-[#edf4fd] text-[#527eb9]",
      accent: "bg-[#527eb9]",
    },

    amber: {
      icon: "bg-[#fff7e8] text-[#c58a27]",
      accent: "bg-[#c58a27]",
    },

    green: {
      icon: "bg-[#edf8f4] text-[#37876c]",
      accent: "bg-[#37876c]",
    },
  };

  const current = styles[tone] || styles.blue;

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
          absolute bottom-0 left-0
          h-[3px] w-0
          ${current.accent}
          transition-all duration-300
          group-hover:w-full
        `}
      />

      <div className="flex items-center justify-between">

        <div
          className={`
            flex h-10 w-10 items-center justify-center
            rounded-xl
            ${current.icon}
          `}
        >
          <Icon className="text-sm" />
        </div>

        <span className="font-display text-2xl font-bold tracking-[-0.04em] text-[#101a28]">
          {value}
        </span>

      </div>

      <div className="mt-5">

        <p className="text-[11px] font-bold text-[#101a28]">
          {label}
        </p>

        <p className="mt-1 text-[9px] leading-5 text-slate-400">
          {description}
        </p>

      </div>

    </div>
  );
}