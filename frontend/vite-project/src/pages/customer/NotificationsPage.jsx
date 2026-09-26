import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    Bell,
    BellRing,
    Check,
    CheckCheck,
    CheckCircle2,
    Flag,
    Inbox,
    KeyRound,
    Repeat2,
    RefreshCw,
    UserCheck,
    UserPlus,
} from "lucide-react";

import { useAuth } from "../../context/useAuth";
import { NotificationApi } from "../../api/notificationApi";
import AdminPageHero from "../../components/admin/AdminPageHero";
import CustomerPageHero from "../../components/customer/CustomerPageHero";

const PAGE_SIZE = 20;

const TYPE_CONFIG = {
    NEW_CUSTOMER_REGISTRATION: {
        label: "New customer registration",
        icon: UserPlus,
        tone: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    NEW_CASE_ARRIVED: {
        label: "New case arrived",
        icon: Inbox,
        tone: "bg-blue-50 text-blue-600 border-blue-100",
    },
    CASE_ASSIGNED: {
        label: "Case assigned",
        icon: UserCheck,
        tone: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    CASE_REASSIGNED: {
        label: "Case reassigned",
        icon: Repeat2,
        tone: "bg-violet-50 text-violet-600 border-violet-100",
    },
    CASE_STATUS_CHANGED: {
        label: "Case status changed",
        icon: RefreshCw,
        tone: "bg-sky-50 text-sky-600 border-sky-100",
    },
    CASE_CLOSED: {
        label: "Case closed",
        icon: CheckCircle2,
        tone: "bg-slate-100 text-slate-600 border-slate-200",
    },
    CASE_IN_PROGRESS: {
        label: "Case in progress",
        icon: Activity,
        tone: "bg-amber-50 text-amber-600 border-amber-100",
    },
    CASE_PRIORITY_CHANGED: {
        label: "Case priority changed",
        icon: Flag,
        tone: "bg-orange-50 text-orange-600 border-orange-100",
    },
    SIGNIN_HELP_REQUEST: {
        label: "Sign-in help request",
        icon: KeyRound,
        tone: "bg-rose-50 text-rose-600 border-rose-100",
    },
};

const DEFAULT_TYPE = {
    label: "Update",
    icon: Bell,
    tone: "bg-[#edf4fd] text-[#527eb9] border-[#dbe7f8]",
};

function getTypeConfig(type) {
    const normalized = String(type || "")
        .toUpperCase()
        .trim();

    return TYPE_CONFIG[normalized] || DEFAULT_TYPE;
}

function isUnread(notification) {
    return !notification?.isRead && !notification?.read;
}

function parseResponse(response) {
    const payload = response?.data?.data ?? response?.data ?? {};

    const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.notifications)
        ? payload.notifications
        : Array.isArray(payload?.items)
        ? payload.items
        : [];

    const meta = payload?.meta || response?.data?.meta || {};

    return { list, meta };
}

function startOfDay(date) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ).getTime();
}

