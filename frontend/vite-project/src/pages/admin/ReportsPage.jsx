import { useEffect, useState } from "react";
import {
    FaFolderOpen,
    FaChartLine,
    FaClock,
    FaCheckCircle,
    FaExclamationTriangle,
    FaArrowUp,
    FaChartPie,
    FaStar,
    FaDatabase,
} from "react-icons/fa";

import { ReportsApi } from "../../api/reportsApi";

import DashboardHeader from "../../components/reports/DashboardHeader";
import ExportButtons from "../../components/reports/ExportButtons";
import StatusPieChart from "../../components/reports/StatusPieChart";
import MonthlyTrendChart from "../../components/reports/MonthlyTrendChart";
import FeedbackSummary from "../../components/reports/FeedbackSummary";
import RecentCasesTable from "../../components/reports/RecentCasesTable";

const STATUS_STYLES = {
    Open: {
        dot: "bg-blue-500",
        chip: "bg-blue-50 text-blue-700 border-blue-100",
        bar: "bg-blue-400",
    },
    "In Progress": {
        dot: "bg-amber-500",
        chip: "bg-amber-50 text-amber-700 border-amber-100",
        bar: "bg-amber-400",
    },
    Pending: {
        dot: "bg-purple-500",
        chip: "bg-purple-50 text-purple-700 border-purple-100",
        bar: "bg-purple-400",
    },
    Escalated: {
        dot: "bg-red-500",
        chip: "bg-red-50 text-red-700 border-red-100",
        bar: "bg-red-400",
    },
    "Awaiting Customer": {
        dot: "bg-indigo-500",
        chip: "bg-indigo-50 text-indigo-700 border-indigo-100",
        bar: "bg-indigo-400",
    },
    Resolved: {
        dot: "bg-emerald-500",
        chip: "bg-emerald-50 text-emerald-700 border-emerald-100",
        bar: "bg-emerald-400",
    },
    Closed: {
        dot: "bg-slate-400",
        chip: "bg-slate-100 text-slate-600 border-slate-200",
        bar: "bg-slate-300",
    },
    Cancelled: {
        dot: "bg-[#c08497]",
        chip: "bg-[#f8eff1] text-[#9a6b75] border-[#f1dde2]",
        bar: "bg-[#d69bb0]",
    },
};

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [metrics, setMetrics] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        closed: 0,
    });

    const [feedback, setFeedback] = useState({
        summary: {
            averageSatisfactionScore: 0,
            feedbackSubmissionRatePercentage: 0,
            casesWithFeedbackReceived: 0,
        },
        reviews: [],
    });

    const [cases, setCases] = useState([]);

    useEffect(() => {
        initialize();

        const handleCasesUpdated = () => {
            initialize();
        };

        window.addEventListener("cases:updated", handleCasesUpdated);

        return () => {
            window.removeEventListener(
                "cases:updated",
                handleCasesUpdated
            );
        };
    }, []);

    async function initialize() {
        try {
            setLoading(true);
            setError("");

            const [
                metricsResponse,
                feedbackResponse,
                casesResponse,
            ] = await Promise.all([
                ReportsApi.getMetrics(),
                ReportsApi.getFeedback(),
                ReportsApi.getCases(),
            ]);

            setMetrics(
                metricsResponse.data.data || {
                    total: 0,
                    open: 0,
                    inProgress: 0,
                    closed: 0,
                }
            );

            setFeedback(
                feedbackResponse.data.data || {
                    summary: {
                        averageSatisfactionScore: 0,
                        feedbackSubmissionRatePercentage: 0,
                        casesWithFeedbackReceived: 0,
                    },
                    reviews: [],
                }
            );

            setCases(casesResponse.data.data || []);
        } catch (error) {
            console.error("Reports loading error:", error);
            setError(
                error?.response?.data?.message ||
                "Unable to load reports. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    /* =========================================================
       STATUS DATA
    ========================================================= */

    const defaultOrder = [
        "Open",
        "In Progress",
        "Pending",
        "Escalated",
        "Awaiting Customer",
        "Resolved",
        "Closed",
        "Cancelled",
    ];

    const statusLabel = (raw) => {
        if (!raw) return "Open";

        const s = String(raw).toUpperCase().trim();

        if (s === "OPEN") return "Open";

        if (
            s === "IN_PROGRESS" ||
            s === "INPROGRESS"
        ) {
            return "In Progress";
        }

        if (
            s === "PENDING" ||
            s === "PENDING_CUSTOMER"
        ) {
            return "Pending";
        }

        if (s === "ESCALATED") {
            return "Escalated";
        }

        if (
            s === "WAITING_CUSTOMER_FEEDBACK" ||
            s === "AWAITING_CUSTOMER" ||
            s === "AWAITING_CUSTOMER_FEEDBACK"
        ) {
            return "Awaiting Customer";
        }

        if (s === "RESOLVED") {
            return "Resolved";
        }

        if (s === "CLOSED") {
            return "Closed";
        }

        if (
            s === "CANCELLED" ||
            s === "CANCELED"
        ) {
            return "Cancelled";
        }

        return (
            raw.charAt(0).toUpperCase() +
            raw.slice(1).toLowerCase()
        );
    };

    const counts = defaultOrder.reduce(
        (acc, name) => {
            acc[name] = 0;
            return acc;
        },
        {}
    );

    cases.forEach((item) => {
        const raw =
            item?.lifecycle?.status ||
            item?.status;

        const label = statusLabel(raw);

        if (counts[label] === undefined) {
            counts[label] = 0;
        }

        counts[label]++;
    });

    const pieData = defaultOrder.map(
        (name) => ({
            name,
            value: counts[name] || 0,
        })
    );

    const statusTotal = cases.length;

    const systemStatus = defaultOrder.map((name) => {
        const count = counts[name] || 0;

        const percentage =
            statusTotal > 0
                ? Math.round((count / statusTotal) * 100)
                : 0;

        return {
            name,
            count,
            percentage,
            ...(STATUS_STYLES[name] || {
                dot: "bg-slate-400",
                chip: "bg-slate-100 text-slate-600 border-slate-200",
                bar: "bg-slate-300",
            }),
        };
    });

    /* =========================================================
       MONTHLY DATA
    ========================================================= */

    const monthly = {};

    cases.forEach((item) => {
        const createdAt =
            item?.lifecycle?.createdAt;

        if (!createdAt) return;

        const date = new Date(createdAt);

        if (Number.isNaN(date.getTime())) {
            return;
        }

        const monthIndex = date.getMonth();

        if (monthly[monthIndex] === undefined) {
            monthly[monthIndex] = 0;
        }

        monthly[monthIndex]++;
    });

    const monthLabels = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    const monthlyData = monthLabels.map(
        (label, index) => ({
            month: label,
            cases: monthly[index] || 0,
        })
    );

    /* =========================================================
       KPI DATA
    ========================================================= */

    const totalCases =
        Number(metrics.total) || cases.length;

    const openCases =
        Number(metrics.open) || 0;

    const inProgressCases =
        Number(metrics.inProgress) || 0;

    const closedCases =
        Number(metrics.closed) || 0;

    const activeCases =
        openCases + inProgressCases;

    const resolutionRate =
        totalCases > 0
            ? Math.round(
                  (closedCases / totalCases) *
                      100
              )
            : 0;

    const kpis = [
        {
            id: "total",
            label: "Total Cases",
            tag: "All Time",
            value: totalCases,
            note: "Overall",
            trend: "Cumulative",
            icon: FaFolderOpen,
            iconClass: "bg-blue-50 text-blue-600",
            accent: "bg-blue-500",
            trendClass: "text-blue-600",
            trendIcon: null,
        },
        {
            id: "active",
            label: "Active Cases",
            tag: "Live",
            value: activeCases,
            note: "Open + In Progress",
            trend: "In Progress",
            icon: FaClock,
            iconClass: "bg-amber-50 text-amber-600",
            accent: "bg-amber-500",
            trendClass: "text-amber-600",
            trendIcon: FaArrowUp,
        },
        {
            id: "closed",
            label: "Closed Cases",
            tag: "Resolved",
            value: closedCases,
            note: "Resolved to date",
            trend: `${resolutionRate}% resolution`,
            icon: FaCheckCircle,
            iconClass: "bg-emerald-50 text-emerald-600",
            accent: "bg-emerald-500",
            trendClass: "text-emerald-600",
            trendIcon: FaArrowUp,
        },
        {
            id: "escalated",
            label: "Escalated Cases",
            tag: "Attention",
            value: counts["Escalated"] || 0,
            note: "Requires attention",
            trend: "Following up",
            icon: FaExclamationTriangle,
            iconClass: "bg-red-50 text-red-600",
            accent: "bg-red-500",
            trendClass: "text-red-600",
            trendIcon: null,
        },
    ];

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="space-y-8 pb-10">
                <DashboardHeader loading={loading} />

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
                        <div className="space-y-2">
                            <div className="h-3.5 w-32 animate-pulse rounded bg-slate-100" />
                            <div className="h-2.5 w-48 animate-pulse rounded bg-slate-50" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="relative animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white p-5"
                        >
                            <div className="flex items-start justify-between">
                                <div className="h-11 w-11 rounded-xl bg-slate-100" />
                                <div className="h-2.5 w-14 rounded bg-slate-100" />
                            </div>
                            <div className="mt-5 h-2.5 w-20 rounded bg-slate-100" />
                            <div className="mt-2 h-7 w-16 rounded bg-slate-100" />
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100" />
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-5">
                    <div className="min-w-0 animate-pulse rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
                        <div className="h-4 w-28 rounded bg-slate-100" />
                        <div className="mt-6 h-[220px] rounded-xl bg-slate-50" />
                    </div>
                    <div className="min-w-0 animate-pulse rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-3">
                        <div className="h-4 w-32 rounded bg-slate-100" />
                        <div className="mt-6 h-[220px] rounded-xl bg-slate-50" />
                    </div>
                </div>

                <div className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white p-6" />

                <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-24 rounded-xl bg-slate-50"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">

            {/* =================================================
                HEADER
            ================================================= */}

            <DashboardHeader onRefresh={initialize} loading={loading} />

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                        <div>
                            <p className="text-sm font-semibold text-red-700">
                                Unable to load reports
                            </p>
                            <p className="mt-1 text-xs text-red-600">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================
                KPI OVERVIEW
            ================================================= */}

            <section>
                <SectionHeading
                    icon={FaChartLine}
                    eyebrow="Performance Overview"
                    title="Support at a glance"
                    description="Key operational metrics across your support desk."
                    right={
                        <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Live data
                        </div>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {kpis.map((kpi) => (
                        <KpiCard key={kpi.id} kpi={kpi} />
                    ))}
                </div>

                {/* =============================================
                    SYSTEM STATUS
                ============================================= */}
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                                <FaDatabase className="text-sm" />
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                    System Status
                                </p>

                                <h3 className="mt-0.5 text-base font-semibold tracking-tight text-slate-900">
                                    Live Case Status Breakdown
                                </h3>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Real-time distribution across every case status.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                                {statusTotal} total
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
                        {systemStatus.map((item) => (
                            <div
                                key={item.name}
                                className="group relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`h-2 w-2 shrink-0 rounded-full ${item.dot}`}
                                    />

                                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">
                                        {item.name}
                                    </span>

                                    <span className="text-sm font-semibold text-slate-900">
                                        {item.count}
                                    </span>
                                </div>

                                <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-200/70">
                                    <div
                                        className={`h-full rounded-full ${item.bar}`}
                                        style={{
                                            width: `${item.percentage}%`,
                                        }}
                                    />
                                </div>

                                <p className="mt-2 text-right text-[10px] font-semibold text-slate-400">
                                    {item.percentage}% of cases
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =================================================
                EXPORT TOOLBAR
            ================================================= */}

            <ExportButtons />

            {/* =================================================
                ANALYTICS
            ================================================= */}

            <section>
                <SectionHeading
                    icon={FaChartPie}
                    eyebrow="Case Analytics"
                    title="Distribution & trends"
                    description="Understand case status distribution and monthly activity."
                    right={
                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm">
                            <FaDatabase className="text-slate-400" />
                            {cases.length} cases analyzed
                        </div>
                    }
                />

                <div className="grid gap-6 xl:grid-cols-5">
                    <div className="min-w-0 xl:col-span-2">
                        <StatusPieChart
                            data={pieData}
                        />
                    </div>

                    <div className="min-w-0 xl:col-span-3">
                        <MonthlyTrendChart
                            data={monthlyData}
                        />
                    </div>
                </div>
            </section>

            {/* =================================================
                CUSTOMER SATISFACTION
            ================================================= */}

            <section>
                <SectionHeading
                    icon={FaStar}
                    eyebrow="Customer Experience"
                    title="Customer Satisfaction"
                    description="Feedback and satisfaction indicators from resolved cases."
                />

                <FeedbackSummary
                    summary={feedback.summary}
                />
            </section>

            {/* =================================================
                RECENT CASES
            ================================================= */}

            <section>
                <SectionHeading
                    icon={FaFolderOpen}
                    eyebrow="Support Activity"
                    title="Recent Cases"
                    description="Latest customer support requests across the portal."
                    right={
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                            {cases.length}{" "}
                            {cases.length === 1
                                ? "Case"
                                : "Cases"}
                        </span>
                    }
                />

                <RecentCasesTable
                    cases={cases}
                />
            </section>

        </div>
    );
}

/* =========================================================
   SECTION HEADING
   ========================================================= */

function SectionHeading({
    icon: Icon,
    eyebrow,
    title,
    description,
    right,
}) {
    return (
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                    <Icon className="h-[18px] w-[18px]" />
                </div>

                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {eyebrow}
                    </p>

                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-1 text-sm text-slate-500">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {right}
        </div>
    );
}

/* =========================================================
   KPI CARD
   ========================================================= */

function KpiCard({ kpi }) {
    const Icon = kpi.icon;
    const TrendIcon = kpi.trendIcon;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.iconClass}`}
                >
                    <Icon className="text-lg" />
                </div>

                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {kpi.tag}
                </span>
            </div>

            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {kpi.label}
            </p>

            <div className="mt-1 flex items-end gap-2">
                <h3 className="text-3xl font-semibold tracking-tight text-slate-900">
                    {kpi.value}
                </h3>

                {TrendIcon && (
                    <TrendIcon
                        className={`mb-1.5 h-3 w-3 ${kpi.trendClass}`}
                    />
                )}
            </div>

            <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                    {kpi.note}
                </p>

                <span
                    className={`text-[10px] font-semibold ${kpi.trendClass}`}
                >
                    {kpi.trend}
                </span>
            </div>

            <div
                className={`absolute bottom-0 left-0 right-0 h-1 ${kpi.accent}`}
            />
        </div>
    );
}