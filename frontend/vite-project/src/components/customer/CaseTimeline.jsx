import StatusBadge from "../../components/customer/StatusBadge";

const STATUS_LABELS = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  PENDING: "Pending",
  ESCALATED: "Escalated",
  RESOLVED: "Resolved",
  CUSTOMER_CONFIRMATION: "Customer Confirmation",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

const PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const normalizeText = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return String(value).replace(/_/g, " ").replace(/\s+/g, " ").trim();
};

const formatStatus = (value) => {
  const normalized = normalizeText(value);
  if (!normalized) return "Unknown";
  const key = normalized.toUpperCase().replace(/\s+/g, "_");
  return STATUS_LABELS[key] || normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatPriority = (value) => {
  const normalized = normalizeText(value);
  if (!normalized) return "Unknown";
  const key = normalized.toUpperCase();
  return PRIORITY_LABELS[key] || normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

const getDisplayName = (actor) => {
  if (!actor) return "System";

  if (typeof actor === "string") {
    const text = actor.trim();
    return text || "System";
  }

  if (typeof actor === "object") {
    const name = [actor.firstName, actor.lastName].filter(Boolean).join(" ").trim();
    if (name) return name;
    if (actor.name) return actor.name;
    if (actor.email) return actor.email;
  }

  return "System";
};

const getTimelineDate = (item) => {
  const rawDate = item?.changedAt || item?.createdAt || item?.updatedAt || item?.submittedAt || item?.timestamp;
  if (!rawDate) return null;

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const getStatusEventText = (fromStatus, toStatus) => {
  const from = formatStatus(fromStatus);
  const to = formatStatus(toStatus);

  const lookup = {
    OPEN: "Case created",
    ASSIGNED: "Engineer assigned",
    IN_PROGRESS: "Case in progress",
    PENDING: "Awaiting customer or internal action",
    ESCALATED: "Escalated to support lead",
    RESOLVED: "Resolution prepared",
    CUSTOMER_CONFIRMATION: "Customer confirmation requested",
    CLOSED: "Case completed and closed",
    CANCELLED: "Case cancelled",
  };

  const specific = lookup[toStatus?.toUpperCase().replace(/\s+/g, "_") || ""];
  if (specific) return specific;

  if (from && to && from !== to) return `Case moved from ${from} to ${to}`;
  if (to) return `Case updated to ${to}`;
  return "Case updated";
};

const isInitialOpenEvent = (fromStatus, toStatus) => {
  const fromKey = normalizeText(fromStatus).toUpperCase();
  const toKey = normalizeText(toStatus).toUpperCase();

  return Boolean(toKey === "OPEN" && (!fromKey || fromKey === "OPEN"));
};

const hasMeaningfulEvent = (item) => {
  const fromStatus = normalizeText(item?.fromStatus ?? item?.oldStatus ?? item?.previousStatus);
  const toStatus = normalizeText(item?.toStatus ?? item?.newStatus ?? item?.status);
  const oldPriority = normalizeText(item?.oldPriority ?? item?.previousPriority);
  const newPriority = normalizeText(item?.newPriority ?? item?.currentPriority);
  const oldAgentId = item?.oldAgentId ?? item?.previousAgentId ?? null;
  const newAgentId = item?.newAgentId ?? item?.assignedAgentId ?? item?.agentId ?? null;

  return Boolean(
    isInitialOpenEvent(fromStatus, toStatus) ||
      (fromStatus && toStatus && fromStatus !== toStatus) ||
      (oldPriority && newPriority && oldPriority !== newPriority) ||
      (oldAgentId && newAgentId && oldAgentId !== newAgentId) ||
      (item?.note && item.note.trim())
  );
};

export default function CaseTimeline({ history = [], caseDetails = null }) {
  const formatDateStr = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const formatTimeStr = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const findAssignedName = (item) => {
    // prefer snapshot name from history row when available
    if (item?.newAgentName && String(item.newAgentName).trim()) return String(item.newAgentName).trim();

    // try to resolve assigned staff name from the current case details when available
    const newAgentId = item?.newAgentId ?? item?.assignedAgentId ?? item?.agentId ?? null;
    if (!newAgentId) return null;
    const assigned = caseDetails?.assignedSupport;
    if (assigned && assigned.id === newAgentId) {
      return `${assigned.firstName || ""} ${assigned.lastName || ""}`.trim();
    }
    // fallback: if history item includes changedBy relation for staff, that is not the assigned staff
    return null;
  };

  const timeline = Array.isArray(history)
    ? (() => {
        const sorted = [...history].sort((a, b) => {
          const dateA = getTimelineDate(a);
          const dateB = getTimelineDate(b);

          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;

          return dateA.getTime() - dateB.getTime();
        }).filter(hasMeaningfulEvent);

        const deduped = [];
        for (const item of sorted) {
          const prev = deduped[deduped.length - 1];
          if (!prev) {
            deduped.push(item);
            continue;
          }

          const prevFrom = normalizeText(prev?.fromStatus ?? prev?.oldStatus ?? prev?.previousStatus);
          const prevTo = normalizeText(prev?.toStatus ?? prev?.newStatus ?? prev?.status);
          const prevOldPr = normalizeText(prev?.oldPriority ?? prev?.previousPriority);
          const prevNewPr = normalizeText(prev?.newPriority ?? prev?.currentPriority);
          const prevOldAgent = prev?.oldAgentId ?? prev?.previousAgentId ?? null;
          const prevNewAgent = prev?.newAgentId ?? prev?.assignedAgentId ?? prev?.agentId ?? null;
          const prevNote = prev?.note && prev.note.trim();

          const curFrom = normalizeText(item?.fromStatus ?? item?.oldStatus ?? item?.previousStatus);
          const curTo = normalizeText(item?.toStatus ?? item?.newStatus ?? item?.status);
          const curOldPr = normalizeText(item?.oldPriority ?? item?.previousPriority);
          const curNewPr = normalizeText(item?.newPriority ?? item?.currentPriority);
          const curOldAgent = item?.oldAgentId ?? item?.previousAgentId ?? null;
          const curNewAgent = item?.newAgentId ?? item?.assignedAgentId ?? item?.agentId ?? null;
          const curNote = item?.note && item.note.trim();

          const identical = prevFrom === curFrom && prevTo === curTo && prevOldPr === curOldPr && prevNewPr === curNewPr && prevOldAgent === curOldAgent && prevNewAgent === curNewAgent && !prevNote && !curNote;

          if (!identical) deduped.push(item);
        }

        return deduped;
      })()
    : [];

  if (timeline.length === 0) {
    return <div className="text-gray-500 text-center py-8">No timeline available</div>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-6 text-navy-950">Case Timeline</h3>

      <div className="space-y-8">
        {timeline.map((item, index) => {
          const fromStatus = normalizeText(item?.fromStatus ?? item?.oldStatus ?? item?.previousStatus);
          const toStatus = normalizeText(item?.toStatus ?? item?.newStatus ?? item?.status);
          const oldPriority = normalizeText(item?.oldPriority ?? item?.previousPriority);
          const newPriority = normalizeText(item?.newPriority ?? item?.currentPriority);
          const oldAgentId = item?.oldAgentId ?? item?.previousAgentId ?? null;
          const newAgentId = item?.newAgentId ?? item?.assignedAgentId ?? item?.agentId ?? null;
          const hasStatusChange = Boolean(fromStatus && toStatus && fromStatus !== toStatus);
          const isOpenCreation = isInitialOpenEvent(fromStatus, toStatus);
          const hasPriorityChange = Boolean(oldPriority && newPriority && oldPriority !== newPriority);
          const hasAssignmentChange = Boolean(oldAgentId && newAgentId && oldAgentId !== newAgentId);
          const changedByName = getDisplayName(item?.changedBy ?? item?.actor ?? null);
          const timelineDate = getTimelineDate(item);
          const assignedName = findAssignedName(item);

          return (
            <div key={item.id || `${fromStatus}-${toStatus}-${oldPriority}-${newPriority}-${newAgentId}`} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-navy-600" />
                {index !== timeline.length - 1 && <div className="flex-1 w-[2px] bg-gray-300 mt-2" />}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 flex-1 border border-slate-200">
                <div className="flex justify-between items-center gap-3">
                  <StatusBadge status={(hasStatusChange ? toStatus : item?.status || toStatus || "OPEN").toUpperCase()} />
                  {timelineDate ? (
                    <span className="text-xs text-slate-500">{timelineDate.toLocaleString()}</span>
                  ) : (
                    <span className="text-xs text-slate-400">Date unavailable</span>
                  )}
                </div>

                {(hasStatusChange || isOpenCreation) && (
                  <h4 className="font-semibold text-navy-900 mt-3">
                    {getStatusEventText(fromStatus, toStatus)}
                  </h4>
                )}

                {!hasStatusChange && !isOpenCreation && item?.status && (
                  <h4 className="font-semibold text-navy-900 mt-3">{formatStatus(item.status)}</h4>
                )}

                {hasPriorityChange && (
                  <p className="text-sm text-orange-600 mt-2">
                    Priority updated: {formatPriority(oldPriority)} → {formatPriority(newPriority)}
                  </p>
                )}

                {hasAssignmentChange && (
                  <div className="mt-2 text-slate-700">
                    <p>Assigned to: {assignedName || (caseDetails?.assignedSupport ? `${caseDetails.assignedSupport.firstName || ""} ${caseDetails.assignedSupport.lastName || ""}`.trim() : "(staff)")}</p>
                    <p>Assigned by: {getDisplayName(item?.changedBy ?? item?.actor ?? null)}</p>
                  </div>
                )}

                {/* PENDING */}
                {hasStatusChange && toStatus?.toUpperCase() === "PENDING" && (
                  <div className="mt-2 text-slate-700">
                    <p className="font-medium">Pending reason: {item?.reason || item?.note || "(no reason provided)"}</p>
                    <p>Performed by: {getDisplayName(item?.changedBy ?? item?.actor ?? null)}</p>
                    <p>Previous status: {formatStatus(fromStatus)}</p>
                  </div>
                )}

                {/* ESCALATED */}
                {hasStatusChange && toStatus?.toUpperCase() === "ESCALATED" && (
                  <div className="mt-2 text-slate-700">
                    <p className="font-medium">Escalated to: {item?.reason || item?.note || "(team/person not specified)"}</p>
                    <p>Escalated by: {getDisplayName(item?.changedBy ?? item?.actor ?? null)}</p>
                    <p>Previous status: {formatStatus(fromStatus)}</p>
                  </div>
                )}

                {/* RESOLVED */}
                {hasStatusChange && toStatus?.toUpperCase() === "RESOLVED" && (
                  <div className="mt-2 text-slate-700">
                    <p className="font-medium">Resolved by: {getDisplayName(item?.changedBy ?? item?.actor ?? null)}</p>
                    <p>Resolution: {item?.resolutionSnapshot || item?.note || item?.reason || caseDetails?.resolutionSummary || "(no resolution provided)"}</p>
                    <p>Previous status: {formatStatus(fromStatus)}</p>
                  </div>
                )}

                {/* CUSTOMER CONFIRMATION */}
                {hasStatusChange && toStatus?.toUpperCase() === "CUSTOMER CONFIRMATION" && (
                  <div className="mt-2 text-slate-700">
                    <p className="font-medium">Resolution ready for customer verification</p>
                    <p>Triggered by: {getDisplayName(item?.changedBy ?? item?.actor ?? null)}</p>
                    <p>Resolution: {item?.resolutionSnapshot || item?.note || caseDetails?.resolutionSummary || "(no resolution provided)"}</p>
                    <p>Confirmation deadline: {formatDateStr(new Date(getTimelineDate(item)?.getTime() + 2 * 24 * 60 * 60 * 1000))} {formatTimeStr(new Date(getTimelineDate(item)?.getTime() + 2 * 24 * 60 * 60 * 1000))}</p>
                    <p>Previous status: {formatStatus(fromStatus)}</p>
                  </div>
                )}

                {/* Auto no-response -> back to IN_PROGRESS */}
                {hasStatusChange && fromStatus?.toUpperCase() === "CUSTOMER CONFIRMATION" && toStatus?.toUpperCase() === "IN PROGRESS" && (item?.actorType === "SYSTEM" || (item?.actorType || "").toUpperCase() === "SYSTEM") && (
                  <div className="mt-2 text-slate-700">
                    <p className="font-medium">Customer did not respond within the confirmation period — returning to active work</p>
                    <p>Performed by: System</p>
                    <p>Checked: {formatDateStr(timelineDate)} {formatTimeStr(timelineDate)}</p>
                    <p>Previous status: Customer Confirmation</p>
                    <p>New status: In Progress</p>
                  </div>
                )}

                {/* CLOSED */}
                {hasStatusChange && toStatus?.toUpperCase() === "CLOSED" && (
                  <div className="mt-2 text-slate-700">
                    <p className="font-medium">Case closed</p>
                    <p>Closed by: {getDisplayName(item?.changedBy ?? item?.actor ?? null)}</p>
                    <p>Previous status: {formatStatus(fromStatus)}</p>
                  </div>
                )}

                {/* CANCELLED */}
                {hasStatusChange && toStatus?.toUpperCase() === "CANCELLED" && (
                  <div className="mt-2 text-slate-700">
                    <p className="font-medium">Case cancelled</p>
                    <p>Cancelled by: {getDisplayName(item?.changedBy ?? item?.actor ?? null)}</p>
                    <p>Reason: {item?.reason || item?.note || "(no reason provided)"}</p>
                    <p>Previous status: {formatStatus(fromStatus)}</p>
                  </div>
                )}

                {item?.note && <p className="mt-2 text-slate-600">{item.note}</p>}

                <p className="text-sm text-gray-500 mt-3">Changed by: {changedByName}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

