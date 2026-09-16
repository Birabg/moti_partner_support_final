import { useEffect, useMemo, useState } from "react";

import {
    Activity,
    ArrowRight,
    ArrowUpRight,
    BadgeCheck,
    BarChart3,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Inbox,
    Layers3,
    Loader2,
    ShieldCheck,
    Star,
    Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import Axios from "../../api/axios";
import { useAuth } from "../../context/useAuth";

import CaseStats from "../../components/cases/CaseStats";

const scopeConfig = {
    DEPARTMENT: {
        idKey: "departmentId",
        resource: "department",
        title: "Department",
    },

    DIVISION: {
        idKey: "divisionId",
        resource: "division",
        title: "Division",
    },

    SECTION: {
        idKey: "sectionId",
        resource: "section",
        title: "Section",
    },
};

const statusTone = {
    OPEN: {
        badge: "bg-amber-50 text-amber-700 border-amber-100",
        dot: "bg-amber-500",
    },

    IN_PROGRESS: {
        badge: "bg-blue-50 text-blue-700 border-blue-100",
        dot: "bg-blue-500",
    },

    ASSIGNED: {
        badge: "bg-indigo-50 text-indigo-700 border-indigo-100",
        dot: "bg-indigo-500",
    },

    CLOSED: {
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        dot: "bg-slate-500",
    },

    RESOLVED: {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
        dot: "bg-emerald-500",
    },

    PENDING: {
        badge: "bg-orange-50 text-orange-700 border-orange-100",
        dot: "bg-orange-500",
    },

    ESCALATED: {
        badge: "bg-red-50 text-red-700 border-red-100",
        dot: "bg-red-500",
    },

    CUSTOMER_CONFIRMATION: {
        badge: "bg-violet-50 text-violet-700 border-violet-100",
        dot: "bg-violet-500",
    },
};

function formatScopeLabel(value) {
    return value
        ? value
              .replace(/_/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (letter) => letter.toUpperCase())
        : "Unit";
}

function formatStatus(value) {
    if (!value) return "Unknown";

    return String(value)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPriority(value) {
    if (!value) return "Unknown";

    return String(value)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPriorityTone(priority) {
    const value = String(priority || "").toUpperCase();

    if (value === "CRITICAL") {
        return "bg-red-500";
    }

    if (value === "HIGH") {
        return "bg-orange-500";
    }

    if (value === "MEDIUM") {
        return "bg-amber-500";
    }

    if (value === "LOW") {
        return "bg-emerald-500";
    }

    return "bg-slate-400";
}

export default function ManagerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [snapshot, setSnapshot] = useState(null);

    const managerType = user?.managerType || "SECTION";

    const scopeMeta =
        scopeConfig[managerType] || scopeConfig.SECTION;

    const scopeId = user?.[scopeMeta.idKey];

    /* =========================================================
       LOAD DASHBOARD
    ========================================================= */

    useEffect(() => {
        if (!scopeId) {
            setLoading(false);
            setError(
                "Manager scope is missing from your session."
            );
            return;
        }

        let cancelled = false;

        async function loadDashboard() {
            try {
                setLoading(true);
                setError("");

                const response = await Axios.get(
                    `/manager/${scopeId}/${scopeMeta.resource}`
                );

                if (!cancelled) {
                    setSnapshot(response?.data?.data || null);
                }
            } catch (caughtError) {
                console.error(caughtError);

                if (!cancelled) {
                    setError(
                        "Unable to load your scoped analytics right now."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadDashboard();

        return () => {
            cancelled = true;
        };
    }, [scopeId, scopeMeta.resource]);

    /* =========================================================
       SUMMARY
    ========================================================= */

    const summary = useMemo(() => {
        const metrics = snapshot?.caseMetrics || {};
        const hierarchy = snapshot?.hierarchyMetrics || {};

        const cases = metrics.cases || [];
        const countByStatus = metrics.casesByStatus || {};

        return {
            totalCases:
                metrics.totalAssignedCases ||
                cases.length ||
                0,

            openCases:
                countByStatus.OPEN || 0,

            inProgressCases:
                (countByStatus.IN_PROGRESS || 0) +
                (countByStatus.ASSIGNED || 0),

            closedCases:
                (countByStatus.CLOSED || 0) +
                (countByStatus.RESOLVED || 0),

            avgRating: "—",

            totalStaff:
                hierarchy.totalSectionStaffCount ||
                hierarchy.totalDivisionStaffCount ||
                hierarchy.totalDepartmentStaffCount ||
                0,

            scopeName:
                snapshot?.[scopeMeta.resource]?.name ||
                "My Unit",

            scopeLabel:
                formatScopeLabel(scopeMeta.title),

            recentCases:
                cases.slice(0, 5),

            staffMembers:
                hierarchy.staffMembers ||
                hierarchy.sections ||
                [],

            priorityDistribution:
                cases.reduce((acc, item) => {
                    const priority = item.priority || "UNKNOWN";

                    acc[priority] =
                        (acc[priority] || 0) + 1;

                    return acc;
                }, {}),
        };
    }, [snapshot, scopeMeta.resource]);

    /* =========================================================
       STATUS CASES FOR CASESTATS
    ========================================================= */

    const statusCases = useMemo(() => {
        const countByStatus =
            snapshot?.caseMetrics?.casesByStatus || {};

        const buildList = (status, count) =>
            Array.from(
                {
                    length: Number(count || 0),
                },
                () => ({ status })
            );

        return [
            ...buildList(
                "OPEN",
                countByStatus.OPEN || summary.openCases
            ),

            ...buildList(
                "ASSIGNED",
                countByStatus.ASSIGNED || 0
            ),

            ...buildList(
                "IN_PROGRESS",
                countByStatus.IN_PROGRESS || 0
            ),

            ...buildList(
                "PENDING",
                countByStatus.PENDING || 0
            ),

            ...buildList(
                "ESCALATED",
                countByStatus.ESCALATED || 0
            ),

            ...buildList(
                "RESOLVED",
                countByStatus.RESOLVED || 0
            ),

            ...buildList(
                "CUSTOMER_CONFIRMATION",
                countByStatus.CUSTOMER_CONFIRMATION || 0
            ),

            ...buildList(
                "CLOSED",
                countByStatus.CLOSED || summary.closedCases
            ),
        ];
    }, [
        snapshot,
        summary.closedCases,
        summary.openCases,
    ]);

    /* =========================================================
       KPI DATA
    ========================================================= */

    const kpis = [
        {
            label: "Assigned Cases",
            value: summary.totalCases,
            description: "Cases within your scope",
            icon: Inbox,
            iconClass:
                "bg-blue-50 text-blue-600",
        },

        {
            label: "Open Cases",
            value: summary.openCases,
            description: "Waiting for action",
            icon: Clock3,
            iconClass:
                "bg-amber-50 text-amber-600",
        },

        {
            label: "In Progress",
            value: summary.inProgressCases,
            description: "Currently being handled",
            icon: Activity,
            iconClass:
                "bg-indigo-50 text-indigo-600",
        },

        {
            label: "Completed",
            value: summary.closedCases,
            description: "Resolved or closed",
            icon: CheckCircle2,
            iconClass:
                "bg-emerald-50 text-emerald-600",
        },
    ];

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="min-h-full bg-slate-50/70">

            <main className="ps-container space-y-7 pb-12">

                {/* =================================================
                    HERO
                ================================================= */}

                <section className="relative overflow-hidden rounded-[26px] bg-[#0b1d38] shadow-[0_16px_40px_rgba(15,35,65,0.10)]">

                    <div
                        className="absolute inset-0 opacity-[0.07]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                            backgroundSize: "32px 32px",
                        }}
                    />

                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

                    <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

                    <div className="relative flex flex-col gap-7 px-6 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <div className="mb-3 flex items-center gap-2">

                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                    Manager Workspace
                                </span>

                            </div>

                            <h1 className="text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                                {summary.scopeLabel} Overview
                            </h1>

                            <div className="mt-3 flex flex-wrap items-center gap-2">

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[10px] font-medium text-slate-300">
                                    <Building2 className="h-3 w-3" />
                                    {summary.scopeName}
                                </span>

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[10px] font-medium text-slate-300">
                                    <ShieldCheck className="h-3 w-3" />
                                    Manager Access
                                </span>

                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/manager/cases")
                            }
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-[#0b1d38] transition hover:bg-slate-100"
                        >
                            Open Case Tracking
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>

                    </div>
                </section>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                            <ShieldCheck className="h-4 w-4" />
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-red-800">
                                Dashboard unavailable
                            </p>

                            <p className="mt-1 text-xs text-red-600">
                                {error}
                            </p>
                        </div>

                    </div>
                )}

                {/* =================================================
                    KPI HEADER
                ================================================= */}

                <section>

                    <div className="mb-4">

                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600">
                            Performance Overview
                        </p>

                        <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-slate-950">
                            Case workload
                        </h2>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {kpis.map(
                            ({
                                label,
                                value,
                                description,
                                icon: Icon,
                                iconClass,
                            }) => (
                                <div
                                    key={label}
                                    className="group rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_25px_rgba(15,35,65,0.045)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,35,65,0.07)]"
                                >

                                    <div className="flex items-start justify-between">

                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
                                        >
                                            <Icon className="h-[18px] w-[18px]" />
                                        </div>

                                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-200 transition group-hover:text-slate-400" />

                                    </div>

                                    <div className="mt-6">

                                        <p className="text-xs font-medium text-slate-500">
                                            {label}
                                        </p>

                                        <div className="mt-1.5">

                                            {loading ? (
                                                <div className="h-9 w-12 animate-pulse rounded-md bg-slate-100" />
                                            ) : (
                                                <span className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                                                    {value}
                                                </span>
                                            )}

                                        </div>

                                        <p className="mt-2 text-[10px] text-slate-400">
                                            {description}
                                        </p>

                                    </div>
                                </div>
                            )
                        )}

                    </div>
                </section>

                {/* =================================================
                    CASE STATS
                ================================================= */}

                <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,35,65,0.045)]">

                    <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">

                        <div>

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <BarChart3 className="h-4 w-4" />
                                </div>

                                <div>

                                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
                                        Case Analytics
                                    </p>

                                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                                        Case status overview
                                    </h2>

                                </div>

                            </div>

                        </div>

                        <span className="text-[10px] font-medium text-slate-400">
                            {summary.totalCases} total assigned
                        </span>

                    </div>

                    <div className="p-4 sm:p-5">

                        <CaseStats cases={statusCases} />

                    </div>

                </section>

                {/* =================================================
                    RECENT CASES + STAFF
                ================================================= */}

                <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">

                    {/* Recent cases */}

                    <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,35,65,0.045)]">

                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Inbox className="h-4 w-4" />
                                </div>

                                <div>

                                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
                                        Case Management
                                    </p>

                                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                                        Recent Assigned Cases
                                    </h2>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/manager/cases")
                                }
                                className="hidden items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 sm:inline-flex"
                            >
                                View all
                                <ChevronRight className="h-3 w-3" />
                            </button>

                        </div>

                        <div className="divide-y divide-slate-100">

                            {loading ? (
                                [1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-4 px-6 py-5"
                                    >

                                        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

                                        <div className="flex-1 space-y-2">

                                            <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-100" />

                                            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />

                                        </div>

                                    </div>
                                ))
                            ) : summary.recentCases.length === 0 ? (
                                <div className="px-6 py-14 text-center">

                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                        <Inbox className="h-5 w-5" />
                                    </div>

                                    <p className="mt-4 text-sm font-semibold text-slate-800">
                                        No assigned cases
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        No cases were found within this unit.
                                    </p>

                                </div>
                            ) : (
                                summary.recentCases.map(
                                    (item, index) => {
                                        const status =
                                            String(
                                                item.status || ""
                                            ).toUpperCase();

                                        const tone =
                                            statusTone[status] ||
                                            {
                                                badge:
                                                    "bg-slate-50 text-slate-600 border-slate-200",
                                                dot:
                                                    "bg-slate-400",
                                            };

                                        return (
                                            <div
                                                key={
                                                    item.id ||
                                                    `${item.caseNumber}-${index}`
                                                }
                                                className="group flex items-center gap-4 px-6 py-4 transition hover:bg-slate-50/60"
                                            >

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                                                    <BriefcaseBusiness className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">

                                                    <div className="flex items-center gap-2">

                                                        <p className="truncate text-sm font-semibold text-slate-900">
                                                            {item.caseNumber ||
                                                                item.id}
                                                        </p>

                                                        <span className="hidden text-[10px] text-slate-300 sm:inline">
                                                            •
                                                        </span>

                                                        <span className="hidden text-[10px] text-slate-400 sm:inline">
                                                            {item.priority}
                                                        </span>

                                                    </div>

                                                    <p className="mt-1 truncate text-xs text-slate-400">
                                                        {item.subject ||
                                                            "No subject provided"}
                                                    </p>

                                                </div>

                                                <div className="flex shrink-0 items-center gap-3">

                                                    <span
                                                        className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] sm:inline-flex ${tone.badge}`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${tone.dot}`}
                                                        />

                                                        {formatStatus(
                                                            status
                                                        )}
                                                    </span>

                                                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-blue-500" />

                                                </div>

                                            </div>
                                        );
                                    }
                                )
                            )}

                        </div>

                    </section>

                    {/* Staff */}

                    <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,35,65,0.045)]">

                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <Users className="h-4 w-4" />
                                </div>

                                <div>

                                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                                        Team
                                    </p>

                                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                                        Staff in My Unit
                                    </h2>

                                </div>

                            </div>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                                {summary.totalStaff}
                            </span>

                        </div>

                        <div className="divide-y divide-slate-100">

                            {loading ? (
                                [1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3 px-6 py-4"
                                    >
                                        <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />

                                        <div className="flex-1 space-y-2">

                                            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />

                                            <div className="h-2.5 w-2/3 animate-pulse rounded bg-slate-100" />

                                        </div>
                                    </div>
                                ))
                            ) : summary.staffMembers.length === 0 ? (
                                <div className="px-6 py-14 text-center">

                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                        <Users className="h-5 w-5" />
                                    </div>

                                    <p className="mt-4 text-sm font-semibold text-slate-800">
                                        No staff available
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Staff assigned to this scope will appear here.
                                    </p>

                                </div>
                            ) : (
                                summary.staffMembers
                                    .slice(0, 6)
                                    .map((member, index) => {

                                        const name =
                                            member.name ||
                                            member.manager ||
                                            member.title ||
                                            "Staff Member";

                                        const initials =
                                            name
                                                .split(" ")
                                                .slice(0, 2)
                                                .map(
                                                    (part) =>
                                                        part[0]
                                                )
                                                .join("")
                                                .toUpperCase();

                                        return (
                                            <div
                                                key={
                                                    member.id ||
                                                    `${name}-${index}`
                                                }
                                                className="flex items-center gap-3 px-6 py-4 transition hover:bg-slate-50/60"
                                            >

                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-bold text-slate-600">
                                                    {initials || "S"}
                                                </div>

                                                <div className="min-w-0 flex-1">

                                                    <p className="truncate text-xs font-semibold text-slate-800">
                                                        {name}
                                                    </p>

                                                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                                        {member.email ||
                                                            "No email on file"}
                                                    </p>

                                                </div>

                                                <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" />

                                            </div>
                                        );
                                    })
                            )}

                        </div>

                    </section>

                </div>

                {/* =================================================
                    BOTTOM ANALYTICS
                ================================================= */}

                <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

                    {/* Feedback */}

                    <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,35,65,0.045)]">

                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <Star className="h-4 w-4" />
                                </div>

                                <div>

                                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-600">
                                        Customer Experience
                                    </p>

                                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                                        Customer Feedback
                                    </h2>

                                </div>

                            </div>

                            <div className="text-right">

                                <p className="text-2xl font-semibold tracking-tight text-slate-900">
                                    {summary.avgRating}
                                </p>

                                <p className="text-[9px] text-slate-400">
                                    Average rating
                                </p>

                            </div>

                        </div>

                        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5">

                            <div className="flex items-start gap-3">

                                <Star className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />

                                <p className="text-xs leading-5 text-slate-500">
                                    Customer ratings and comments will appear here once closed cases have feedback recorded in the system.
                                </p>

                            </div>

                        </div>

                    </section>

                    {/* Priority */}

                    <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,35,65,0.045)]">

                        <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <Layers3 className="h-4 w-4" />
                            </div>

                            <div>

                                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-violet-600">
                                    Workload
                                </p>

                                <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                                    Priority Distribution
                                </h2>

                            </div>

                        </div>

                        <div className="mt-6 space-y-4">

                            {Object.entries(
                                summary.priorityDistribution
                            ).length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 p-5 text-xs text-slate-500">
                                    No priority data available.
                                </div>
                            ) : (
                                Object.entries(
                                    summary.priorityDistribution
                                ).map(([priority, count]) => {

                                    const total =
                                        summary.totalCases || 1;

                                    const percentage =
                                        Math.round(
                                            (count / total) *
                                                100
                                        );

                                    return (
                                        <div key={priority}>

                                            <div className="flex items-center justify-between">

                                                <div className="flex items-center gap-2">

                                                    <span
                                                        className={`h-2 w-2 rounded-full ${getPriorityTone(
                                                            priority
                                                        )}`}
                                                    />

                                                    <span className="text-xs font-semibold text-slate-700">
                                                        {formatPriority(
                                                            priority
                                                        )}
                                                    </span>

                                                </div>

                                                <div className="flex items-center gap-2">

                                                    <span className="text-[10px] font-medium text-slate-400">
                                                        {percentage}%
                                                    </span>

                                                    <span className="text-xs font-semibold text-slate-800">
                                                        {count}
                                                    </span>

                                                </div>

                                            </div>

                                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">

                                                <div
                                                    className={`h-full rounded-full transition-all ${getPriorityTone(
                                                        priority
                                                    )}`}
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    );
                                })
                            )}

                        </div>

                    </section>

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-[0_4px_18px_rgba(15,35,65,0.035)] sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <ShieldCheck className="h-4 w-4" />
                        </div>

                        <div>

                            <p className="text-xs font-semibold text-slate-700">
                                Manager workspace
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                                Analytics and cases are scoped to your assigned {scopeMeta.title.toLowerCase()}.
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/manager/cases")
                        }
                        className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                        View case tracking
                        <ArrowRight className="h-3 w-3" />
                    </button>

                </div>

            </main>
        </div>
    );
}