import {
    useEffect,
    useState,
} from "react";

import {
    FaTimes,
    FaTicketAlt,
    FaUser,
    FaTag,
    FaCalendarAlt,
    FaBuilding,
    FaLayerGroup,
    FaTools,
    FaFlag,
    FaPaperclip,
    FaClock,
    FaCheckCircle,
    FaExclamationTriangle,
    FaPauseCircle,
    FaArrowUp,
    FaRedo,
    FaBan,
    FaChevronDown,
} from "react-icons/fa";

import { useAuth } from "../../context/useAuth";

import caseApi, {
    getCase,
} from "../../api/caseApi";

import PutOnPendingModal from "./PutOnPendingModal";
import EscalateModal from "./EscalateModal";
import CancelCaseModal from "./CancelCaseModal";
import CaseTimeline from "./CaseTimeline";


/*
|--------------------------------------------------------------------------
| API URL
|--------------------------------------------------------------------------
*/

const API_BASE_URL = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
).replace(/\/$/, "");


/*
|--------------------------------------------------------------------------
| Attachment URL
|--------------------------------------------------------------------------
*/

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

    if (
        attachment.url &&
        /^https?:\/\//i.test(attachment.url)
    ) {
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
            return `${API_BASE_URL}/uploads/${encodeURIComponent(
                fileName
            )}`;
        }
    }

    if (attachment.fileName) {
        return `${API_BASE_URL}/uploads/${encodeURIComponent(
            attachment.fileName
        )}`;
    }

    return "";
};


/*
|--------------------------------------------------------------------------
| Status configuration
|--------------------------------------------------------------------------
*/

const statusConfig = {
    OPEN: {
        label: "Open",
        className: "bg-blue-50 text-blue-700 border-blue-100",
        dot: "bg-blue-500",
        icon: FaTicketAlt,
    },

    ASSIGNED: {
        label: "Assigned",
        className: "bg-indigo-50 text-indigo-700 border-indigo-100",
        dot: "bg-indigo-500",
        icon: FaUser,
    },

    IN_PROGRESS: {
        label: "In Progress",
        className: "bg-amber-50 text-amber-700 border-amber-100",
        dot: "bg-amber-500",
        icon: FaTools,
    },

    PENDING: {
        label: "Pending",
        className: "bg-orange-50 text-orange-700 border-orange-100",
        dot: "bg-orange-500",
        icon: FaPauseCircle,
    },

    ESCALATED: {
        label: "Escalated",
        className: "bg-red-50 text-red-700 border-red-100",
        dot: "bg-red-500",
        icon: FaArrowUp,
    },

    RESOLVED: {
        label: "Resolved",
        className: "bg-emerald-50 text-emerald-700 border-emerald-100",
        dot: "bg-emerald-500",
        icon: FaCheckCircle,
    },

    CUSTOMER_CONFIRMATION: {
        label: "Customer Confirmation",
        className: "bg-violet-50 text-violet-700 border-violet-100",
        dot: "bg-violet-500",
        icon: FaClock,
    },

    CLOSED: {
        label: "Closed",
        className: "bg-slate-100 text-slate-600 border-slate-200",
        dot: "bg-slate-500",
        icon: FaCheckCircle,
    },

    CANCELLED: {
        label: "Cancelled",
        className: "bg-red-50 text-red-700 border-red-100",
        dot: "bg-red-500",
        icon: FaBan,
    },

    REJECTED: {
        label: "Rejected",
        className: "bg-red-50 text-red-700 border-red-100",
        dot: "bg-red-500",
        icon: FaBan,
    },
};


/*
|--------------------------------------------------------------------------
| Priority configuration
|--------------------------------------------------------------------------
*/

const priorityConfig = {
    LOW: {
        label: "Low",
        className: "text-slate-600 bg-slate-50 border-slate-200",
    },

    MEDIUM: {
        label: "Medium",
        className: "text-amber-700 bg-amber-50 border-amber-100",
    },

    HIGH: {
        label: "High",
        className: "text-orange-700 bg-orange-50 border-orange-100",
    },

    URGENT: {
        label: "Urgent",
        className: "text-red-700 bg-red-50 border-red-100",
    },

    CRITICAL: {
        label: "Critical",
        className: "text-red-700 bg-red-50 border-red-100",
    },
};


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const normalizeStatus = (value) =>
    String(value || "")
        .toUpperCase()
        .replace(/\s+/g, "_");