function groupLabel(value) {
    if (!value) return "Earlier";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Earlier";

    const today = startOfDay(new Date());
    const day = startOfDay(date);
    const diffDays = Math.round(
        (today - day) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return "This week";

    return "Earlier";
}

function formatRelative(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const difference = Date.now() - date.getTime();
    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

function formatFull(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function resolveRole(user) {
    if (
        user?.isSAdmin ||
        user?.role === "SYSTEM_ADMIN" ||
        user?.userType === "SYSTEM_ADMIN"
    ) {
        return "admin";
    }

    if (
        user?.isPSsupport ||
        user?.role === "PS_SUPPORT" ||
        user?.userType === "PS_SUPPORT"
    ) {
        return "support";
    }

    if (
        user?.partyType === "CUSTOMER" ||
        user?.isCustomer
    ) {
        return "customer";
    }

    if (user?.isManager) return "manager";
    if (user?.isDirector) return "director";

    return "user";
}

function resolveCaseLink(role, caseId) {
    if (!caseId) return null;

    if (role === "admin") return `/admin/cases/${caseId}`;
    if (role === "support") return `/support/case/${caseId}`;
    if (role === "customer") return `/customer/case/${caseId}`;

    return null;
}

export default function CustomerNotifications() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const role = resolveRole(user);
    const admin = role === "admin";
    const Hero = admin ? AdminPageHero : CustomerPageHero;

    const [notifications, setNotifications] = useState([]);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    const [markingId, setMarkingId] = useState(null);
    const [markingAll, setMarkingAll] = useState(false);
    const [filter, setFilter] = useState("all");

    const requestRef = useRef(0);

    const load = useCallback(
        async (targetPage = 1, { append = false } = {}) => {
            const requestId = ++requestRef.current;

            try {
                if (append) {
                    setLoadingMore(true);
                } else if (targetPage === 1 && notifications.length > 0) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const response = await NotificationApi.list(
                    targetPage,
                    PAGE_SIZE
                );

                if (requestId !== requestRef.current) return;

                const { list, meta: responseMeta } =
                    parseResponse(response);

                setNotifications((current) => {
                    const merged = append
                        ? [...current, ...list]
                        : list;

                    const seen = new Set();

                    return merged.filter((notification) => {
                        const notificationType = String(
                            notification?.type ??
                                notification?.notificationType ??
                                ""
                        ).toUpperCase();

                        // Customer must never see anything priority related.
                        if (
                            notificationType ===
                            "CASE_PRIORITY_CHANGED"
                        ) {
                            return false;
                        }

                        const key =
                            notification?.id ??
                            `${notification?.createdAt}-${notification?.message}`;

                        if (seen.has(key)) return false;

                        seen.add(key);
                        return true;
                    });
                });

                setMeta(responseMeta || {});
                setPage(targetPage);
            } catch (caughtError) {
                if (requestId !== requestRef.current) return;

                console.error(
                    "Failed to load notifications:",
                    caughtError
                );

                setError(
                    caughtError?.response?.data?.message ||
                        "Unable to load notifications."
                );
            } finally {
                if (requestId === requestRef.current) {
                    setLoading(false);
                    setRefreshing(false);
                    setLoadingMore(false);
                }
            }
        },
        [notifications.length]
    );

    useEffect(() => {
        load(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const unreadCount = useMemo(
        () =>
            notifications.filter((notification) =>
                isUnread(notification)
            ).length,
        [notifications]
    );

    const visibleNotifications = useMemo(
        () =>
            filter === "unread"
                ? notifications.filter((notification) =>
                      isUnread(notification)
                  )
                : notifications,
        [notifications, filter]
    );

    const grouped = useMemo(() => {
        const sections = [];

        visibleNotifications.forEach((notification) => {
            const label = groupLabel(notification?.createdAt);

            let section = sections.find(
                (item) => item.label === label
            );

            if (!section) {
                section = { label, items: [] };
                sections.push(section);
            }

            section.items.push(notification);
        });

        return sections;
    }, [visibleNotifications]);

    const totalCount =
        Number(meta?.total) || notifications.length;

    const totalPages =
        Number(meta?.pages) ||
        (totalCount > PAGE_SIZE
            ? Math.ceil(totalCount / PAGE_SIZE)
            : 1);

    const hasMore = page < totalPages;

    async function handleMarkRead(notificationId) {
        try {
            setMarkingId(notificationId);

            await NotificationApi.markRead(notificationId);

            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, isRead: true, read: true }
                        : notification
                )
            );
        } catch (caughtError) {
            console.error(
                "Failed to mark notification as read:",
                caughtError
            );
        } finally {
            setMarkingId(null);
        }
    }

    async function handleMarkAllRead() {
        const unread = notifications.filter((notification) =>
            isUnread(notification)
        );

        if (unread.length === 0) return;

        try {
            setMarkingAll(true);

            await Promise.all(
                unread.map((notification) =>
                    NotificationApi.markRead(notification.id)
                )
            );

            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    isRead: true,
                    read: true,
                }))
            );
        } catch (caughtError) {
            console.error(
                "Failed to mark all notifications as read:",
                caughtError
            );
        } finally {
            setMarkingAll(false);
        }
    }

    function handleOpen(notification) {
        if (isUnread(notification)) {
            handleMarkRead(notification.id);
        }

        const caseId =
            notification?.caseReportId ||
            notification?.caseReport?.id;

        const link = resolveCaseLink(role, caseId);

        if (link) {
            navigate(link);
        }
    }

    return (
        <div className="space-y-6 pb-10">
            <Hero
                eyebrow={admin ? "Administration" : "Customer Portal"}
                title="Notifications"
                description="Review updates, alerts and status changes across the platform."
                icon={Bell}
                right={
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2.5 backdrop-blur-md">
                        <span
                            className={`h-2 w-2 rounded-full ${
                                unreadCount > 0
                                    ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,.8)]"
                                    : "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]"
                            }`}
                        />

                        <span className="text-[11px] font-semibold text-white/70">
                            {unreadCount > 0
                                ? `${unreadCount} unread`
                                : "All caught up"}
                        </span>
                    </div>
                }
            />

            {/* =====================================================
                NOTIFICATIONS PANEL
            ===================================================== */}

            <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03),0_8px_24px_rgba(15,23,42,0.025)]">

                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#edf4fd] text-[#527eb9]">
                            <BellRing size={16} />
                        </div>

                        <div>
                            <h3 className="text-base font-bold tracking-[-0.02em] text-[#101a28]">
                                Your inbox
                            </h3>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                                {unreadCount > 0
                                    ? `${unreadCount} unread of ${totalCount}`
                                    : `${totalCount} ${
                                          totalCount === 1
                                              ? "notification"
                                              : "notifications"
                                      }`}
                            </p>
                        </div>

                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/70 p-0.5">
                            <button
                                type="button"
                                onClick={() => setFilter("all")}
                                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${
                                    filter === "all"
                                        ? "bg-white text-[#17345c] shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                All
                                <span
                                    className={`rounded-full px-1.5 text-[10px] ${
                                        filter === "all"
                                            ? "bg-slate-100 text-slate-600"
                                            : "bg-slate-200/70 text-slate-500"
                                    }`}
                                >
                                    {totalCount}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFilter("unread")}
                                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${
                                    filter === "unread"
                                        ? "bg-white text-[#17345c] shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                Unread
                                <span
                                    className={`rounded-full px-1.5 text-[10px] ${
                                        filter === "unread"
                                            ? "bg-[#edf4fd] text-[#527eb9]"
                                            : "bg-slate-200/70 text-slate-500"
                                    }`}
                                >
                                    {unreadCount}
                                </span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => load(1)}
                            disabled={loading || refreshing}
                            title="Refresh notifications"
                            aria-label="Refresh notifications"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#d9e5f4] hover:bg-[#f5f8fc] hover:text-[#527eb9] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                size={14}
                                className={
                                    refreshing ? "animate-spin" : ""
                                }
                            />
                        </button>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                disabled={markingAll}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#17345c] px-3.5 text-[11px] font-semibold text-white transition hover:bg-[#102949] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <CheckCheck size={13} />
                                {markingAll
                                    ? "Marking..."
                                    : "Mark all read"}
                            </button>
                        )}

                    </div>

                </div>

                {/* =================================================
                    BODY
                ================================================= */}

                {loading ? (
                    <div className="divide-y divide-slate-100">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div
                                key={item}
                                className="flex animate-pulse items-start gap-4 px-5 py-5 sm:px-6"
                            >
                                <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />

                                <div className="min-w-0 flex-1">
                                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                                    <div className="mt-2 h-2.5 w-2/3 rounded bg-slate-50" />
                                    <div className="mt-2 h-2 w-1/4 rounded bg-slate-50" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="px-6 py-14 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <AlertTriangle size={20} />
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-red-700">
                            Unable to load notifications
                        </h3>

                        <p className="mx-auto mt-1 max-w-sm text-xs text-red-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => load(1)}
                            className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#d9e5f4] hover:text-[#527eb9]"
                        >
                            <RefreshCw size={12} />
                            Try again
                        </button>
                    </div>
                ) : visibleNotifications.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <Inbox size={22} />
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-slate-800">
                            {filter === "unread"
                                ? "No unread notifications"
                                : "No notifications yet"}
                        </h3>

                        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
                            {filter === "unread"
                                ? "You have read everything. New alerts will appear here."
                                : "Updates about your cases and account activity will appear here."}
                        </p>
                    </div>
                ) : (
                    <div>
                        {grouped.map((section) => (
                            <div key={section.label}>
                                <div className="sticky top-0 z-10 flex items-center gap-2 border-y border-slate-100 bg-slate-50/90 px-5 py-2 backdrop-blur sm:px-6">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                        {section.label}
                                    </span>

                                    <span className="text-[10px] text-slate-300">
                                        {section.items.length}
                                    </span>
                                </div>

                                <ul className="divide-y divide-slate-100">
                                    {section.items.map(
                                        (notification) => {
                                            const unread =
                                                isUnread(notification);
                                            const marking =
                                                markingId ===
                                                notification.id;

                                            const config =
                                                getTypeConfig(
                                                    notification.type
                                                );

                                            const Icon = config.icon;

                                            const caseNumber =
                                                notification.caseReport
                                                    ?.caseNumber;

                                            const caseId =
                                                notification.caseReportId ||
                                                notification.caseReport?.id;

                                            const link = resolveCaseLink(
                                                role,
                                                caseId
                                            );

                                            return (
                                                <li
                                                    key={
                                                        notification.id
                                                    }
                                                    className={`group relative flex items-start gap-4 px-5 py-5 transition-colors sm:px-6 ${
                                                        unread
                                                            ? "bg-[#f8fbff]"
                                                            : "bg-white hover:bg-slate-50/70"
                                                    }`}
                                                >
                                                    {unread && (
                                                        <span className="absolute left-0 top-0 h-full w-[3px] bg-[#527eb9]" />
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleOpen(
                                                                notification
                                                            )
                                                        }
                                                        className="flex min-w-0 flex-1 items-start gap-4 text-left"
                                                    >
                                                        <span
                                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${config.tone}`}
                                                        >
                                                            <Icon
                                                                size={16}
                                                            />
                                                        </span>

                                                        <span className="min-w-0 flex-1">
                                                            <span className="flex items-center gap-2">
                                                                <span className="truncate text-sm font-semibold text-[#101a28]">
                                                                    {
                                                                        config.label
                                                                    }
                                                                </span>

                                                                {unread && (
                                                                    <span className="inline-flex shrink-0 items-center rounded-full border border-[#dbe7f8] bg-[#edf4fd] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#527eb9]">
                                                                        New
                                                                    </span>
                                                                )}
                                                            </span>

                                                            <span className="mt-1 block whitespace-pre-wrap text-xs leading-5 text-slate-600">
                                                                {
                                                                    notification.message
                                                                }
                                                            </span>

                                                            <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                                {caseNumber && (
                                                                    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                                                        <Inbox
                                                                            size={
                                                                                10
                                                                            }
                                                                        />
                                                                        {
                                                                            caseNumber
                                                                        }
                                                                    </span>
                                                                )}

                                                                <span
                                                                    className="text-[10px] font-medium text-slate-400"
                                                                    title={formatFull(
                                                                        notification.createdAt
                                                                    )}
                                                                >
                                                                    {formatRelative(
                                                                        notification.createdAt
                                                                    )}
                                                                </span>

                                                                {link && (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#527eb9] opacity-0 transition-opacity group-hover:opacity-100">
                                                                        Open case
                                                                        <ArrowUpRight
                                                                            size={
                                                                                10
                                                                            }
                                                                        />
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </span>
                                                    </button>

                                                    {unread && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleMarkRead(
                                                                    notification.id
                                                                )
                                                            }
                                                            disabled={
                                                                marking
                                                            }
                                                            title="Mark as read"
                                                            aria-label="Mark notification as read"
                                                            className="mt-0.5 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 transition hover:border-[#d9e5f4] hover:bg-[#f5f8fc] hover:text-[#527eb9] disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <Check
                                                                size={11}
                                                            />
                                                            <span className="hidden sm:inline">
                                                                {marking
                                                                    ? "Saving..."
                                                                    : "Mark read"}
                                                            </span>
                                                        </button>
                                                    )}
                                                </li>
                                            );
                                        }
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* =================================================
                    FOOTER
                ================================================= */}

                {!loading && !error && visibleNotifications.length > 0 && (
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:px-6">
                        <p className="text-[11px] text-slate-400">
                            Showing{" "}
                            <span className="font-semibold text-slate-600">
                                {visibleNotifications.length}
                            </span>{" "}
                            {filter === "unread"
                                ? "unread"
                                : "of " + totalCount}
                        </p>

                        {hasMore ? (
                            <button
                                type="button"
                                onClick={() =>
                                    load(page + 1, { append: true })
                                }
                                disabled={loadingMore}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-[#d9e5f4] hover:text-[#527eb9] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={12}
                                    className={
                                        loadingMore
                                            ? "animate-spin"
                                            : ""
                                    }
                                />
                                {loadingMore
                                    ? "Loading..."
                                    : "Load older notifications"}
                            </button>
                        ) : (
                            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-300">
                                End of list
                            </span>
                        )}
                    </div>
                )}

            </section>
        </div>
    );
}
