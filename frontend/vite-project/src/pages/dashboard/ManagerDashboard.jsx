import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    ArrowRight,
    ArrowUpRight,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    ClipboardList,
    Clock3,
    Loader2,
    ShieldCheck,
    Star,
    Users,
    AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { managerApi } from "../../api/managerApi";

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

const statusConfig = {
    OPEN: {
        label: "Open",
        icon: Clock3,
        className: "bg-[#edf4fd] text-[#527eb9]",
        dot: "bg-[#527eb9]",
    },
    IN_PROGRESS: {
        label: "In Progress",
        icon: Activity,
        className: "bg-[#fff7e8] text-[#c58a27]",
        dot: "bg-[#c58a27]",
    },
    ASSIGNED: {
        label: "Assigned",
        icon: BriefcaseBusiness,
        className: "bg-[#edf4fd] text-[#527eb9]",
        dot: "bg-[#527eb9]",
    },
    CLOSED: {
        label: "Closed",
        icon: CheckCircle2,
        className: "bg-[#edf8f4] text-[#37876c]",
        dot: "bg-[#37876c]",
    },
    RESOLVED: {
        label: "Resolved",
        icon: CheckCircle2,
        className: "bg-[#edf8f4] text-[#37876c]",
        dot: "bg-[#37876c]",
    },
};

