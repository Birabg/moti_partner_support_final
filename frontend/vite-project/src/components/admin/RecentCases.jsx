import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    ClipboardList,
    Clock3,
    Inbox,
    RefreshCw,
    User as UserIcon,
} from "lucide-react";

import { ReportsApi } from "../../api/reportsApi";
import caseApi from "../../api/caseApi";

const STATUS_CONFIG = {
    OPEN: {
        label: "Open",
        className:
            "bg-[#edf4fd] text-[#527eb9] border-[#dbe7f8]",
        dot: "bg-[#527eb9]",
    },
    ASSIGNED: {
        label: "Assigned",
        className:
            "bg-[#eef1fb] text-[#5a6fb8] border-[#dfe4f6]",
        dot: "bg-[#5a6fb8]",
    },
    IN_PROGRESS: {
        label: "In Progress",
        className:
            "bg-[#edf7f3] text-[#3b8d73] border-[#d7ede7]",
        dot: "bg-[#3b8d73]",
    },
    PENDING: {
        label: "Pending",
        className:
            "bg-[#fff7e8] text-[#c58a27] border-[#f7e9cd]",
        dot: "bg-[#c58a27]",
    },
    PENDING_CUSTOMER: {
        label: "Pending",
        className:
            "bg-[#fff7e8] text-[#c58a27] border-[#f7e9cd]",
        dot: "bg-[#c58a27]",
    },
    ESCALATED: {
        label: "Escalated",
        className:
            "bg-[#fdf0f0] text-[#c65b5b] border-[#fadcdc]",
        dot: "bg-[#c65b5b]",
    },
    WAITING_CUSTOMER_FEEDBACK: {
        label: "Awaiting Customer",
        className:
            "bg-[#fbf2eb] text-[#b87842] border-[#f6e4d6]",
        dot: "bg-[#b87842]",
    },
    AWAITING_CUSTOMER: {
        label: "Awaiting Customer",
        className:
            "bg-[#fbf2eb] text-[#b87842] border-[#f6e4d6]",
        dot: "bg-[#b87842]",
    },
    AWAITING_CUSTOMER_RESPONSE: {
        label: "Awaiting Customer",
        className:
            "bg-[#fbf2eb] text-[#b87842] border-[#f6e4d6]",
        dot: "bg-[#b87842]",
    },
    AWAITING_CUSTOMER_FEEDBACK: {
        label: "Awaiting Customer",
        className:
            "bg-[#fbf2eb] text-[#b87842] border-[#f6e4d6]",
        dot: "bg-[#b87842]",
    },
    CUSTOMER_CONFIRMATION: {
        label: "Awaiting Customer",
        className:
            "bg-[#fbf2eb] text-[#b87842] border-[#f6e4d6]",
        dot: "bg-[#b87842]",
    },
    RESOLVED: {
        label: "Resolved",
        className:
            "bg-[#edf8f4] text-[#3d9b7a] border-[#d6ede5]",
        dot: "bg-[#3d9b7a]",
    },
    CLOSED: {
        label: "Closed",
        className:
            "bg-slate-100 text-slate-600 border-slate-200",
        dot: "bg-slate-400",
    },
    CANCELLED: {
        label: "Cancelled",
        className:
            "bg-[#f8eff1] text-[#9a6b75] border-[#f1dde2]",
        dot: "bg-[#9a6b75]",
    },
    CANCELED: {
        label: "Cancelled",
        className:
            "bg-[#f8eff1] text-[#9a6b75] border-[#f1dde2]",
        dot: "bg-[#9a6b75]",
    },
    REJECTED: {
        label: "Rejected",
        className:
            "bg-[#fdf0f0] text-[#c65b5b] border-[#fadcdc]",
        dot: "bg-[#c65b5b]",
    },
};

function getStatusConfig(status) {
    const normalized =
        String(status || "")
            .toUpperCase()
            .trim();

    return (
        STATUS_CONFIG[normalized] || {
            label:
                status || "Unknown",
            className:
                "bg-slate-100 text-slate-600 border-slate-200",
            dot: "bg-slate-400",
        }
    );
}

