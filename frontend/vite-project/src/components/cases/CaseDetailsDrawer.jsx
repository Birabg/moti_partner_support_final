import {

    useEffect,

    useState

} from "react";

import { useAuth } from "../../context/useAuth";
import caseApi, {

    getCase

} from "../../api/caseApi";
import PutOnPendingModal from "./PutOnPendingModal";
import EscalateModal from "./EscalateModal";
import CancelCaseModal from "./CancelCaseModal";

import CaseTimeline from "./CaseTimeline";

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


export default function CaseDetailsDrawer({
    caseData,

    close

}){

    const { user } = useAuth();
    const [

        fullCase,

        setFullCase

    ] = useState(caseData || null);
    const [error, setError] = useState(null);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [showEscalateModal, setShowEscalateModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showMoreActions, setShowMoreActions] = useState(false);

    const normalizeStatus = (value) => String(value || "").toUpperCase().replace(/\s+/g, "_");
    const currentStatus = normalizeStatus(fullCase?.status);
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
    const isStaff = ["agent", "manager", "admin", "director"].includes(userRole);
    const isAdmin = userRole === "admin";
    const isCustomer = userRole === "customer";
    const isCaseOwner = Boolean(
        fullCase && (
            fullCase.customer?.id === user?.id ||
            fullCase.customerId === user?.id ||
            fullCase.userId === user?.id ||
            fullCase.customer?.userId === user?.id
        )
    );

    const refreshCase = async () => {
        if (!caseData?.id) return;
        try {
            const response = await getCase(caseData.id);
            const caseDetails = response?.data?.data || response?.data || null;
            setFullCase(caseDetails || caseData);
        } catch (err) {
            console.error("Failed to refresh case details:", err);
        }
    };

    const pendingReason = [...(fullCase?.statusHistory || [])].reverse().find((item) => normalizeStatus(item?.toStatus ?? item?.newStatus ?? item?.status) === "PENDING")?.reason || "No reason provided.";
    const escalationReason = [...(fullCase?.statusHistory || [])].reverse().find((item) => normalizeStatus(item?.toStatus ?? item?.newStatus ?? item?.status) === "ESCALATED")?.reason || "No escalation reason provided.";

    const resumeCase = async () => {
        if (!fullCase?.id) return;
        try {
            await caseApi.updateStatus(fullCase.id, {
                status: "IN_PROGRESS",
                reason: currentStatus === "PENDING" ? "Case resumed after pending state." : "Case resumed after escalation."
            });
            await refreshCase();
        } catch (err) {
            alert(err?.message || "Failed to resume case");
        }
    };

    const resolveCase = async () => {
        if (!fullCase?.id) return;
        const summary = window.prompt("Please provide a resolution summary:");
        if (!summary || summary.trim().length < 10) {
            alert("A detailed resolution summary is required (minimum 10 characters).")
            return;
        }
        try {
            await caseApi.updateStatus(fullCase.id, {
                status: "RESOLVED",
                resolutionSummary: summary.trim(),
                reason: "Case resolved by support team."
            });
            await refreshCase();
        } catch (err) {
            alert(err?.message || "Failed to resolve case");
        }
    };

    const acceptResolution = async () => {
        if (!fullCase?.id) return;
        try {
            await caseApi.updateStatus(fullCase.id, {
                status: "CLOSED",
                reason: "Customer accepted the resolution."
            });
            await refreshCase();
        } catch (err) {
            alert(err?.message || "Unable to accept resolution");
        }
    };

    const rejectResolution = async () => {
        if (!fullCase?.id) return;
        try {
            await caseApi.updateStatus(fullCase.id, {
                status: "IN_PROGRESS",
                reason: "Customer rejected the resolution and requested rework."
            });
            await refreshCase();
        } catch (err) {
            alert(err?.message || "Unable to reject resolution");
        }
    };

    const primaryActions = [];

    if (currentStatus === "IN_PROGRESS") {
        if (isStaff || isCaseOwner) {
            primaryActions.push({ label: "Put on Pending", onClick: () => setShowPendingModal(true), tone: "green" });
        }
        if (isStaff) {
            primaryActions.push({ label: "Escalate", onClick: () => setShowEscalateModal(true), tone: "orange" });
            // Resolve action intentionally omitted from Case Details per UX request.
            // Resolution functionality remains available from other entry points (e.g., AssignedCases list).
        }
    }

    if (["PENDING", "ESCALATED"].includes(currentStatus) && isStaff) {
        primaryActions.push({ label: "Resume Case", onClick: resumeCase, tone: "green" });
    }

    if (currentStatus === "CUSTOMER_CONFIRMATION" && isCustomer) {
        primaryActions.push({ label: "Accept Resolution", onClick: acceptResolution, tone: "green" });
        primaryActions.push({ label: "Reject Resolution", onClick: rejectResolution, tone: "red" });
    }

    useEffect(()=>{

        async function load(){
            if (!caseData?.id) {
                setError("Unable to load case details: missing case identifier.");
                setFullCase(null);
                return;
            }

            setError(null);

            try {
                const response = await getCase(caseData.id);
                const caseDetails = response?.data?.data || response?.data || null;
                setFullCase(caseDetails || caseData);
            } catch (err) {
                console.error("Failed to load case details:", err);
                setFullCase(caseData);
                if (!caseData) {
                    setError("Unable to load case details. Please try again.");
                }
            }
        }

        load();

    },[caseData]);

    if (error){

        return(

            <div className="fixed right-0 top-0 h-screen w-[600px] bg-white shadow-2xl overflow-auto p-8 z-50">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Case details</h2>
                    <button onClick={close}>✕</button>
                </div>
                <div className="text-red-600">{error}</div>
            </div>

        );

    }

    if(!fullCase){

        return(

            <div className="fixed right-0 top-0 h-screen w-[600px] bg-white shadow-2xl overflow-auto p-8 z-50">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Case details</h2>
                    <button onClick={close}>✕</button>
                </div>
                <div>Loading case details…</div>
            </div>

        );

    }

    return(

        <div
            className="
            fixed
            right-0
            top-0
            h-screen
            w-[600px]
            bg-white
            shadow-2xl
            overflow-auto
            p-8
            z-50
            "
        >

            <div
                className="
                flex
                justify-between
                items-center
                mb-8
                "
            >

                <h2
                    className="
                    text-2xl
                    font-bold
                    "
                >

                    {

                        fullCase.caseNumber

                    }

                </h2>

                <button
                    onClick={close}
                >

                    ✕

                </button>

            </div>

            {currentStatus !== "CANCELLED" && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Case Actions</h3>
                        {isAdmin && (
                            <div className="relative">
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                                    onClick={() => setShowMoreActions((prev) => !prev)}
                                >
                                    More Actions
                                </button>
                                {showMoreActions && (
                                    <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                                        <button
                                            type="button"
                                            className="w-full rounded-md px-2 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                            onClick={() => {
                                                setShowMoreActions(false)
                                                setShowCancelModal(true)
                                            }}
                                        >
                                            Cancel Case
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {primaryActions.map((action) => (
                            <button
                                key={action.label}
                                type="button"
                                onClick={action.onClick}
                                className={[
                                    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition",
                                    action.tone === "amber" && "bg-amber-500 text-white hover:bg-amber-600",
                                    action.tone === "orange" && "bg-orange-500 text-white hover:bg-orange-600",
                                    action.tone === "blue" && "bg-blue-600 text-white hover:bg-blue-700",
                                    action.tone === "green" && "bg-emerald-600 text-white hover:bg-emerald-700",
                                    action.tone === "red" && "bg-red-600 text-white hover:bg-red-700",
                                ].filter(Boolean).join(" ")}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {currentStatus === "PENDING" && (
                <div className="mb-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-3 text-sm text-amber-900">
                    <div className="font-semibold uppercase tracking-wide">Pending reason</div>
                    <p className="mt-2">{pendingReason}</p>
                </div>
            )}

            {currentStatus === "ESCALATED" && (
                <div className="mb-6 rounded-xl border-l-4 border-orange-500 bg-orange-50 p-3 text-sm text-orange-900">
                    <div className="font-semibold uppercase tracking-wide">Escalation information</div>
                    <p className="mt-2">{escalationReason}</p>
                </div>
            )}

            <p>

                <b>Customer:</b>

                {" "}

                {
                    fullCase.customer
                        ? `${fullCase.customer.firstName || ""} ${fullCase.customer.lastName || ""}`.trim()
                        : fullCase.customerName || fullCase.customer?.name || "Customer"
                }

            </p>

            <p>

                <b>Status:</b>

                {" "}

                {

                    fullCase.status

                }

            </p>

            <p>
                <b>Subject:</b> {fullCase.subject || "—"}
            </p>

            <p>
                <b>Category:</b> {fullCase.productCategory?.name || "—"}
            </p>

            <p>
                <b>Subcategory:</b> {fullCase.productSubcategory?.name || "—"}
            </p>

            <p>
                <b>Service Type:</b> {fullCase.serviceType?.name || "—"}
            </p>

            <p>
                <b>Branch:</b> {fullCase.branchName || "—"}
            </p>

            <p>
                <b>Priority:</b> {fullCase.priority || "—"}
            </p>

            <p>
                <b>Explanation:</b>
                <br />
                {fullCase.description || fullCase.explanation || "—"}
            </p>

            <div>
                <b>Attachments:</b>
                {fullCase.attachments?.length > 0 ? (
                    <ul className="list-disc list-inside mt-2">
                        {fullCase.attachments.map((attachment) => {
                            const url = getAttachmentUrl(attachment);
                            const label = attachment.fileName || attachment.name || "Attachment";

                            return (
                                <li key={attachment.id || label}>
                                    {url ? (
                                        <a href={url} target="_blank" rel="noreferrer" className="text-blue-700 underline break-all">
                                            {label}
                                        </a>
                                    ) : (
                                        label
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    " —"
                )}
            </div>

            <CaseTimeline
                history={fullCase.statusHistory || []}
                caseDetails={fullCase}
            />

            {showPendingModal && (
                <PutOnPendingModal
                    caseId={fullCase.id}
                    onClose={() => setShowPendingModal(false)}
                    onSuccess={refreshCase}
                    api={caseApi}
                />
            )}

            {showEscalateModal && (
                <EscalateModal
                    caseId={fullCase.id}
                    onClose={() => setShowEscalateModal(false)}
                    onSuccess={refreshCase}
                    api={caseApi}
                />
            )}

            {showCancelModal && (
                <CancelCaseModal
                    caseId={fullCase.id}
                    onClose={() => setShowCancelModal(false)}
                    onSuccess={refreshCase}
                    api={caseApi}
                />
            )}

        </div>

    );

}