const priorityConfig = {
    LOW: {
        label: "Low",
        className: "bg-slate-100 text-slate-500",
        width: "25%",
    },
    MEDIUM: {
        label: "Medium",
        className: "bg-[#edf4fd] text-[#527eb9]",
        width: "50%",
    },
    HIGH: {
        label: "High",
        className: "bg-[#fff3e8] text-[#c57632]",
        width: "75%",
    },
    CRITICAL: {
        label: "Critical",
        className: "bg-[#fdf0f0] text-[#c65b5b]",
        width: "100%",
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
    return value
        ? value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
        : "Unknown";
}

function formatPriority(value) {
    return value
        ? value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
        : "Unknown";
}

export default function ManagerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [snapshot, setSnapshot] = useState(null);

    const managerType = user?.managerType || "SECTION";
    const scopeMeta = scopeConfig[managerType] || scopeConfig.SECTION;
    const scopeId = user?.[scopeMeta.idKey];

    useEffect(() => {
        if (!scopeId) {
            setLoading(false);
            setError("Manager scope is missing from your session.");
            return;
        }

        let cancelled = false;

        async function loadDashboard() {
            try {
                setLoading(true);
                setError("");

                const response = await managerApi.getScopeOverview();

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

        const refreshTimer = window.setInterval(() => {
            loadDashboard();
        }, 10000);

        const handleFocus = () => loadDashboard();
        const handleCasesUpdated = () => loadDashboard();

        window.addEventListener("focus", handleFocus);
        window.addEventListener("cases:updated", handleCasesUpdated);

        return () => {
            cancelled = true;

            window.clearInterval(refreshTimer);

            window.removeEventListener("focus", handleFocus);
            window.removeEventListener(
                "cases:updated",
                handleCasesUpdated
            );
        };
    }, [scopeId, scopeMeta.resource]);

    const summary = useMemo(() => {
        const metrics = snapshot?.caseMetrics || {};
        const hierarchy = snapshot?.hierarchyMetrics || {};
        const cases = metrics.cases || [];
        const countByStatus = metrics.casesByStatus || {};

        const openCases = countByStatus.OPEN || 0;

        const inProgressCases =
            (countByStatus.IN_PROGRESS || 0) +
            (countByStatus.ASSIGNED || 0);

        const closedCases =
            (countByStatus.CLOSED || 0) +
            (countByStatus.RESOLVED || 0);

        return {
            totalCases:
                metrics.totalAssignedCases ||
                cases.length ||
                0,

            openCases,

            inProgressCases,

            closedCases,

            avgRating: "—",

            totalStaff:
                hierarchy.totalSectionStaffCount ||
                hierarchy.totalDivisionStaffCount ||
                hierarchy.totalDepartmentStaffCount ||
                0,

            scopeName:
                snapshot?.[scopeMeta.resource]?.name ||
                "My Unit",

            scopeLabel: formatScopeLabel(scopeMeta.title),

            recentCases: cases.slice(0, 5),

            staffMembers:
                hierarchy.staffMembers ||
                hierarchy.sections ||
                [],

            priorityDistribution: cases.reduce((acc, item) => {
                acc[item.priority] =
                    (acc[item.priority] || 0) + 1;

                return acc;
            }, {}),
        };
    }, [snapshot, scopeMeta.resource]);

    const resolutionRate = useMemo(() => {
        if (!summary.totalCases) return 0;

        return Math.round(
            (summary.closedCases / summary.totalCases) * 100
        );
    }, [summary.totalCases, summary.closedCases]);

    const firstName =
        user?.firstName ||
        user?.name?.split(" ")?.[0] ||
        "Manager";

    const primaryStats = [
        {
            label: "Total Cases",
            value: summary.totalCases,
            description: "Cases in your scope",
            icon: ClipboardList,
            tone: "blue",
        },
        {
            label: "Open Cases",
            value: summary.openCases,
            description: "Awaiting action",
            icon: Clock3,
            tone: "amber",
        },
        {
            label: "In Progress",
            value: summary.inProgressCases,
            description: "Currently being handled",
            icon: Activity,
            tone: "blue",
        },
        {
            label: "Resolved",
            value: summary.closedCases,
            description: "Completed cases",
            icon: CheckCircle2,
            tone: "green",
        },
    ];

    return (
        <div className="min-h-full space-y-7">

            {/* =====================================================
                HERO
            ===================================================== */}
            <section className="relative overflow-hidden rounded-[24px] border border-[#dce4ee] bg-[#0b1b33] text-white shadow-[0_18px_50px_rgba(11,27,51,0.12)]">

                <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-[#416da8]/20 blur-[90px]" />

                <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[360px] w-[360px] rounded-full bg-[#668ec4]/10 blur-[100px]" />

                <div
                    className="
                        pointer-events-none absolute inset-0 opacity-[0.045]
                        [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
                        [background-size:36px_36px]
                    "
                />

                <div className="relative z-10 px-6 py-7 sm:px-8 sm:py-9">

                    <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">

                        <div className="max-w-2xl">

                            <div className="mb-4 flex items-center gap-2">

                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />

                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                    Manager Workspace
                                </span>

                            </div>

                            <h1 className="font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                                Good morning,{" "}
                                <span className="text-[#91b3df]">
                                    {firstName}
                                </span>
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                                Monitor the performance of your{" "}
                                {summary.scopeLabel.toLowerCase()},
                                coordinate your team, and keep support
                                cases moving toward resolution.
                            </p>

                        </div>

                        <div className="flex flex-wrap items-center gap-3">

                            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur-md">

                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">
                                    Current scope
                                </p>

                                <p className="mt-1 text-sm font-semibold text-white/85">
                                    {summary.scopeName}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/manager/cases")
                                }
                                className="
                                    group flex items-center gap-2
                                    rounded-xl
                                    bg-white
                                    px-4 py-3
                                    text-[11px]
                                    font-bold
                                    text-[#0b1b33]
                                    shadow-[0_10px_25px_rgba(0,0,0,0.12)]
                                    transition-all duration-200
                                    hover:-translate-y-0.5
                                    hover:bg-[#f5f8fc]
                                "
                            >
                                Case Tracking

                                <ArrowRight
                                    size={13}
                                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                                />
                            </button>

                        </div>

                    </div>
                </div>
            </section>

            {/* =====================================================
                ERROR
            ===================================================== */}
            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">

                    <AlertTriangle
                        size={17}
                        className="mt-0.5 shrink-0"
                    />

                    <div>
                        <p className="font-semibold">
                            Dashboard data unavailable
                        </p>

                        <p className="mt-1 text-xs text-red-600/80">
                            {error}
                        </p>
                    </div>

                </div>
            )}

            {/* =====================================================
                KPI SECTION
            ===================================================== */}
            <section>

                <div className="mb-4 flex items-end justify-between">

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#567fbd]">
                            Overview
                        </p>

                        <h2 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[#101a28]">
                            Scope performance
                        </h2>
                    </div>

                    <div className="hidden items-center gap-1.5 text-[10px] text-slate-400 sm:flex">
                        <ShieldCheck size={12} className="text-[#567fbd]" />
                        Live data
                    </div>

                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {primaryStats.map((stat) => {
                        const Icon = stat.icon;

                        const tone =
                            stat.tone === "green"
                                ? {
                                      icon: "bg-[#edf8f4] text-[#37876c]",
                                      accent: "bg-[#37876c]",
                                  }
                                : stat.tone === "amber"
                                ? {
                                      icon: "bg-[#fff7e8] text-[#c58a27]",
                                      accent: "bg-[#c58a27]",
                                  }
                                : {
                                      icon: "bg-[#edf4fd] text-[#527eb9]",
                                      accent: "bg-[#527eb9]",
                                  };

                        return (
                            <div
                                key={stat.label}
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
                                        ${tone.accent}
                                        transition-all duration-300
                                        group-hover:w-full
                                    `}
                                />

                                <div className="flex items-start justify-between">

                                    <div
                                        className={`
                                            flex h-10 w-10
                                            items-center justify-center
                                            rounded-xl
                                            ${tone.icon}
                                        `}
                                    >
                                        <Icon size={17} />
                                    </div>

                                    <ArrowUpRight
                                        size={14}
                                        className="text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-500"
                                    />

                                </div>

                                <div className="mt-6">

                                    <p className="text-[10px] font-medium text-slate-400">
                                        {stat.label}
                                    </p>

                                    <div className="mt-1.5 flex min-h-[38px] items-center">

                                        {loading ? (
                                            <Loader2
                                                size={22}
                                                className="animate-spin text-[#567fbd]"
                                            />
                                        ) : (
                                            <span className="font-display text-[30px] font-bold tracking-[-0.04em] text-[#101a28]">
                                                {typeof stat.value ===
                                                "number"
                                                    ? stat.value.toLocaleString()
                                                    : stat.value}
                                            </span>
                                        )}

                                    </div>

                                    <p className="mt-2 text-[10px] text-slate-400">
                                        {stat.description}
                                    </p>

                                </div>
                            </div>
                        );
                    })}

                </div>
            </section>

            {/* =====================================================
                PERFORMANCE + TEAM
            ===================================================== */}
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">

                {/* PERFORMANCE */}
                <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                        <div className="flex items-start justify-between gap-4">

                            <div>
                                <div className="flex items-center gap-2">

                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4fd] text-[#527eb9]">
                                        <Activity size={14} />
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                            Operations
                                        </p>

                                        <h2 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
                                            Case workload
                                        </h2>
                                    </div>

                                </div>

                                <p className="mt-3 text-[11px] text-slate-400">
                                    Distribution of cases currently within
                                    your management scope.
                                </p>
                            </div>

                            <div className="hidden text-right sm:block">

                                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                    Resolution
                                </p>

                                <p className="mt-1 font-display text-2xl font-bold tracking-[-0.04em] text-[#37876c]">
                                    {resolutionRate}%
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="p-5 sm:p-6">

                        <div className="space-y-5">

                            {[
                                {
                                    label: "Open",
                                    value: summary.openCases,
                                    color: "bg-[#527eb9]",
                                    icon: Clock3,
                                },
                                {
                                    label: "In Progress",
                                    value: summary.inProgressCases,
                                    color: "bg-[#c58a27]",
                                    icon: Activity,
                                },
                                {
                                    label: "Resolved",
                                    value: summary.closedCases,
                                    color: "bg-[#37876c]",
                                    icon: CheckCircle2,
                                },
                            ].map((item) => {

                                const percentage =
                                    summary.totalCases > 0
                                        ? Math.max(
                                              4,
                                              Math.round(
                                                  (item.value /
                                                      summary.totalCases) *
                                                      100
                                              )
                                          )
                                        : 0;

                                const Icon = item.icon;

                                return (
                                    <div key={item.label}>

                                        <div className="mb-2 flex items-center justify-between">

                                            <div className="flex items-center gap-2">

                                                <span
                                                    className={`flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-500`}
                                                >
                                                    <Icon size={12} />
                                                </span>

                                                <span className="text-[11px] font-semibold text-slate-600">
                                                    {item.label}
                                                </span>

                                            </div>

                                            <span className="font-display text-sm font-bold text-[#101a28]">
                                                {item.value}
                                            </span>

                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                            <div
                                                className={`h-full rounded-full ${item.color} transition-all duration-700`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />

                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                        <div className="mt-7 grid grid-cols-2 gap-3">

                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">

                                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                    Team size
                                </p>

                                <div className="mt-2 flex items-center gap-2">

                                    <Users
                                        size={15}
                                        className="text-[#527eb9]"
                                    />

                                    <span className="font-display text-xl font-bold tracking-[-0.03em] text-[#101a28]">
                                        {summary.totalStaff}
                                    </span>

                                </div>

                            </div>

                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">

                                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                    Customer rating
                                </p>

                                <div className="mt-2 flex items-center gap-2">

                                    <Star
                                        size={15}
                                        className="text-[#c58a27]"
                                    />

                                    <span className="font-display text-xl font-bold tracking-[-0.03em] text-[#101a28]">
                                        {summary.avgRating}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>
                </section>

                {/* PRIORITY */}
                <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

                    <div className="border-b border-slate-100 px-5 py-5">

                        <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff7e8] text-[#c58a27]">
                                <AlertTriangle size={14} />
                            </div>

                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                    Attention
                                </p>

                                <h2 className="mt-0.5 text-base font-bold text-[#101a28]">
                                    Case priority
                                </h2>
                            </div>

                        </div>

                    </div>

                    <div className="p-5">

                        {Object.entries(
                            summary.priorityDistribution
                        ).length === 0 ? (

                            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">

                                <ClipboardList
                                    size={20}
                                    className="mx-auto text-slate-300"
                                />

                                <p className="mt-3 text-[11px] text-slate-400">
                                    No priority data available.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-5">

                                {Object.entries(
                                    summary.priorityDistribution
                                ).map(([priority, count]) => {

                                    const config =
                                        priorityConfig[
                                            priority
                                        ] || {
                                            label:
                                                formatPriority(
                                                    priority
                                                ),
                                            className:
                                                "bg-slate-100 text-slate-500",
                                            width: "50%",
                                        };

                                    const percentage =
                                        summary.totalCases > 0
                                            ? Math.max(
                                                  4,
                                                  Math.round(
                                                      (count /
                                                          summary.totalCases) *
                                                          100
                                                  )
                                              )
                                            : 0;

                                    return (
                                        <div key={priority}>

                                            <div className="mb-2 flex items-center justify-between">

                                                <span className="text-[11px] font-semibold text-slate-600">
                                                    {config.label}
                                                </span>

                                                <span className="font-display text-sm font-bold text-[#101a28]">
                                                    {count}
                                                </span>

                                            </div>

                                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

                                                <div
                                                    className={`
                                                        h-full rounded-full
                                                        ${
                                                            priority ===
                                                            "CRITICAL"
                                                                ? "bg-[#c65b5b]"
                                                                : priority ===
                                                                  "HIGH"
                                                                ? "bg-[#c57632]"
                                                                : priority ===
                                                                  "MEDIUM"
                                                                ? "bg-[#527eb9]"
                                                                : "bg-slate-400"
                                                        }
                                                    `}
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    );
                                })}

                            </div>
                        )}

                    </div>
                </section>
            </div>

            {/* =====================================================
                RECENT CASES + STAFF
            ===================================================== */}
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">

                {/* RECENT CASES */}
                <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">

                        <div>

                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                Activity
                            </p>

                            <h2 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
                                Recent assigned cases
                            </h2>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/manager/cases")
                            }
                            className="
                                group flex items-center gap-1.5
                                text-[10px] font-bold
                                text-[#527eb9]
                                transition-colors
                                hover:text-[#1a345b]
                            "
                        >
                            View all

                            <ArrowRight
                                size={12}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </button>

                    </div>

                    <div className="divide-y divide-slate-100">

                        {summary.recentCases.length === 0 ? (

                            <div className="px-5 py-12 text-center sm:px-6">

                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-300">
                                    <ClipboardList size={18} />
                                </div>

                                <p className="mt-3 text-[11px] font-medium text-slate-500">
                                    No assigned cases
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">
                                    Cases assigned to your unit will
                                    appear here.
                                </p>

                            </div>

                        ) : (

                            summary.recentCases.map((item) => {

                                const config =
                                    statusConfig[item.status] ||
                                    statusConfig.OPEN;

                                const StatusIcon =
                                    config.icon;

                                return (
                                    <div
                                        key={
                                            item.id ||
                                            item.caseNumber
                                        }
                                        className="
                                            group
                                            flex flex-col gap-4
                                            px-5 py-4
                                            transition-colors
                                            hover:bg-slate-50/70
                                            sm:px-6
                                            md:flex-row
                                            md:items-center
                                            md:justify-between
                                        "
                                    >

                                        <div className="flex min-w-0 items-center gap-3">

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-[#edf4fd] group-hover:text-[#527eb9]">
                                                <ClipboardList size={14} />
                                            </div>

                                            <div className="min-w-0">

                                                <p className="truncate text-[11px] font-bold text-[#101a28]">
                                                    {item.caseNumber ||
                                                        item.id}
                                                </p>

                                                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                                    {item.subject ||
                                                        "No subject"}
                                                </p>

                                            </div>

                                        </div>

                                        <div className="flex items-center gap-2 pl-12 md:pl-0">

                                            <span
                                                className={`
                                                    inline-flex
                                                    items-center gap-1.5
                                                    rounded-full
                                                    px-2.5 py-1
                                                    text-[9px]
                                                    font-bold
                                                    ${config.className}
                                                `}
                                            >
                                                <StatusIcon size={10} />
                                                {config.label}
                                            </span>

                                            <span
                                                className={`
                                                    rounded-full
                                                    px-2.5 py-1
                                                    text-[9px]
                                                    font-bold
                                                    ${
                                                        priorityConfig[
                                                            item.priority
                                                        ]?.className ||
                                                        "bg-slate-100 text-slate-500"
                                                    }
                                                `}
                                            >
                                                {formatPriority(
                                                    item.priority
                                                )}
                                            </span>

                                        </div>

                                    </div>
                                );
                            })
                        )}

                    </div>
                </section>

                {/* STAFF */}
                <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

                    <div className="border-b border-slate-100 px-5 py-5">

                        <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4fd] text-[#527eb9]">
                                <Users size={14} />
                            </div>

                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                    Team
                                </p>

                                <h2 className="mt-0.5 text-base font-bold text-[#101a28]">
                                    Staff in my unit
                                </h2>
                            </div>

                        </div>

                    </div>

                    <div className="divide-y divide-slate-100">

                        {summary.staffMembers.length === 0 ? (

                            <div className="px-5 py-10 text-center">

                                <Users
                                    size={20}
                                    className="mx-auto text-slate-300"
                                />

                                <p className="mt-3 text-[11px] text-slate-400">
                                    No staff members available.
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
                                            className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/70"
                                        >

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf4fd] text-[10px] font-bold text-[#527eb9]">
                                                {initials}
                                            </div>

                                            <div className="min-w-0">

                                                <p className="truncate text-[11px] font-semibold text-[#101a28]">
                                                    {name}
                                                </p>

                                                <p className="mt-0.5 truncate text-[9px] text-slate-400">
                                                    {member.email ||
                                                        "No email on file"}
                                                </p>

                                            </div>

                                            <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />

                                        </div>
                                    );
                                })
                        )}

                    </div>

                    {summary.staffMembers.length > 6 && (
                        <div className="border-t border-slate-100 px-5 py-3">

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/manager/staff")
                                }
                                className="flex w-full items-center justify-center gap-1.5 text-[10px] font-bold text-[#527eb9] hover:text-[#1a345b]"
                            >
                                View all staff
                                <ArrowRight size={11} />
                            </button>

                        </div>
                    )}

                </section>
            </div>

            {/* =====================================================
                CUSTOMER FEEDBACK
            ===================================================== */}
            <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff7e8] text-[#c58a27]">
                            <Star size={15} />
                        </div>

                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                Customer experience
                            </p>

                            <h2 className="mt-0.5 text-base font-bold text-[#101a28]">
                                Recent customer feedback
                            </h2>
                        </div>

                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">

                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />

                        <span className="text-[9px] font-semibold text-slate-400">
                            Awaiting feedback data
                        </span>

                    </div>

                </div>

                <div className="border-t border-slate-100 px-5 py-5 sm:px-6">

                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-6 text-center">

                        <Star
                            size={19}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-[11px] font-semibold text-slate-500">
                            Customer feedback will appear here
                        </p>

                        <p className="mx-auto mt-1 max-w-md text-[10px] leading-5 text-slate-400">
                            Feedback will become available once closed
                            cases receive customer ratings and comments
                            through the platform.
                        </p>

                    </div>

                </div>
            </section>

            {/* =====================================================
                FOOTER
            ===================================================== */}
            <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-2">
                    <ShieldCheck
                        size={12}
                        className="text-[#567fbd]"
                    />
                    MOTI Partner Support Platform
                </div>

                <div className="flex items-center gap-2">
                    <span>
                        {summary.scopeLabel} management workspace
                    </span>

                    <ArrowUpRight size={11} />
                </div>

            </div>
        </div>
    );
}