function getInitials(name) {
    if (!name) return "?";

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function formatDate(value) {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "N/A";
    }

    const now = new Date();

    const diffDays = Math.floor(
        (now - date) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 0) {
        return date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    if (diffDays === 1) {
        return "Yesterday";
    }

    if (diffDays < 7) {
        return `${diffDays} days ago`;
    }

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

// The backend exposes two different case shapes:
//  - admin report endpoint: { identity, lifecycle, actors, ... }
//  - standard case API:     { id, caseNumber, subject, status, customer, ... }
// This normalizes both into a single shape used by the UI below.
function normalizeCase(item) {
    if (!item) return null;

    const customerName =
        item?.actors?.creatorCustomer?.name ||
        item?.customer?.name ||
        [
            item?.customer?.firstName,
            item?.customer?.middleName,
            item?.customer?.lastName,
        ]
            .filter(Boolean)
            .join(" ") ||
        item?.customerName ||
        item?.creatorCustomer?.name ||
        "Customer";

    const id =
        item?.identity?.id ||
        item?.id ||
        item?.caseId ||
        "";

    return {
        id,
        caseNumber:
            item?.identity?.caseNumber ||
            item?.caseNumber ||
            "Support Request",
        subject:
            item?.identity?.subject ||
            item?.subject ||
            "Support Request",
        customerName: customerName || "Customer",
        status:
            item?.lifecycle?.status ||
            item?.status ||
            "OPEN",
        createdAt:
            item?.lifecycle?.createdAt ||
            item?.createdAt ||
            item?.lifecycle?.updatedAt ||
            item?.updatedAt ||
            null,
    };
}

export default function RecentCases() {
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            let rows = [];

            try {
                const response =
                    await ReportsApi.getCases(1, 5);

                rows = response?.data?.data || [];
            } catch (reportError) {
                // Fall back to the standard cases endpoint so the
                // dashboard still renders if the report scope is
                // unavailable for the current account.
                console.warn(
                    "Report recent cases failed, falling back:",
                    reportError
                );

                const fallback =
                    await caseApi.getAllCases(
                        1,
                        5,
                        "createdAt",
                        "desc"
                    );

                rows = fallback?.data?.data || [];
            }

            const normalized = Array.isArray(rows)
                ? rows
                      .map(normalizeCase)
                      .filter(Boolean)
                : [];

            const sorted = [...normalized].sort((a, b) => {
                const aTime = new Date(
                    a?.createdAt || 0
                ).getTime();

                const bTime = new Date(
                    b?.createdAt || 0
                ).getTime();

                const aValue =
                    Number.isNaN(aTime) ? 0 : aTime;

                const bValue =
                    Number.isNaN(bTime) ? 0 : bTime;

                return bValue - aValue;
            });

            setRecent(sorted.slice(0, 5));
        } catch (caughtError) {
            console.error(
                "Recent cases loading error:",
                caughtError
            );

            setError(
                caughtError?.response?.data?.message ||
                    "Unable to load recent cases."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        load();

        const handleCaseUpdated = () => {
            load(true);
        };

        const handleFocus = () => {
            load(true);
        };

        const intervalId = window.setInterval(() => {
            load(true);
        }, 20000);

        window.addEventListener(
            "cases:updated",
            handleCaseUpdated
        );

        window.addEventListener("focus", handleFocus);

        return () => {
            window.clearInterval(intervalId);

            window.removeEventListener(
                "cases:updated",
                handleCaseUpdated
            );

            window.removeEventListener(
                "focus",
                handleFocus
            );
        };
    }, [load]);

    return (
        <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03),0_8px_24px_rgba(15,23,42,0.025)]">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">

                <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#edf4fd] text-[#527eb9]">
                        <ClipboardList size={16} />
                    </div>

                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                            Live queue
                        </p>

                        <h3 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
                            Recent cases
                        </h3>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                            Latest requests from report analytics
                        </p>
                    </div>

                </div>

                <div className="flex shrink-0 items-center gap-2">

                    <button
                        type="button"
                        onClick={() => load(true)}
                        disabled={loading || refreshing}
                        title="Refresh recent cases"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#d9e5f4] hover:bg-[#f5f8fc] hover:text-[#527eb9] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            size={14}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />
                    </button>

                    <Link
                        to="/admin/cases"
                        className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-[#d9e5f4] hover:text-[#527eb9] sm:inline-flex"
                    >
                        View all
                        <ArrowRight size={12} />
                    </Link>

                </div>

            </div>

            {/* =====================================================
                CONTENT
            ===================================================== */}

            {loading ? (
                <div className="divide-y divide-slate-100">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div
                            key={item}
                            className="flex animate-pulse items-center gap-4 px-5 py-4 sm:px-6"
                        >
                            <div className="h-9 w-9 shrink-0 rounded-full bg-slate-100" />
                            <div className="min-w-0 flex-1">
                                <div className="h-3 w-1/3 rounded bg-slate-100" />
                                <div className="mt-2 h-2.5 w-2/3 rounded bg-slate-50" />
                            </div>
                            <div className="h-6 w-20 rounded-full bg-slate-100" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="px-6 py-10 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                        <Inbox size={18} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-red-700">
                        Unable to load recent cases
                    </p>

                    <p className="mt-1 text-xs text-red-500">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => load(true)}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-[#d9e5f4] hover:text-[#527eb9]"
                    >
                        <RefreshCw size={12} />
                        Try again
                    </button>
                </div>
            ) : recent.length === 0 ? (
                <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <Inbox size={18} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                        No cases found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Recent customer support cases will
                        appear here once data is available.
                    </p>
                </div>
            ) : (
                <ul className="divide-y divide-slate-100">
                    {recent.map((item) => {
                        const statusConfig =
                            getStatusConfig(item.status);

                        const to = item.id
                            ? `/admin/cases/${item.id}`
                            : "/admin/cases";

                        return (
                            <li key={item.id || item.caseNumber}>
                                <Link
                                    to={to}
                                    className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70 sm:px-6"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf4fd] text-[11px] font-bold text-[#527eb9]">
                                        {getInitials(
                                            item.customerName
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="truncate text-sm font-semibold text-[#101a28] group-hover:text-[#527eb9]"
                                            title={item.caseNumber}
                                        >
                                            {item.caseNumber}
                                        </p>

                                        <p
                                            className="mt-0.5 truncate text-xs text-slate-400"
                                            title={item.subject}
                                        >
                                            {item.subject}
                                        </p>

                                        <p className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 md:hidden">
                                            <UserIcon size={10} />
                                            <span className="truncate">
                                                {item.customerName}
                                            </span>
                                            <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                                            <Clock3 size={10} />
                                            <span className="shrink-0">
                                                {formatDate(
                                                    item.createdAt
                                                )}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="hidden shrink-0 flex-col items-end gap-1 md:flex">
                                        <p className="max-w-[160px] truncate text-xs font-medium text-slate-600">
                                            {item.customerName}
                                        </p>

                                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                            <Clock3 size={10} />
                                            {formatDate(
                                                item.createdAt
                                            )}
                                        </span>
                                    </div>

                                    <span
                                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusConfig.className}`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                                        />
                                        {statusConfig.label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* =====================================================
                FOOTER
            ===================================================== */}

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3 sm:px-6">
                <p className="text-[11px] text-slate-400">
                    Showing the{" "}
                    <span className="font-semibold text-slate-600">
                        {recent.length}
                    </span>{" "}
                    most recent cases
                </p>

                <Link
                    to="/admin/cases"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#527eb9] transition hover:text-[#3b6195]"
                >
                    Case tracking
                    <ArrowRight size={11} />
                </Link>
            </div>

        </section>
    );
}
