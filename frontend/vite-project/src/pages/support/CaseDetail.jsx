import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  FolderOpen,
  MoreHorizontal,
  Paperclip,
  PlayCircle,
  RefreshCw,
  ShieldAlert,
  Timer,
  XCircle,
} from "lucide-react";

import SupportHeader from "../../components/support/SupportHeader";
import StatusTimeline from "../../components/support/StatusTimeline";
import ResolutionModal from "../../components/support/ResolutionModal";

import { supportApi } from "../../api/supportApi";
import caseApi from "../../api/caseApi";

import PutOnPendingModal from "../../components/cases/PutOnPendingModal";
import EscalateModal from "../../components/cases/EscalateModal";
import CancelCaseModal from "../../components/cases/CancelCaseModal";

import { useAuth } from "../../context/useAuth";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

/* ============================================================
   ATTACHMENT URL
============================================================ */

const getAttachmentUrl = (attachment) => {
  if (!attachment) return "";

  if (typeof attachment === "string") {
    if (/^https?:\/\//i.test(attachment)) {
      return attachment;
    }

    const fileName = attachment.split("/").pop();

    return fileName
      ? `${API_BASE_URL}/uploads/${encodeURIComponent(fileName)}`
      : "";
  }

  if (attachment.url && /^https?:\/\//i.test(attachment.url)) {
    return attachment.url;
  }

  const storagePath =
    attachment.storagePath ||
    attachment.filePath ||
    attachment.path ||
    attachment.fileName ||
    "";

  if (storagePath) {
    if (/^https?:\/\//i.test(storagePath)) {
      return storagePath;
    }

    const fileName = storagePath
      .replace(/\\/g, "/")
      .split("/")
      .filter(Boolean)
      .pop();

    if (fileName) {
      return `${API_BASE_URL}/uploads/${encodeURIComponent(fileName)}`;
    }
  }

  if (attachment.fileName) {
    return `${API_BASE_URL}/uploads/${encodeURIComponent(
      attachment.fileName
    )}`;
  }

  return "";
};

/* ============================================================
   STATUS HELPERS
============================================================ */

const normalizeStatus = (status) =>
  String(status || "")
    .toUpperCase()
    .replace(/\s+/g, "_");

const getStatusConfig = (status) => {
  const normalized = normalizeStatus(status);

  const configs = {
    OPEN: {
      label: "Open",
      icon: FolderOpen,
      className: "bg-amber-50 text-amber-700 border-amber-100",
      dot: "bg-amber-400",
    },

    ASSIGNED: {
      label: "Assigned",
      icon: Timer,
      className: "bg-blue-50 text-blue-700 border-blue-100",
      dot: "bg-blue-500",
    },

    IN_PROGRESS: {
      label: "In Progress",
      icon: PlayCircle,
      className: "bg-[#edf4fd] text-[#527eb9] border-[#dbe8f7]",
      dot: "bg-[#527eb9]",
    },

    PENDING: {
      label: "Pending",
      icon: Clock3,
      className: "bg-amber-50 text-amber-700 border-amber-100",
      dot: "bg-amber-400",
    },

    ESCALATED: {
      label: "Escalated",
      icon: ShieldAlert,
      className: "bg-orange-50 text-orange-700 border-orange-100",
      dot: "bg-orange-500",
    },

    RESOLVED: {
      label: "Resolved",
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
      dot: "bg-emerald-500",
    },

    CLOSED: {
      label: "Closed",
      icon: CheckCircle2,
      className: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    },

    CANCELLED: {
      label: "Cancelled",
      icon: XCircle,
      className: "bg-red-50 text-red-700 border-red-100",
      dot: "bg-red-500",
    },
  };

  return (
    configs[normalized] || {
      label: normalized || "Unknown",
      icon: Clock3,
      className: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    }
  );
};

/* ============================================================
   ROLE HELPER
============================================================ */

