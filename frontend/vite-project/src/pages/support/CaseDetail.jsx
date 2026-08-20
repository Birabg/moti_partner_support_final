import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SupportHeader from "../../components/support/SupportHeader";
import StatusTimeline from "../../components/support/StatusTimeline";
import ResolutionModal from "../../components/support/ResolutionModal";
import { supportApi } from "../../api/supportApi";
import caseApi from '../../api/caseApi';
import PutOnPendingModal from '../../components/cases/PutOnPendingModal';
import EscalateModal from '../../components/cases/EscalateModal';
import CancelCaseModal from '../../components/cases/CancelCaseModal';
import { useAuth } from '../../context/useAuth';

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const getAttachmentUrl = (attachment) => {
  if (!attachment) return "";

  if (typeof attachment === "string") {
    if (/^https?:\/\//i.test(attachment)) return attachment;
    const fileName = attachment.split("/").pop();
    return fileName ? `${API_BASE_URL}/uploads/${encodeURIComponent(fileName)}` : "";
  }

  if (attachment.url && /^https?:\/\//i.test(attachment.url)) return attachment.url;

  const storagePath = attachment.storagePath || attachment.filePath || attachment.path || attachment.fileName || "";
  if (storagePath) {
    if (/^https?:\/\//i.test(storagePath)) return storagePath;
    const fileName = storagePath.replace(/\\/g, "/").split("/").filter(Boolean).pop();
    if (fileName) return `${API_BASE_URL}/uploads/${encodeURIComponent(fileName)}`;
  }

  if (attachment.fileName) {
    return `${API_BASE_URL}/uploads/${encodeURIComponent(attachment.fileName)}`;
  }

  return "";
};

export default function CaseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    let m = true;
    supportApi.getCase(id).then((res) => m && setData(res?.data?.data)).catch(console.error);
    return () => (m = false);
  }, [id]);

  const startResolve = () => setResolving(true);

  const submitResolution = async (text) => {
    try {
      await supportApi.resolveCase(id, { resolution: text });
      setData((d) => ({ ...d, status: "RESOLVED" }));
      setResolving(false);
      window.dispatchEvent(new CustomEvent("cases:updated"));
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "Failed to resolve case";
      alert(msg);
    }
  };

  if (!data) return <div><SupportHeader />Loading case...</div>;

  const currentStatus = String(data.status || "").toUpperCase().replace(/\s+/g, "_");
  const resolveUserRole = (account) => {
    if (!account) return "customer";
    if (account.role) return String(account.role).toLowerCase();
    if (account.isSAdmin) return "admin";
    if (account.isManager) return "manager";
    if (account.isPSsupport) return "agent";
    if (account.isDirector) return "director";
    return String(account.partyType || "customer").toLowerCase();
  };
  const userRole = resolveUserRole(user);
  const isSupportStaff = ["agent", "manager", "admin", "director"].includes(userRole);
  const isAdmin = userRole === "admin";
  const pendingReason = data?.pendingReason || data?.statusReason || "No reason provided.";
  const escalationReason = data?.escalationReason || "No escalation reason provided.";

  const actions = [];
  if (currentStatus === "IN_PROGRESS") {
    actions.push({ label: "Put on Pending", onClick: () => setShowPendingModal(true), className: "bg-yellow-500" });
    actions.push({ label: "Escalate", onClick: () => setShowEscalateModal(true), className: "bg-orange-600" });
    actions.push({ label: "Resolve Case", onClick: startResolve, className: "bg-blue-600" });
  }

  if (["PENDING", "ESCALATED"].includes(currentStatus) && isSupportStaff) {
    actions.push({ label: "Resume Case", onClick: async () => {
      try {
        await caseApi.updateStatus(data.id, { status: "IN_PROGRESS", reason: "Case resumed from support queue." });
        setData((d) => ({ ...d, status: "IN_PROGRESS" }));
        window.dispatchEvent(new CustomEvent("cases:updated"));
      } catch (err) {
        alert(err?.message || "Failed to resume case");
      }
    }, className: "bg-emerald-600" });
  }

  return (
    <div>
      <SupportHeader />
      <div className="ps-container space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{data.caseNumber || data.id}</div>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{data.subject}</h2>
            </div>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              {data.status}
            </span>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">Case Actions</h3>
              {isAdmin && currentStatus !== "CANCELLED" && (
                <div className="relative">
                  <button onClick={() => setShowCancelModal(true)} className="rounded border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600">
                    More Actions
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {actions.map((action) => (
                <button key={action.label} onClick={action.onClick} className={`rounded px-3 py-2 text-sm font-medium text-white ${action.className}`}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {currentStatus === "PENDING" && (
          <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="font-semibold uppercase tracking-wide">Pending reason</div>
            <p className="mt-2">{pendingReason}</p>
          </div>
        )}

        {currentStatus === "ESCALATED" && (
          <div className="rounded-xl border-l-4 border-orange-500 bg-orange-50 p-4 text-sm text-orange-900">
            <div className="font-semibold uppercase tracking-wide">Escalation information</div>
            <p className="mt-2">{escalationReason}</p>
          </div>
        )}

        {data.attachments?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h3>Attachments</h3>
            <ul style={{ marginTop: 8, paddingLeft: 18 }}>
              {data.attachments.map((attachment) => {
                const url = getAttachmentUrl(attachment);
                const label = attachment?.fileName || attachment?.name || attachment?.originalName || "Attachment";

                return (
                  <li key={attachment?.id || label} style={{ marginBottom: 6 }}>
                    {url ? (
                      <a href={url} target="_blank" rel="noreferrer" style={{ color: "#0f4c81", textDecoration: "underline" }}>
                        {label}
                      </a>
                    ) : (
                      <span>{label}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <h3>Timeline</h3>
        <StatusTimeline events={data.timeline || []} />
      </div>

      {resolving && <ResolutionModal onClose={() => setResolving(false)} onSubmit={submitResolution} />}

      {showPendingModal && (
        <PutOnPendingModal
          caseId={data.id}
          onClose={() => setShowPendingModal(false)}
        onSuccess={async () => { setData((await caseApi.getCase(id)).data.data); }}
        api={caseApi}
        />
      )}

      {showEscalateModal && (
        <EscalateModal
          caseId={data.id}
          onClose={() => setShowEscalateModal(false)}
          onSuccess={async () => { setData((await caseApi.getCase(id)).data.data); }}
          api={caseApi}
        />
      )}

      {showCancelModal && (
        <CancelCaseModal
          caseId={data.id}
          onClose={() => setShowCancelModal(false)}
          onSuccess={async () => { setData((await caseApi.getCase(id)).data.data); }}
          api={caseApi}
        />
      )}
    </div>
  );
}
