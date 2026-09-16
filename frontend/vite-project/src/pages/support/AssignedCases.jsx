import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ClipboardList,
  Eye,
  Inbox,
  Loader2,
  MessageSquare,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import SupportApi from "../../api/supportApi";
import caseApi from "../../api/caseApi";

import StatusBadge from "../../components/support/StatusBadge";
import ResolutionModal from "../../components/support/ResolutionModal";
import CaseDetailsDrawer from "../../components/cases/CaseDetailsDrawer";
import SupportHeader from "../../components/support/SupportHeader";
import Button from "../../components/ui/button";

export default function AssignedCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingCase, setResolvingCase] = useState(null);
  const [detailCase, setDetailCase] = useState(null);

  useEffect(() => {
    let mounted = true;

    SupportApi.getAssignedCases()
      .then((res) => {
        if (mounted) {
          setCases(res?.data?.data || []);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleResolve = (c) => {
    setResolvingCase(c);
  };

  const submitResolution = async (text) => {
    if (!resolvingCase) return;

    const summary = text?.trim();

    if (!summary || summary.length < 10) {
      alert(
        "A detailed resolution summary is required (minimum 10 characters)."
      );
      return;
    }

    try {
      await caseApi.updateStatus(resolvingCase.id, {
        status: "RESOLVED",
        resolutionSummary: summary,
        reason: "Case resolved by support team.",
      });

      setCases((current) =>
        current.map((item) =>
          item.id === resolvingCase.id
            ? {
                ...item,
                status: "RESOLVED",
                resolutionSummary: summary,
              }
            : item
        )
      );

      setResolvingCase(null);

      window.dispatchEvent(new CustomEvent("cases:updated"));
    } catch (err) {
      console.error(err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resolve case";

      alert(msg);
    }
  };

  const handleViewDetails = (c) => {
    setDetailCase(c);
  };

  const metrics = useMemo(() => {
    const total = cases.length;

    const open = cases.filter(
      (item) => item.status === "OPEN"
    ).length;

    const inProgress = cases.filter(
      (item) => item.status === "IN_PROGRESS"
    ).length;

    const resolved = cases.filter(
      (item) =>
        item.status === "RESOLVED" ||
        item.status === "CLOSED"
    ).length;

    return {
      total,
      open,
      inProgress,
      resolved,
    };
  }, [cases]);

  const activeCases = cases.filter(
    (item) =>
      item.status !== "RESOLVED" &&
      item.status !== "CLOSED"
  );

  return (
    <div className="min-h-full space-y-7">

      {/* =====================================================
          PAGE HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[24px] bg-[#0b1b33] text-white shadow-[0_18px_50px_rgba(11,27,51,0.14)]">

        <div className="pointer-events-none absolute -right-32 -top-40 h-[390px] w-[390px] rounded-full bg-[#416da8]/20 blur-[90px]" />

        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[300px] w-[300px] rounded-full bg-[#5f86b9]/10 blur-[90px]" />

        <div
          className="
            pointer-events-none absolute inset-0 opacity-[0.035]
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
                Assigned Cases
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                Manage your assigned support requests, review
                customer issues, and move every case toward
                resolution.
              </p>

            </div>

            <div className="flex items-center gap-3">

              <div className="rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur-md">

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">
                  Active queue
                </p>

                <p className="mt-1 font-display text-xl font-bold tracking-[-0.03em]">
                  {loading ? "—" : activeCases.length}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-white/60">
                <ClipboardList className="h-4 w-4" />
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          METRICS
      ===================================================== */}

      <section>

        <div className="mb-4">

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#567fbd]">
            Queue overview
          </p>

          <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
            Case workload
          </h2>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <QueueMetric
            label="Total Assigned"
            value={metrics.total}
            description="Cases in your queue"
            icon={ClipboardList}
            tone="blue"
            loading={loading}
          />

          <QueueMetric
            label="Open"
            value={metrics.open}
            description="Waiting for action"
            icon={Inbox}
            tone="amber"
            loading={loading}
          />

          <QueueMetric
            label="In Progress"
            value={metrics.inProgress}
            description="Currently being handled"
            icon={Activity}
            tone="blue"
            loading={loading}
          />

          <QueueMetric
            label="Resolved"
            value={metrics.resolved}
            description="Successfully completed"
            icon={CheckCircle2}
            tone="green"
            loading={loading}
          />

        </div>

      </section>

      {/* =====================================================
          CASE QUEUE
      ===================================================== */}

      <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

        {/* Header */}

        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <div>

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4fd] text-[#527eb9]">
                <ClipboardList className="h-4 w-4" />
              </div>

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Case management
                </p>

                <h2 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
                  Your case queue
                </h2>

              </div>

            </div>

            <p className="mt-3 text-[11px] leading-5 text-slate-400">
              Review assigned cases and take action when required.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 text-[10px] text-slate-400">

              <RefreshCw className="h-3 w-3" />

              {cases.length} cases

            </div>

            <span className="hidden h-4 w-px bg-slate-200 sm:block" />

            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              Active

            </span>

          </div>

        </div>

        {/* Content */}

        <div className="p-4 sm:p-6">

          {loading ? (

            <LoadingQueue />

          ) : !cases.length ? (

            <EmptyQueue />

          ) : (

            <div className="space-y-2">

              {cases.map((c, index) => (

                <CaseRow
                  key={c.id}
                  caseItem={c}
                  index={index}
                  onView={handleViewDetails}
                  onResolve={handleResolve}
                />

              ))}

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          QUEUE FOOTER
      ===================================================== */}

      {!loading && cases.length > 0 && (

        <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            Support queue is active

          </div>

          <div className="flex items-center gap-2">

            <MessageSquare className="h-3 w-3" />

            {metrics.resolved} cases completed

          </div>

        </div>

      )}

      {/* =====================================================
          MODALS
      ===================================================== */}

      {resolvingCase && (

        <ResolutionModal
          initial={resolvingCase?.resolutionSummary || ""}
          onClose={() => setResolvingCase(null)}
          onSubmit={submitResolution}
        />

      )}

      {detailCase && (

        <CaseDetailsDrawer
          caseData={detailCase}
          close={() => setDetailCase(null)}
        />

      )}

    </div>
  );
}

/* ============================================================
   CASE ROW
============================================================ */

function CaseRow({
  caseItem,
  index,
  onView,
  onResolve,
}) {
  const isResolved =
    caseItem.status === "RESOLVED" ||
    caseItem.status === "CLOSED";

  const isInProgress =
    caseItem.status === "IN_PROGRESS";

  const statusLabel =
    caseItem.status
      ?.replace(/_/g, " ")
      ?.toLowerCase()
      ?.replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      ) || "Unknown";

  const priority = caseItem.priority || "NORMAL";

  const priorityStyles = {
    CRITICAL:
      "bg-red-50 text-red-600 border-red-100",
    HIGH:
      "bg-orange-50 text-orange-600 border-orange-100",
    MEDIUM:
      "bg-amber-50 text-amber-600 border-amber-100",
    NORMAL:
      "bg-slate-50 text-slate-500 border-slate-200",
    LOW:
      "bg-slate-50 text-slate-400 border-slate-200",
  };

  return (

    <div
      className="
        group relative overflow-hidden
        rounded-[18px]
        border border-slate-100
        bg-white
        px-4 py-4
        transition-all duration-300
        hover:border-slate-200
        hover:bg-slate-[0.2]
        hover:shadow-[0_8px_25px_rgba(16,32,55,0.055)]
        sm:px-5
      "
    >

      {/* Left accent */}

      <div
        className={`
          absolute left-0 top-0 h-full w-[3px]
          transition-opacity
          ${
            isResolved
              ? "bg-emerald-400 opacity-50"
              : isInProgress
              ? "bg-[#527eb9] opacity-60"
              : "bg-amber-400 opacity-50"
          }
        `}
      />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

        {/* Case identity */}

        <div className="flex min-w-0 flex-1 items-start gap-4">

          <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-[9px] font-bold text-slate-300 sm:flex">
            {String(index + 1).padStart(2, "0")}
          </div>

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <p className="text-[11px] font-bold tracking-[0.01em] text-[#101a28]">
                {caseItem.caseNumber || caseItem.id}
              </p>

              {priority && (

                <span
                  className={`
                    rounded-full
                    border
                    px-2 py-0.5
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    ${priorityStyles[priority] || priorityStyles.NORMAL}
                  `}
                >
                  {priority}
                </span>

              )}

            </div>

            <p className="mt-1.5 line-clamp-2 text-[12px] font-medium leading-5 text-slate-600">
              {caseItem.subject || "Support request"}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-[9px] text-slate-400">

              {caseItem.organization?.name && (

                <span>
                  {caseItem.organization.name}
                </span>

              )}

              {caseItem.organization?.name && (
                <span className="h-1 w-1 rounded-full bg-slate-200" />
              )}

              <span>
                Case #{index + 1}
              </span>

            </div>

          </div>

        </div>

        {/* Status */}

        <div className="flex items-center gap-2 lg:w-[150px]">

          <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-300 lg:hidden">
            Status
          </span>

          <StatusBadge status={caseItem.status} />

          <span className="hidden text-[9px] font-medium text-slate-400 xl:block">
            {statusLabel}
          </span>

        </div>

        {/* Actions */}

        <div className="flex items-center gap-2 lg:justify-end">

          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(caseItem)}
            className="
              h-9
              rounded-xl
              border-slate-200
              px-3
              text-[10px]
              font-semibold
              shadow-none
              transition-all
              hover:border-[#527eb9]
              hover:bg-[#edf4fd]
              hover:text-[#527eb9]
            "
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            View
          </Button>

          {!isResolved && (

            <Button
              variant="accent"
              size="sm"
              onClick={() => onResolve(caseItem)}
              className="
                h-9
                rounded-xl
                px-3
                text-[10px]
                font-semibold
                shadow-none
              "
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Resolve
            </Button>

          )}

          <button
            type="button"
            onClick={() => onView(caseItem)}
            className="
              hidden
              h-9 w-9
              items-center justify-center
              rounded-xl
              text-slate-300
              transition-all
              hover:bg-slate-50
              hover:text-[#527eb9]
              xl:flex
            "
            aria-label="Open case"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

        </div>

      </div>

    </div>

  );
}

/* ============================================================
   METRIC
============================================================ */

function QueueMetric({
  label,
  value,
  description,
  icon: Icon,
  tone,
  loading,
}) {
  const tones = {
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
          absolute left-0 top-0 h-[3px] w-0
          ${currentTone.accent}
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

        <ArrowUpRight className="h-3.5 w-3.5 text-slate-200 transition-colors group-hover:text-slate-400" />

      </div>

      <div className="mt-6">

        <p className="text-[10px] font-medium text-slate-400">
          {label}
        </p>

        <div className="mt-1.5 min-h-[36px]">

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
   LOADING QUEUE
============================================================ */

function LoadingQueue() {
  return (

    <div className="space-y-2">

      {[1, 2, 3, 4].map((item) => (

        <div
          key={item}
          className="animate-pulse rounded-[18px] border border-slate-100 p-5"
        >

          <div className="flex items-center gap-4">

            <div className="h-9 w-9 rounded-xl bg-slate-100" />

            <div className="flex-1">

              <div className="h-3 w-28 rounded bg-slate-100" />

              <div className="mt-2 h-3 w-64 max-w-full rounded bg-slate-100" />

              <div className="mt-2 h-2 w-24 rounded bg-slate-100" />

            </div>

            <div className="hidden h-7 w-20 rounded-full bg-slate-100 sm:block" />

            <div className="hidden h-8 w-20 rounded-xl bg-slate-100 sm:block" />

          </div>

        </div>

      ))}

    </div>

  );
}

/* ============================================================
   EMPTY QUEUE
============================================================ */

function EmptyQueue() {
  return (

    <div className="flex flex-col items-center justify-center rounded-[20px] bg-slate-50/70 px-6 py-14 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">

        <Inbox className="h-6 w-6" />

      </div>

      <div className="mt-5 flex items-center gap-2">

        <Sparkles className="h-3.5 w-3.5 text-[#527eb9]" />

        <p className="text-sm font-bold text-[#101a28]">
          Your queue is clear
        </p>

      </div>

      <p className="mt-2 max-w-sm text-[11px] leading-5 text-slate-400">
        There are no assigned cases requiring your attention
        right now. New support requests will appear here when
        they are assigned to you.
      </p>

    </div>

  );
}