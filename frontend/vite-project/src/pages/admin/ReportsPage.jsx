import { useEffect, useState } from "react";
import {
    FaFolderOpen,
    FaChartLine,
    FaClock,
    FaCheckCircle,
    FaExclamationTriangle,
    FaArrowUp,
    FaChartPie,
} from "react-icons/fa";

import { ReportsApi } from "../../api/reportsApi";

import DashboardHeader from "../../components/reports/DashboardHeader";
import ExportButtons from "../../components/reports/ExportButtons";
import StatusPieChart from "../../components/reports/StatusPieChart";
import MonthlyTrendChart from "../../components/reports/MonthlyTrendChart";
import FeedbackSummary from "../../components/reports/FeedbackSummary";
import RecentCasesTable from "../../components/reports/RecentCasesTable";
import LoadingReports from "../../components/reports/LoadingReports";

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);

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
            console.log("Reports loading error:", error);
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

        const month = date.toLocaleString(
            "default",
            {
                month: "short",
            }
        );

        if (!monthly[month]) {
            monthly[month] = 0;
        }

        monthly[month]++;
    });

    const monthlyData = Object.keys(monthly).map(
        (month) => ({
            month,
            cases: monthly[month],
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

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return <LoadingReports />;
    }

    return (
        <div className="space-y-8 pb-10">

            {/* =================================================
                HEADER
            ================================================= */}

            <DashboardHeader />

            {/* =================================================
                EXPORT TOOLBAR
            ================================================= */}

            <section
                className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                "
            >
                <div
                    className="
                        flex
                        flex-col
                        gap-4
                        px-6
                        py-5
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                    "
                >
                    <div>
                        <div className="flex items-center gap-2">
                            <div
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-slate-100
                                    text-slate-700
                                "
                            >
                                <FaChartLine />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    Analytics Overview
                                </p>

                                <p className="text-xs text-slate-500">
                                    Monitor support performance and export reports.
                                </p>
                            </div>
                        </div>
                    </div>

                    <ExportButtons />
                </div>
            </section>

            {/* =================================================
                KPI OVERVIEW
            ================================================= */}

            <section>
                <div className="mb-4 flex items-end justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Performance Overview
                        </p>

                        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                            Support at a glance
                        </h2>
                    </div>

                    <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Live data
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {/* Total */}
                    <div
                        className="
                            group
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            p-5
                            shadow-sm
                            transition
                            duration-200
                            hover:-translate-y-0.5
                            hover:shadow-md
                        "
                    >
                        <div className="flex items-start justify-between">
                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-blue-50
                                    text-blue-600
                                "
                            >
                                <FaFolderOpen />
                            </div>

                            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-300">
                                Cases
                            </span>
                        </div>

                        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Total Cases
                        </p>

                        <div className="mt-1 flex items-end gap-2">
                            <h3 className="text-3xl font-semibold tracking-tight text-slate-900">
                                {totalCases}
                            </h3>

                            <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                <FaArrowUp className="text-[9px]" />
                                Overall
                            </span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
                    </div>

                    {/* Active */}
                    <div
                        className="
                            group
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            p-5
                            shadow-sm
                            transition
                            duration-200
                            hover:-translate-y-0.5
                            hover:shadow-md
                        "
                    >
                        <div className="flex items-start justify-between">
                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-amber-50
                                    text-amber-600
                                "
                            >
                                <FaClock />
                            </div>

                            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-300">
                                Active
                            </span>
                        </div>

                        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Active Cases
                        </p>

                        <div className="mt-1 flex items-end gap-2">
                            <h3 className="text-3xl font-semibold tracking-tight text-slate-900">
                                {activeCases}
                            </h3>

                            <span className="mb-1 text-xs text-slate-400">
                                Open + In Progress
                            </span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
                    </div>

                    {/* Closed */}
                    <div
                        className="
                            group
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            p-5
                            shadow-sm
                            transition
                            duration-200
                            hover:-translate-y-0.5
                            hover:shadow-md
                        "
                    >
                        <div className="flex items-start justify-between">
                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-emerald-50
                                    text-emerald-600
                                "
                            >
                                <FaCheckCircle />
                            </div>

                            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-300">
                                Resolved
                            </span>
                        </div>

                        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Closed Cases
                        </p>

                        <div className="mt-1 flex items-end gap-2">
                            <h3 className="text-3xl font-semibold tracking-tight text-slate-900">
                                {closedCases}
                            </h3>

                            <span className="mb-1 text-xs font-semibold text-emerald-600">
                                {resolutionRate}% resolution
                            </span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
                    </div>

                    {/* Escalated */}
                    <div
                        className="
                            group
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            p-5
                            shadow-sm
                            transition
                            duration-200
                            hover:-translate-y-0.5
                            hover:shadow-md
                        "
                    >
                        <div className="flex items-start justify-between">
                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-red-50
                                    text-red-600
                                "
                            >
                                <FaExclamationTriangle />
                            </div>

                            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-300">
                                Attention
                            </span>
                        </div>

                        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Escalated Cases
                        </p>

                        <div className="mt-1 flex items-end gap-2">
                            <h3 className="text-3xl font-semibold tracking-tight text-slate-900">
                                {counts["Escalated"] || 0}
                            </h3>

                            <span className="mb-1 text-xs text-slate-400">
                                Requires attention
                            </span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500" />
                    </div>
                </div>
            </section>

            {/* =================================================
                ANALYTICS
            ================================================= */}

            <section>
                <div className="mb-4 flex items-center gap-3">
                    <div
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            bg-slate-100
                            text-slate-700
                        "
                    >
                        <FaChartPie />
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                            Case Analytics
                        </h2>

                        <p className="text-sm text-slate-500">
                            Understand case distribution and activity trends.
                        </p>
                    </div>
                </div>

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
                <div className="mb-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Customer Experience
                    </p>

                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                        Customer Satisfaction
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Feedback and satisfaction indicators from resolved cases.
                    </p>
                </div>

                <FeedbackSummary
                    summary={feedback.summary}
                />
            </section>

            {/* =================================================
                RECENT CASES
            ================================================= */}

            <section>
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Support Activity
                        </p>

                        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                            Recent Cases
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Latest customer support requests across the portal.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        {cases.length} cases loaded
                    </div>
                </div>

                <RecentCasesTable
                    cases={cases}
                />
            </section>

        </div>
    );
}