const formatStatus = (value) => {
    const normalized = normalizeStatus(value);

    return (
        statusConfig[normalized]?.label ||
        normalized
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase()) ||
        "Unknown"
    );
};


const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const formatDateTime = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};


/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function CaseDetailsDrawer({
    caseData,
    close,
}) {
    const { user } = useAuth();

    const [
        fullCase,
        setFullCase,
    ] = useState(caseData || null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState(null);

    const [
        showPendingModal,
        setShowPendingModal,
    ] = useState(false);

    const [
        showEscalateModal,
        setShowEscalateModal,
    ] = useState(false);

    const [
        showCancelModal,
        setShowCancelModal,
    ] = useState(false);

    const [
        showMoreActions,
        setShowMoreActions,
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | Resolve user role
    |--------------------------------------------------------------------------
    */

    const resolveUserRole = (account) => {
        if (!account) return "customer";

        if (account.role) {
            return String(account.role).toLowerCase();
        }

        if (account.isSAdmin) return "admin";
        if (account.isManager) return "manager";
        if (account.isPSsupport) return "agent";
        if (account.isDirector) return "director";

        return String(
            account.partyType || "customer"
        ).toLowerCase();
    };


    const userRole = resolveUserRole(user);

    const isStaff = [
        "agent",
        "manager",
        "admin",
        "director",
    ].includes(userRole);

    const isAdmin = userRole === "admin";

    const isCustomer = userRole === "customer";


    /*
    |--------------------------------------------------------------------------
    | Current status
    |--------------------------------------------------------------------------
    */

    const currentStatus = normalizeStatus(
        fullCase?.status
    );


    const currentStatusConfig =
        statusConfig[currentStatus] || {
            label: formatStatus(currentStatus),
            className:
                "bg-slate-100 text-slate-600 border-slate-200",
            dot: "bg-slate-500",
            icon: FaTicketAlt,
        };


    const StatusIcon =
        currentStatusConfig.icon || FaTicketAlt;


    /*
    |--------------------------------------------------------------------------
    | Customer ownership
    |--------------------------------------------------------------------------
    */

    const isCaseOwner = Boolean(
        fullCase &&
        (
            fullCase.customer?.id === user?.id ||
            fullCase.customerId === user?.id ||
            fullCase.userId === user?.id ||
            fullCase.customer?.userId === user?.id
        )
    );


    /*
    |--------------------------------------------------------------------------
    | Load / refresh case
    |--------------------------------------------------------------------------
    */

    const refreshCase = async () => {
        if (!caseData?.id) return;

        try {
            const response = await getCase(
                caseData.id
            );

            const caseDetails =
                response?.data?.data ||
                response?.data ||
                null;

            setFullCase(
                caseDetails || caseData
            );
        } catch (err) {
            console.error(
                "Failed to refresh case details:",
                err
            );
        }
    };


    useEffect(() => {
        let mounted = true;

        const load = async () => {
            if (!caseData?.id) {
                setError(
                    "Unable to load case details: missing case identifier."
                );
                setLoading(false);
                return;
            }

            setError(null);
            setLoading(true);

            try {
                const response = await getCase(
                    caseData.id
                );

                const caseDetails =
                    response?.data?.data ||
                    response?.data ||
                    null;

                if (mounted) {
                    setFullCase(
                        caseDetails || caseData
                    );
                }
            } catch (err) {
                console.error(
                    "Failed to load case details:",
                    err
                );

                if (mounted) {
                    setFullCase(caseData);
                }
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
    }, [caseData]);


    /*
    |--------------------------------------------------------------------------
    | Reasons
    |--------------------------------------------------------------------------
    */

    const pendingReason =
        [...(fullCase?.statusHistory || [])]
            .reverse()
            .find(
                (item) =>
                    normalizeStatus(
                        item?.toStatus ??
                        item?.newStatus ??
                        item?.status
                    ) === "PENDING"
            )?.reason ||
        "No reason provided.";


    const escalationReason =
        [...(fullCase?.statusHistory || [])]
            .reverse()
            .find(
                (item) =>
                    normalizeStatus(
                        item?.toStatus ??
                        item?.newStatus ??
                        item?.status
                    ) === "ESCALATED"
            )?.reason ||
        "No escalation reason provided.";


    /*
    |--------------------------------------------------------------------------
    | Actions
    |--------------------------------------------------------------------------
    */

    const resumeCase = async () => {
        if (!fullCase?.id) return;

        try {
            await caseApi.updateStatus(
                fullCase.id,
                {
                    status: "IN_PROGRESS",
                    reason:
                        currentStatus === "PENDING"
                            ? "Case resumed after pending state."
                            : "Case resumed after escalation.",
                }
            );

            await refreshCase();
        } catch (err) {
            alert(
                err?.message ||
                "Failed to resume case"
            );
        }
    };


    const acceptResolution = async () => {
        if (!fullCase?.id) return;

        try {
            await caseApi.updateStatus(
                fullCase.id,
                {
                    status: "CLOSED",
                    reason:
                        "Customer accepted the resolution.",
                }
            );

            await refreshCase();
        } catch (err) {
            alert(
                err?.message ||
                "Unable to accept resolution"
            );
        }
    };


    const rejectResolution = async () => {
        if (!fullCase?.id) return;

        try {
            await caseApi.updateStatus(
                fullCase.id,
                {
                    status: "IN_PROGRESS",
                    reason:
                        "Customer rejected the resolution and requested rework.",
                }
            );

            await refreshCase();
        } catch (err) {
            alert(
                err?.message ||
                "Unable to reject resolution"
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Primary actions
    |--------------------------------------------------------------------------
    */

    const primaryActions = [];

    if (currentStatus === "IN_PROGRESS") {
        if (isStaff) {
            primaryActions.push({
                label: "Put on Pending",
                icon: FaPauseCircle,
                onClick: () =>
                    setShowPendingModal(true),
                className:
                    "bg-amber-500 text-white hover:bg-amber-600",
            });

            primaryActions.push({
                label: "Escalate",
                icon: FaArrowUp,
                onClick: () =>
                    setShowEscalateModal(true),
                className:
                    "bg-orange-500 text-white hover:bg-orange-600",
            });
        }
    }


    if (
        ["PENDING", "ESCALATED"].includes(
            currentStatus
        ) &&
        isStaff
    ) {
        primaryActions.push({
            label: "Resume Case",
            icon: FaRedo,
            onClick: resumeCase,
            className:
                "bg-emerald-600 text-white hover:bg-emerald-700",
        });
    }


    if (
        currentStatus === "CUSTOMER_CONFIRMATION" &&
        isCustomer
    ) {
        primaryActions.push({
            label: "Accept Resolution",
            icon: FaCheckCircle,
            onClick: acceptResolution,
            className:
                "bg-emerald-600 text-white hover:bg-emerald-700",
        });

        primaryActions.push({
            label: "Reject Resolution",
            icon: FaBan,
            onClick: rejectResolution,
            className:
                "bg-red-600 text-white hover:bg-red-700",
        });
    }


    /*
    |--------------------------------------------------------------------------
    | Customer name
    |--------------------------------------------------------------------------
    */

    const customerName =
        fullCase?.customer
            ? `${fullCase.customer.firstName || ""} ${fullCase.customer.lastName || ""}`.trim()
            : fullCase?.customerName ||
              "Customer";


    /*
    |--------------------------------------------------------------------------
    | Priority
    |--------------------------------------------------------------------------
    */

    const priority =
        String(
            fullCase?.priority || ""
        ).toUpperCase();

    const priorityInfo =
        priorityConfig[priority] || {
            label: fullCase?.priority || "Not assigned",
            className:
                "text-slate-500 bg-slate-50 border-slate-200",
        };


    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (error) {
        return (
            <>
                <div
                    className="fixed inset-0 z-40 bg-navy-900/30 backdrop-blur-[2px]"
                    onClick={close}
                />

                <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[620px] flex-col bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                        <h2 className="text-lg font-bold text-slate-900">
                            Case Details
                        </h2>

                        <button
                            type="button"
                            onClick={close}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="flex flex-1 items-center justify-center p-8">
                        <div className="max-w-sm text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                                <FaExclamationTriangle />
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-slate-900">
                                Unable to load case
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {error}
                            </p>
                        </div>
                    </div>
                </aside>
            </>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading && !fullCase) {
        return (
            <>
                <div
                    className="fixed inset-0 z-40 bg-navy-900/30 backdrop-blur-[2px]"
                    onClick={close}
                />

                <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[620px] flex-col bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                        <div className="h-6 w-40 animate-pulse rounded-lg bg-slate-200" />

                        <button
                            type="button"
                            onClick={close}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="space-y-4 p-6">
                        <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
                        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
                        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
                    </div>
                </aside>
            </>
        );
    }


    if (!fullCase) return null;


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-40 bg-navy-900/30 backdrop-blur-[2px]"
                onClick={close}
            />


            {/* Drawer */}
            <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[680px] flex-col overflow-hidden bg-slate-50 shadow-2xl slide-in-right">


                {/* =====================================================
                    HEADER
                ====================================================== */}

                <header className="shrink-0 border-b border-slate-200 bg-white">

                    <div className="flex items-start justify-between gap-4 px-5 py-5 sm:px-7">

                        <div className="flex min-w-0 items-center gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm">
                                <FaTicketAlt className="text-sm" />
                            </div>

                            <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-2">

                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Support Case
                                    </p>

                                    <span className="text-xs text-slate-300">
                                        •
                                    </span>

                                    <span className="text-xs font-medium text-slate-400">
                                        {fullCase.caseNumber || "N/A"}
                                    </span>

                                </div>

                                <h2 className="mt-1 truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                                    {fullCase.subject ||
                                        "Untitled Case"}
                                </h2>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={close}
                            aria-label="Close case details"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                            <FaTimes />
                        </button>

                    </div>


                    {/* Status bar */}

                    <div className="border-t border-slate-100 px-5 py-3 sm:px-7">

                        <div className="flex items-center justify-between gap-3">

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <FaCalendarAlt className="text-slate-400" />

                                Created{" "}
                                <span className="font-medium text-slate-700">
                                    {formatDate(
                                        fullCase.createdAt
                                    )}
                                </span>
                            </div>


                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${currentStatusConfig.className}`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${currentStatusConfig.dot}`}
                                />

                                {currentStatusConfig.label}
                            </span>

                        </div>

                    </div>

                </header>


                {/* =====================================================
                    CONTENT
                ====================================================== */}

                <div className="flex-1 overflow-y-auto">

                    <div className="space-y-5 p-5 sm:p-7">


                        {/* =================================================
                            CASE ACTIONS
                        ================================================== */}

                        {currentStatus !== "CANCELLED" && (
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                                <div className="flex items-center justify-between gap-3">

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Case Actions
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Available actions for this case
                                        </p>
                                    </div>


                                    {isAdmin && (
                                        <div className="relative">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowMoreActions(
                                                        (prev) => !prev
                                                    )
                                                }
                                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                More
                                                <FaChevronDown className="text-[9px]" />
                                            </button>


                                            {showMoreActions && (
                                                <div className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowMoreActions(
                                                                false
                                                            );

                                                            setShowCancelModal(
                                                                true
                                                            );
                                                        }}
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                                    >
                                                        <FaBan className="text-xs" />
                                                        Cancel Case
                                                    </button>

                                                </div>
                                            )}

                                        </div>
                                    )}

                                </div>


                                {primaryActions.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">

                                        {primaryActions.map(
                                            (action) => {
                                                const ActionIcon =
                                                    action.icon;

                                                return (
                                                    <button
                                                        key={
                                                            action.label
                                                        }
                                                        type="button"
                                                        onClick={
                                                            action.onClick
                                                        }
                                                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow ${action.className}`}
                                                    >
                                                        <ActionIcon className="text-xs" />
                                                        {action.label}
                                                    </button>
                                                );
                                            }
                                        )}

                                    </div>
                                )}


                                {primaryActions.length === 0 && (
                                    <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                                        No actions are currently available.
                                    </div>
                                )}

                            </section>
                        )}


                        {/* =================================================
                            PENDING NOTICE
                        ================================================== */}

                        {currentStatus === "PENDING" && (
                            <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5">

                                <div className="flex items-start gap-3">

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                        <FaPauseCircle />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-amber-900">
                                            Case is pending
                                        </h3>

                                        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-700">
                                            Pending reason
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-amber-900/80">
                                            {pendingReason}
                                        </p>
                                    </div>

                                </div>

                            </section>
                        )}


                        {/* =================================================
                            ESCALATION NOTICE
                        ================================================== */}

                        {currentStatus === "ESCALATED" && (
                            <section className="rounded-2xl border border-orange-100 bg-orange-50 p-5">

                                <div className="flex items-start gap-3">

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                                        <FaArrowUp />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-orange-900">
                                            Case has been escalated
                                        </h3>

                                        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-orange-700">
                                            Escalation information
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-orange-900/80">
                                            {escalationReason}
                                        </p>
                                    </div>

                                </div>

                            </section>
                        )}


                        {/* =================================================
                            CASE INFORMATION
                        ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-5 py-4">

                                <h3 className="text-sm font-bold text-slate-900">
                                    Case Information
                                </h3>

                                <p className="mt-1 text-xs text-slate-400">
                                    Details associated with this support request
                                </p>

                            </div>


                            <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2">

                                {/* Customer */}

                                <div className="bg-white p-5">

                                    <div className="flex items-center gap-2">
                                        <FaUser className="text-xs text-slate-400" />

                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            Customer
                                        </p>
                                    </div>

                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                        {customerName}
                                    </p>

                                </div>


                                {/* Status */}

                                <div className="bg-white p-5">

                                    <div className="flex items-center gap-2">
                                        <StatusIcon className="text-xs text-slate-400" />

                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            Status
                                        </p>
                                    </div>

                                    <div className="mt-2">

                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${currentStatusConfig.className}`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${currentStatusConfig.dot}`}
                                            />

                                            {currentStatusConfig.label}
                                        </span>

                                    </div>

                                </div>


                                {/* Category */}

                                <div className="bg-white p-5">

                                    <div className="flex items-center gap-2">
                                        <FaTag className="text-xs text-slate-400" />

                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            Category
                                        </p>
                                    </div>

                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                        {fullCase.productCategory?.name ||
                                            "Not specified"}
                                    </p>

                                </div>


                                {/* Subcategory */}

                                <div className="bg-white p-5">

                                    <div className="flex items-center gap-2">
                                        <FaLayerGroup className="text-xs text-slate-400" />

                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            Subcategory
                                        </p>
                                    </div>

                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                        {fullCase.productSubcategory?.name ||
                                            "Not specified"}
                                    </p>

                                </div>


                                {/* Service Type */}

                                <div className="bg-white p-5">

                                    <div className="flex items-center gap-2">
                                        <FaTools className="text-xs text-slate-400" />

                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            Service Type
                                        </p>
                                    </div>

                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                        {fullCase.serviceType?.name ||
                                            "Not specified"}
                                    </p>

                                </div>


                                {/* Branch */}

                                <div className="bg-white p-5">

                                    <div className="flex items-center gap-2">
                                        <FaBuilding className="text-xs text-slate-400" />

                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            Branch
                                        </p>
                                    </div>

                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                        {fullCase.branchName ||
                                            "Not specified"}
                                    </p>

                                </div>


                                {/* Priority */}

                                <div className="bg-white p-5">

                                    <div className="flex items-center gap-2">
                                        <FaFlag className="text-xs text-slate-400" />

                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            Priority
                                        </p>
                                    </div>

                                    <div className="mt-2">

                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityInfo.className}`}
                                        >
                                            {priorityInfo.label}
                                        </span>

                                    </div>

                                </div>


                                {/* Created */}

                                <div className="bg-white p-5">

                                    <div className="flex items-center gap-2">
                                        <FaCalendarAlt className="text-xs text-slate-400" />

                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            Created
                                        </p>
                                    </div>

                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                        {formatDateTime(
                                            fullCase.createdAt
                                        )}
                                    </p>

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            DESCRIPTION
                        ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center gap-2">

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                    <FaTicketAlt className="text-xs" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Case Description
                                    </h3>

                                    <p className="text-xs text-slate-400">
                                        Customer's explanation of the issue
                                    </p>
                                </div>

                            </div>


                            <div className="mt-4 rounded-xl bg-slate-50 p-4">

                                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                                    {fullCase.description ||
                                        fullCase.explanation ||
                                        "No description provided."}
                                </p>

                            </div>

                        </section>


                        {/* =================================================
                            ATTACHMENTS
                        ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-2">

                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                        <FaPaperclip className="text-xs" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Attachments
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            Files submitted with this case
                                        </p>
                                    </div>

                                </div>


                                {fullCase.attachments?.length > 0 && (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                                        {fullCase.attachments.length}{" "}
                                        {fullCase.attachments.length === 1
                                            ? "file"
                                            : "files"}
                                    </span>
                                )}

                            </div>


                            {fullCase.attachments?.length > 0 ? (

                                <div className="mt-4 space-y-2">

                                    {fullCase.attachments.map(
                                        (attachment, index) => {

                                            const url =
                                                getAttachmentUrl(
                                                    attachment
                                                );

                                            const label =
                                                attachment?.fileName ||
                                                attachment?.name ||
                                                `Attachment ${index + 1}`;

                                            return (
                                                <div
                                                    key={
                                                        attachment?.id ||
                                                        `${label}-${index}`
                                                    }
                                                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-white"
                                                >

                                                    <div className="flex min-w-0 items-center gap-3">

                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                                                            <FaPaperclip className="text-xs" />
                                                        </div>

                                                        <p className="truncate text-sm font-medium text-slate-700">
                                                            {label}
                                                        </p>

                                                    </div>


                                                    {url && (
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="shrink-0 rounded-lg bg-navy-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-navy-800"
                                                        >
                                                            View
                                                        </a>
                                                    )}

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            ) : (

                                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-4 text-center text-sm text-slate-400">
                                    No attachments were provided.
                                </div>

                            )}

                        </section>


                        {/* =================================================
                            TIMELINE
                        ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="mb-6">

                                <div className="flex items-center gap-2">

                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                        <FaClock className="text-xs" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Case Timeline
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            History of updates and status changes
                                        </p>
                                    </div>

                                </div>

                            </div>


                            <CaseTimeline
                                history={
                                    fullCase.statusHistory || []
                                }
                                caseDetails={fullCase}
                            />

                        </section>


                    </div>

                </div>


                {/* =====================================================
                    FOOTER
                ====================================================== */}

                <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">

                    <div className="flex items-center justify-between gap-4">

                        <div className="min-w-0">

                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Case Number
                            </p>

                            <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                                {fullCase.caseNumber || "N/A"}
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={close}
                            className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                            Close Details
                        </button>

                    </div>

                </footer>

            </aside>


            {/* =========================================================
                MODALS
            ========================================================== */}

            {showPendingModal && (
                <PutOnPendingModal
                    caseId={fullCase.id}
                    onClose={() =>
                        setShowPendingModal(false)
                    }
                    onSuccess={refreshCase}
                    api={caseApi}
                />
            )}


            {showEscalateModal && (
                <EscalateModal
                    caseId={fullCase.id}
                    onClose={() =>
                        setShowEscalateModal(false)
                    }
                    onSuccess={refreshCase}
                    api={caseApi}
                />
            )}


            {showCancelModal && (
                <CancelCaseModal
                    caseId={fullCase.id}
                    onClose={() =>
                        setShowCancelModal(false)
                    }
                    onSuccess={refreshCase}
                    api={caseApi}
                />
            )}

        </>
    );
}