const resolveUserRole = (account) => {
  if (!account) return "customer";

  if (account.role) {
    return String(account.role).toLowerCase();
  }

  if (account.isSAdmin) return "admin";
  if (account.isManager) return "manager";
  if (account.isPSsupport) return "agent";
  if (account.isDirector) return "director";

  return String(account.partyType || "customer").toLowerCase();
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function CaseDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* ==========================================================
     LOAD CASE
  ========================================================== */

  const loadCase = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await supportApi.getCase(id);

      setData(response?.data?.data || null);
    } catch (error) {
      console.error("Failed to load case:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const response = await supportApi.getCase(id);

        if (mounted) {
          setData(response?.data?.data || null);
        }
      } catch (error) {
        console.error("Failed to load case:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  /* ==========================================================
     RESOLUTION
  ========================================================== */

  const startResolve = () => {
    setResolving(true);
  };

  const submitResolution = async (text) => {
    const resolution = text?.trim();

    if (!resolution || resolution.length < 10) {
      alert(
        "A detailed resolution summary is required (minimum 10 characters)."
      );
      return;
    }

    try {
      await supportApi.resolveCase(id, {
        resolution,
      });

      setData((current) => ({
        ...current,
        status: "RESOLVED",
        resolutionSummary: resolution,
      }));

      setResolving(false);

      window.dispatchEvent(new CustomEvent("cases:updated"));
    } catch (error) {
      console.error(error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to resolve case";

      alert(message);
    }
  };

  /* ==========================================================
     DERIVED DATA
  ========================================================== */

  const currentStatus = normalizeStatus(data?.status);

  const statusConfig = useMemo(
    () => getStatusConfig(currentStatus),
    [currentStatus]
  );

  const StatusIcon = statusConfig.icon;

  const userRole = resolveUserRole(user);

  const isSupportStaff = [
    "agent",
    "manager",
    "admin",
    "director",
  ].includes(userRole);

  const isAdmin = userRole === "admin";

  const pendingReason =
    data?.pendingReason ||
    data?.statusReason ||
    "No reason provided.";

  const escalationReason =
    data?.escalationReason ||
    "No escalation reason provided.";

  /* ==========================================================
     ACTIONS
  ========================================================== */

  const actions = [];

  if (currentStatus === "IN_PROGRESS") {
    actions.push({
      label: "Put on Pending",
      icon: Clock3,
      onClick: () => setShowPendingModal(true),
      type: "secondary",
    });

    actions.push({
      label: "Escalate",
      icon: ShieldAlert,
      onClick: () => setShowEscalateModal(true),
      type: "warning",
    });

    actions.push({
      label: "Resolve Case",
      icon: CheckCircle2,
      onClick: startResolve,
      type: "primary",
    });
  }

  if (
    ["PENDING", "ESCALATED"].includes(currentStatus) &&
    isSupportStaff
  ) {
    actions.push({
      label: "Resume Case",
      icon: PlayCircle,
      onClick: async () => {
        try {
          await caseApi.updateStatus(data.id, {
            status: "IN_PROGRESS",
            reason: "Case resumed from support queue.",
          });

          setData((current) => ({
            ...current,
            status: "IN_PROGRESS",
          }));

          window.dispatchEvent(
            new CustomEvent("cases:updated")
          );
        } catch (error) {
          console.error(error);

          alert(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to resume case"
          );
        }
      },
      type: "primary",
    });
  }

  const hasActions = actions.length > 0;

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-full">
        <SupportHeader />

        <div className="ps-container space-y-6 py-6">
          <CaseDetailSkeleton />
        </div>
      </div>
    );
  }

  /* ==========================================================
     ERROR / MISSING CASE
  ========================================================== */

  if (!data) {
    return (
      <div className="min-h-full">
        <SupportHeader />

        <div className="ps-container py-10">
          <div className="border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center bg-red-50 text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-lg font-bold text-[#101a28]">
              Case could not be loaded
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              We couldn't retrieve the requested support case.
              Please refresh the page and try again.
            </p>

            <button
              type="button"
              onClick={() => loadCase()}
              className="mt-6 inline-flex h-9 items-center gap-2 bg-[#0b1b33] px-4 text-xs font-semibold text-white transition hover:bg-[#142b4b]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-full">
      <SupportHeader />

      <main className="ps-container space-y-6 py-6">

        {/* CASE HERO */}

        <section className="relative overflow-hidden rounded-[22px] bg-[#0b1b33] shadow-[0_16px_45px_rgba(11,27,51,0.12)]">
          <div className="pointer-events-none absolute -right-32 -top-40 h-[350px] w-[350px] rounded-full bg-[#416da8]/20 blur-[90px]" />

          <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[250px] w-[250px] rounded-full bg-[#5f86b9]/10 blur-[80px]" />

          <div className="relative px-6 py-7 sm:px-8">

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                  Support Case
                </span>

                <span className="h-3 w-px bg-white/10" />

                <span className="font-mono text-[10px] font-semibold text-white/60">
                  {data.caseNumber || data.id}
                </span>
              </div>

              <button
                type="button"
                onClick={() => loadCase(true)}
                className="flex h-8 items-center gap-2 border border-white/10 bg-white/[0.05] px-3 text-[9px] font-semibold text-white/50 transition hover:bg-white/[0.1] hover:text-white"
              >
                <RefreshCw
                  className={`h-3 w-3 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />

                Refresh
              </button>
            </div>

            <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">

              <div className="max-w-3xl">
                <h1 className="font-display text-2xl font-bold tracking-[-0.045em] text-white sm:text-3xl lg:text-[34px]">
                  {data.subject || "Support Case"}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-white/40">
                  {data.organization?.name && (
                    <span>
                      Organization:{" "}
                      <strong className="font-semibold text-white/65">
                        {data.organization.name}
                      </strong>
                    </span>
                  )}

                  {data.createdAt && (
                    <span>
                      Created{" "}
                      {new Date(data.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="lg:justify-self-end">
                <div className="mb-2 text-right text-[8px] font-bold uppercase tracking-[0.16em] text-white/30">
                  Current status
                </div>

                <div
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    border
                    px-3
                    py-2
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    ${statusConfig.className}
                  `}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                  />

                  <StatusIcon className="h-3 w-3" />

                  {statusConfig.label}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACTION BAR */}

        {(hasActions || isAdmin) && (
          <section className="border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.04)]">
            <div className="flex flex-col gap-4 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#527eb9]">
                    Case controls
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Manage the current case workflow.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {actions.map((action) => {
                    const ActionIcon = action.icon;

                    const styles = {
                      primary:
                        "bg-[#0b1b33] text-white hover:bg-[#142b4b]",

                      secondary:
                        "border border-slate-200 bg-white text-slate-600 hover:border-[#b8cce5] hover:bg-[#f4f8fd] hover:text-[#527eb9]",

                      warning:
                        "bg-orange-50 text-orange-700 hover:bg-orange-100",
                    };

                    return (
                      <button
                        key={action.label}
                        type="button"
                        onClick={action.onClick}
                        className={`inline-flex h-9 items-center gap-2 px-3.5 text-[9px] font-semibold transition ${styles[action.type]}`}
                      >
                        <ActionIcon className="h-3.5 w-3.5" />
                        {action.label}
                      </button>
                    );
                  })}

                  {isAdmin && currentStatus !== "CANCELLED" && (
                    <>
                      <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />

                      <button
                        type="button"
                        onClick={() => setShowCancelModal(true)}
                        className="inline-flex h-9 items-center gap-2 border border-red-100 bg-red-50 px-3.5 text-[9px] font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                        More actions
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STATUS ALERTS */}

        {currentStatus === "PENDING" && (
          <StatusNotice
            type="pending"
            title="Case is currently pending"
            description={pendingReason}
          />
        )}

        {currentStatus === "ESCALATED" && (
          <StatusNotice
            type="escalated"
            title="Case has been escalated"
            description={escalationReason}
          />
        )}

        {currentStatus === "RESOLVED" && (
          <StatusNotice
            type="resolved"
            title="Case resolved"
            description={
              data.resolutionSummary ||
              "This case has been marked as resolved."
            }
          />
        )}

        {currentStatus === "CANCELLED" && (
          <StatusNotice
            type="cancelled"
            title="Case cancelled"
            description={
              data.cancellationReason ||
              data.statusReason ||
              "This case has been cancelled."
            }
          />
        )}

        {/* MAIN CONTENT */}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* TIMELINE */}

          <section className="border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.04)]">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center bg-[#edf4fd] text-[#527eb9]">
                    <Clock3 className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Case history
                    </p>

                    <h2 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
                      Activity timeline
                    </h2>
                  </div>
                </div>

                <span className="hidden text-[9px] text-slate-400 sm:block">
                  {data.timeline?.length || 0} events
                </span>
              </div>
            </div>

            <div className="px-5 py-6 sm:px-6">
              {data.timeline?.length ? (
                <StatusTimeline events={data.timeline || []} />
              ) : (
                <div className="py-12 text-center">
                  <Clock3 className="mx-auto h-5 w-5 text-slate-300" />

                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    No timeline events yet
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Case activity will appear here as the case progresses.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* SIDEBAR */}

          <aside className="space-y-4">

            {/* CASE INFORMATION */}

            <section className="border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.04)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Case information
                </p>

                <h2 className="mt-1 text-sm font-bold text-[#101a28]">
                  Details
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                <InfoRow
                  label="Case number"
                  value={data.caseNumber || data.id}
                  mono
                />

                <InfoRow
                  label="Status"
                  value={statusConfig.label}
                />

                {data.createdAt && (
                  <InfoRow
                    label="Created"
                    value={new Date(
                      data.createdAt
                    ).toLocaleDateString()}
                  />
                )}

                {data.updatedAt && (
                  <InfoRow
                    label="Last updated"
                    value={new Date(
                      data.updatedAt
                    ).toLocaleDateString()}
                  />
                )}

                {data.organization?.name && (
                  <InfoRow
                    label="Organization"
                    value={data.organization.name}
                  />
                )}
              </div>
            </section>

            {/* ATTACHMENTS */}

            {data.attachments?.length > 0 && (
              <section className="border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.04)]">
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Supporting files
                      </p>

                      <h2 className="mt-1 text-sm font-bold text-[#101a28]">
                        Attachments
                      </h2>
                    </div>

                    <Paperclip className="h-4 w-4 text-slate-300" />
                  </div>
                </div>

                <div className="space-y-2 p-4">
                  {data.attachments.map((attachment, index) => {
                    const url = getAttachmentUrl(attachment);

                    const label =
                      attachment?.fileName ||
                      attachment?.name ||
                      attachment?.originalName ||
                      `Attachment ${index + 1}`;

                    return (
                      <AttachmentItem
                        key={
                          attachment?.id ||
                          `${label}-${index}`
                        }
                        label={label}
                        url={url}
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </aside>
        </div>

        {/* BOTTOM CONTEXT */}

        <div className="flex flex-col gap-2 border-t border-slate-200/70 pt-4 text-[9px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
            />

            Case status: {statusConfig.label}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-3 w-3" />
            Support case workspace
          </div>
        </div>
      </main>

      {/* MODALS */}

      {resolving && (
        <ResolutionModal
          onClose={() => setResolving(false)}
          onSubmit={submitResolution}
        />
      )}

      {showPendingModal && (
        <PutOnPendingModal
          caseId={data.id}
          onClose={() => setShowPendingModal(false)}
          onSuccess={async () => {
            try {
              const response = await caseApi.getCase(id);

              setData(response?.data?.data || data);
            } catch (error) {
              console.error(error);
            }
          }}
          api={caseApi}
        />
      )}

      {showEscalateModal && (
        <EscalateModal
          caseId={data.id}
          onClose={() => setShowEscalateModal(false)}
          onSuccess={async () => {
            try {
              const response = await caseApi.getCase(id);

              setData(response?.data?.data || data);
            } catch (error) {
              console.error(error);
            }
          }}
          api={caseApi}
        />
      )}

      {showCancelModal && (
        <CancelCaseModal
          caseId={data.id}
          onClose={() => setShowCancelModal(false)}
          onSuccess={async () => {
            try {
              const response = await caseApi.getCase(id);

              setData(response?.data?.data || data);
            } catch (error) {
              console.error(error);
            }
          }}
          api={caseApi}
        />
      )}
    </div>
  );
}

/* ============================================================
   STATUS NOTICE
============================================================ */

function StatusNotice({
  type,
  title,
  description,
}) {
  const config = {
    pending: {
      icon: Clock3,
      wrapper: "border-amber-100 bg-amber-50/70",
      iconBox: "bg-amber-100 text-amber-700",
      title: "text-amber-900",
      text: "text-amber-700/80",
    },

    escalated: {
      icon: ShieldAlert,
      wrapper: "border-orange-100 bg-orange-50/70",
      iconBox: "bg-orange-100 text-orange-700",
      title: "text-orange-900",
      text: "text-orange-700/80",
    },

    resolved: {
      icon: CheckCircle2,
      wrapper: "border-emerald-100 bg-emerald-50/70",
      iconBox: "bg-emerald-100 text-emerald-700",
      title: "text-emerald-900",
      text: "text-emerald-700/80",
    },

    cancelled: {
      icon: XCircle,
      wrapper: "border-red-100 bg-red-50/70",
      iconBox: "bg-red-100 text-red-700",
      title: "text-red-900",
      text: "text-red-700/80",
    },
  };

  const current = config[type] || config.pending;
  const Icon = current.icon;

  return (
    <section
      className={`border px-5 py-4 sm:px-6 ${current.wrapper}`}
    >
      <div className="flex gap-3">

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center ${current.iconBox}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.12em] ${current.title}`}
          >
            {title}
          </p>

          <p
            className={`mt-1 text-[11px] leading-5 ${current.text}`}
          >
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  label,
  value,
  mono = false,
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3.5">
      <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-slate-400">
        {label}
      </span>

      <span
        className={`max-w-[170px] text-right text-[10px] font-semibold text-slate-600 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

/* ============================================================
   ATTACHMENT ITEM
============================================================ */

function AttachmentItem({
  label,
  url,
}) {
  return (
    <div className="group flex items-center gap-3 border border-slate-100 bg-slate-50/60 p-3 transition hover:border-slate-200 hover:bg-white">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-white text-[#527eb9] shadow-sm">
        <FileText className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[10px] font-semibold text-slate-600"
          title={label}
        >
          {label}
        </p>

        <p className="mt-0.5 text-[8px] uppercase tracking-[0.08em] text-slate-300">
          Attachment
        </p>
      </div>

      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex h-7 w-7 shrink-0 items-center justify-center text-slate-300 transition hover:bg-[#edf4fd] hover:text-[#527eb9]"
          aria-label={`Download ${label}`}
        >
          <Download className="h-3.5 w-3.5" />
        </a>
      ) : (
        <span className="text-[8px] text-slate-300">
          Unavailable
        </span>
      )}
    </div>
  );
}

/* ============================================================
   LOADING SKELETON
============================================================ */

function CaseDetailSkeleton() {
  return (
    <div className="space-y-6">

      <div className="animate-pulse overflow-hidden rounded-[22px] bg-[#0b1b33] px-6 py-8 sm:px-8">
        <div className="h-2 w-28 bg-white/10" />

        <div className="mt-8 h-9 max-w-xl bg-white/10" />

        <div className="mt-4 h-2.5 max-w-md bg-white/10" />
      </div>

      <div className="animate-pulse border border-slate-200 bg-white px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="h-2 w-24 bg-slate-100" />
            <div className="mt-2 h-3 w-48 bg-slate-100" />
          </div>

          <div className="flex gap-2">
            <div className="h-9 w-28 bg-slate-100" />
            <div className="h-9 w-24 bg-slate-100" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

        <div className="h-[500px] animate-pulse border border-slate-200 bg-white" />

        <div className="space-y-4">
          <div className="h-64 animate-pulse border border-slate-200 bg-white" />

          <div className="h-48 animate-pulse border border-slate-200 bg-white" />
        </div>
      </div>
    </div>
  );
}