import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MessageSquare,
  RefreshCw,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";

import SupportHeader from "../../components/support/SupportHeader";
import AssignedCasesTable from "../../components/support/AssignedCasesTable";
import RecentFeedback from "../../components/support/RecentFeedback";

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

        if (!cancelled) {
          setOverview(res?.data?.data || {});
        }
      } catch (err) {
        console.error("Support dashboard load error:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    const handleCaseUpdated = () => load();

    window.addEventListener("cases:updated", handleCaseUpdated);
    window.addEventListener("focus", handleCaseUpdated);

    const refreshTimer = window.setInterval(load, 15000);

    return () => {
      cancelled = true;

      window.removeEventListener(
        "cases:updated",
        handleCaseUpdated
      );

      window.removeEventListener("focus", handleCaseUpdated);

      window.clearInterval(refreshTimer);
    };
  }, []);

  const metrics = useMemo(() => {
    const m = overview?.workloadMetrics || {};

    return {
      assigned: Number(m.totalAssignedHistorically ?? 0),
      open: Number(m.activeOpenCount ?? 0),
      inProgress: Number(m.activeInProgressCount ?? 0),
      resolved: Number(m.historicalClosedCount ?? 0),
      rating: m.averageFeedbackRatingReceived ?? "-",
    };
  }, [overview]);

  const activeCases = overview?.activeWorkloadList || [];
  const feedbackItems = (
    overview?.historicalClosedList || []
  ).slice(0, 3);

  const activeTotal = metrics.open + metrics.inProgress;

  const progress =
    activeTotal > 0
      ? Math.round(
          (metrics.inProgress / activeTotal) * 100
        )
      : 0;

  return (
    <div className="min-h-full space-y-7">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[24px] bg-[#0b1b33] text-white shadow-[0_18px_50px_rgba(11,27,51,0.14)]">

        <div className="pointer-events-none absolute -right-32 -top-36 h-[390px] w-[390px] rounded-full bg-[#416da8]/20 blur-[90px]" />

        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[320px] w-[320px] rounded-full bg-[#658abd]/10 blur-[90px]" />

        <div
          className="
            pointer-events-none absolute inset-0 opacity-[0.04]
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
                  Support Operations
                </span>

              </div>

              <h1 className="font-display text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
                My Assigned Work
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                Stay focused on your active cases, monitor your
                workload, and keep every support request moving
                toward resolution.
              </p>

            </div>

            <div className="flex items-center gap-3">

              <div className="rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur-md">

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">
                  Active workload
                </p>

                <p className="mt-1 font-display text-xl font-bold tracking-[-0.03em]">
                  {loading ? "—" : activeTotal}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-white/60">

                <Activity className="h-4 w-4" />

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          WORKLOAD SUMMARY
      ===================================================== */}

      <section>

        <div className="mb-4 flex items-end justify-between">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#567fbd]">
              Your workload
            </p>

            <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
              Support performance
            </h2>

          </div>

          <div className="hidden items-center gap-2 text-[10px] text-slate-400 sm:flex">

            <RefreshCw className="h-3 w-3" />

            Updates automatically

          </div>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

          <SupportMetric
            label="Assigned Cases"
            value={metrics.assigned}
            description="Historical assignments"
            icon={ClipboardList}
            tone="blue"
            loading={loading}
          />

          <SupportMetric
            label="Open"
            value={metrics.open}
            description="Waiting for action"
            icon={Clock3}
            tone="amber"
            loading={loading}
          />

          <SupportMetric
            label="In Progress"
            value={metrics.inProgress}
            description="Currently being handled"
            icon={Activity}
            tone="blue"
            loading={loading}
          />

          <SupportMetric
            label="Resolved"
            value={metrics.resolved}
            description="Successfully completed"
            icon={CheckCircle2}
            tone="green"
            loading={loading}
          />

          <SupportMetric
            label="Avg. Rating"
            value={metrics.rating}
            description="Customer feedback"
            icon={Star}
            tone="gold"
            loading={loading}
          />

        </div>
      </section>

      {/* =====================================================
          ACTIVE WORK + WORKLOAD HEALTH
      ===================================================== */}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">

        {/* ACTIVE CASES */}

        <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4fd] text-[#527eb9]">

                  <ClipboardList className="h-4 w-4" />

                </div>

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Current queue
                  </p>

                  <h2 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
                    Assigned Cases
                  </h2>

                </div>

              </div>

              <p className="mt-3 text-[11px] leading-5 text-slate-400">
                Cases currently assigned to you and requiring
                attention.
              </p>

            </div>

            <div className="flex items-center gap-2">

              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#edf4fd] px-2 text-[10px] font-bold text-[#527eb9]">
                {activeCases.length}
              </span>

              <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-400">
                Active
              </span>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            <AssignedCasesTable
              rows={activeCases}
              loading={loading}
            />

          </div>

        </section>

        {/* WORKLOAD HEALTH */}

        <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

          <div className="border-b border-slate-100 px-5 py-5">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf8f4] text-[#37876c]">

                <Target className="h-4 w-4" />

              </div>

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Workload health
                </p>

                <h2 className="mt-0.5 text-base font-bold text-[#101a28]">
                  Current workload
                </h2>

              </div>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            {/* Active cases */}

            <div className="rounded-2xl bg-slate-50/80 p-5">

              <div className="flex items-end justify-between">

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Active cases
                  </p>

                  <p className="mt-1 font-display text-3xl font-bold tracking-[-0.05em] text-[#101a28]">
                    {activeTotal}
                  </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#527eb9] shadow-sm">

                  <ClipboardList className="h-4 w-4" />

                </div>

              </div>

              <div className="mt-5">

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-[9px] font-semibold text-slate-400">
                    In progress
                  </span>

                  <span className="text-[9px] font-bold text-[#527eb9]">
                    {progress}%
                  </span>

                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">

                  <div
                    className="h-full rounded-full bg-[#527eb9] transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            {/* Open */}

            <WorkloadRow
              label="Open cases"
              value={metrics.open}
              icon={Clock3}
              tone="amber"
            />

            {/* In progress */}

            <WorkloadRow
              label="In progress"
              value={metrics.inProgress}
              icon={Activity}
              tone="blue"
            />

            {/* Resolved */}

            <WorkloadRow
              label="Historical resolved"
              value={metrics.resolved}
              icon={CheckCircle2}
              tone="green"
            />

            {/* Rating */}

            <div className="mt-4 rounded-2xl border border-[#f0e4c9] bg-[#fffaf1] p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff0d4] text-[#c58a27]">

                  <Star className="h-4 w-4 fill-current" />

                </div>

                <div className="flex-1">

                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Customer rating
                  </p>

                  <p className="mt-0.5 text-[11px] font-semibold text-[#101a28]">
                    Average feedback received
                  </p>

                </div>

                <p className="font-display text-xl font-bold text-[#c58a27]">
                  {metrics.rating}
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>

      {/* =====================================================
          RECENT FEEDBACK
      ===================================================== */}

      <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <div>

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff7e8] text-[#c58a27]">

                <MessageSquare className="h-4 w-4" />

              </div>

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Customer voice
                </p>

                <h2 className="mt-0.5 text-base font-bold text-[#101a28]">
                  Recent Feedback
                </h2>

              </div>

            </div>

          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">

            <Star className="h-3 w-3 text-[#c58a27]" />

            Latest completed cases

          </div>

        </div>

        <div className="p-5 sm:p-6">

          {feedbackItems.length === 0 && !loading ? (

            <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50/70 px-6 py-10 text-center">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">

                <MessageSquare className="h-5 w-5" />

              </div>

              <p className="mt-3 text-[11px] font-semibold text-slate-500">
                No recent feedback
              </p>

              <p className="mt-1 max-w-xs text-[10px] leading-5 text-slate-400">
                Customer feedback from completed cases will
                appear here.
              </p>

            </div>

          ) : (

            <div className="rounded-2xl bg-slate-50/60 p-4">

              <RecentFeedback items={feedbackItems} />

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          SUPPORT FOOTER
      ===================================================== */}

      <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-2">

          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

          Support workspace active

        </div>

        <div className="flex items-center gap-2">

          <TrendingUp className="h-3 w-3" />

          Your dashboard refreshes automatically

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   SUPPORT METRIC
============================================================ */

function SupportMetric({
  label,
  value,
  description,
  icon: Icon,
  tone = "blue",
  loading,
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

    gold: {
      icon: "bg-[#fff7e8] text-[#b7832e]",
      line: "bg-[#b7832e]",
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
          <Icon className="h-4 w-4" />
        </div>

        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-300">
          Live
        </span>

      </div>

      <div className="mt-6">

        <p className="text-[10px] font-medium text-slate-400">
          {label}
        </p>

        <div className="mt-1.5 flex min-h-[36px] items-center">

          {loading ? (

            <div className="h-7 w-10 animate-pulse rounded-md bg-slate-100" />

          ) : (

            <p className="font-display text-[29px] font-bold tracking-[-0.045em] text-[#101a28]">
              {value}
            </p>

          )}

        </div>

        <p className="mt-2 text-[10px] text-slate-400">
          {description}
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   WORKLOAD ROW
============================================================ */

function WorkloadRow({
  label,
  value,
  icon: Icon,
  tone = "blue",
}) {
  const tones = {
    blue: "bg-[#edf4fd] text-[#527eb9]",
    amber: "bg-[#fff7e8] text-[#c58a27]",
    green: "bg-[#edf8f4] text-[#37876c]",
  };

  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5">

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <p className="flex-1 text-[10px] font-semibold text-slate-500">
        {label}
      </p>

      <p className="font-display text-sm font-bold text-[#101a28]">
        {value}
      </p>

      <ArrowRight className="h-3 w-3 text-slate-300" />

    </div>
  );
}