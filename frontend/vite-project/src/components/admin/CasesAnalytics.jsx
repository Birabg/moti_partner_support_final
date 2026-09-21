import { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
} from "recharts";

import {
    Activity,
    CheckCircle2,
    Clock3,
    AlertTriangle,
    CircleDot,
    RefreshCw,
    XCircle,
} from "lucide-react";

import { AnalyticsApi } from "../../api/analyticsApi";

const STATUS_ORDER = [
    {
        key: "OPEN",
        label: "Open",
        color: "#527eb9",
        soft: "bg-[#edf4fd]",
        text: "text-[#527eb9]",
        icon: CircleDot,
    },
    {
        key: "IN_PROGRESS",
        label: "In Progress",
        color: "#3b8d73",
        soft: "bg-[#edf7f3]",
        text: "text-[#3b8d73]",
        icon: Activity,
    },
    {
        key: "PENDING",
        label: "Pending",
        color: "#c58a27",
        soft: "bg-[#fff7e8]",
        text: "text-[#c58a27]",
        icon: Clock3,
    },
    {
        key: "ESCALATED",
        label: "Escalated",
        color: "#c65b5b",
        soft: "bg-[#fdf0f0]",
        text: "text-[#c65b5b]",
        icon: AlertTriangle,
    },
    {
        key: "RESOLVED",
        label: "Resolved",
        color: "#3d9b7a",
        soft: "bg-[#edf8f4]",
        text: "text-[#3d9b7a]",
        icon: CheckCircle2,
    },
    {
        key: "CUSTOMER_CONFIRMATION",
        label: "Awaiting Customer",
        color: "#b87842",
        soft: "bg-[#fbf2eb]",
        text: "text-[#b87842]",
        icon: Clock3,
    },
    {
        key: "CLOSED",
        label: "Closed",
        color: "#718096",
        soft: "bg-slate-100",
        text: "text-slate-500",
        icon: CheckCircle2,
    },
    {
        key: "CANCELLED",
        label: "Cancelled",
        color: "#1b1818",
        soft: "bg-[#f8eff1]",
        text: "text-[#9a6b75]",
        icon: XCircle,
    },
];

function getValue(payload, statusKey) {
    const aliases = {
        OPEN: ["open", "OPEN"],

        IN_PROGRESS: [
            "inProgress",
            "IN_PROGRESS",
        ],

        PENDING: [
            "pending",
            "PENDING",
        ],

        ESCALATED: [
            "escalated",
            "ESCALATED",
        ],

        RESOLVED: [
            "resolved",
            "RESOLVED",
        ],

        CUSTOMER_CONFIRMATION: [
            "customerConfirmation",
            "CUSTOMER_CONFIRMATION",
        ],

        CLOSED: [
            "closed",
            "CLOSED",
        ],

        CANCELLED: [
            "cancelled",
            "CANCELLED",
            "canceled",
            "CANCELED",
        ],
    };

    const keys = aliases[statusKey] || [];

    for (const key of keys) {
        if (
            payload?.[key] !== undefined &&
            payload?.[key] !== null
        ) {
            return Number(payload[key]) || 0;
        }
    }

    return 0;
}

function EmptyState() {
    return (
        <div className="flex h-[310px] items-center justify-center">
            <div className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <Activity size={18} />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                    No case data available
                </p>

                <p className="mt-1 text-xs text-slate-400">
                    Case activity will appear here once data is available.
                </p>
            </div>
        </div>
    );
}

export default function CasesAnalytics() {
    const [metrics, setMetrics] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    async function loadMetrics(showRefresh = false) {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response =
                await AnalyticsApi.getCaseSummary();

            const payload =
                response?.data?.data || {};

            setMetrics(payload);
        } catch (caughtError) {
            console.error(
                "Director case analytics error:",
                caughtError
            );

            setError(
                caughtError?.response?.data?.message ||
                    "Unable to load case analytics."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadMetrics();

        const handleCaseUpdated = () => {
            loadMetrics(true);
        };

        window.addEventListener(
            "cases:updated",
            handleCaseUpdated
        );

        return () => {
            window.removeEventListener(
                "cases:updated",
                handleCaseUpdated
            );
        };
    }, []);

    const data = useMemo(() => {
        return STATUS_ORDER.map((status) => ({
            status: status.label,
            key: status.key,
            count: getValue(
                metrics,
                status.key
            ),
            color: status.color,
        }));
    }, [metrics]);

    const activeCases = useMemo(() => {
        return data
            .filter((item) =>
                [
                    "OPEN",
                    "IN_PROGRESS",
                    "PENDING",
                    "ESCALATED",
                    "CUSTOMER_CONFIRMATION",
                ].includes(item.key)
            )
            .reduce(
                (sum, item) =>
                    sum + item.count,
                0
            );
    }, [data]);

    const resolvedCases = useMemo(() => {
        return data
            .filter((item) =>
                [
                    "RESOLVED",
                    "CLOSED",
                ].includes(item.key)
            )
            .reduce(
                (sum, item) =>
                    sum + item.count,
                0
            );
    }, [data]);

    const escalatedCases = useMemo(() => {
        return getValue(
            metrics,
            "ESCALATED"
        );
    }, [metrics]);

    const cancelledCases = useMemo(() => {
        return getValue(
            metrics,
            "CANCELLED"
        );
    }, [metrics]);

    return (
        <div className="space-y-6">

            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle
                            size={17}
                            className="mt-0.5 shrink-0 text-red-500"
                        />

                        <div>
                            <p className="text-sm font-semibold text-red-700">
                                Unable to load analytics
                            </p>

                            <p className="mt-1 text-xs text-red-600">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
                ANALYTICS CARD
            ===================================================== */}

            <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        {/* LEFT */}

                        <div>
                            <div className="flex items-center gap-2">

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4fd] text-[#527eb9]">
                                    <Activity size={15} />
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                        Operational overview
                                    </p>

                                    <h2 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
                                        Case workload
                                    </h2>
                                </div>

                            </div>

                            <p className="mt-3 max-w-xl text-[11px] leading-5 text-slate-400">
                                Global distribution of customer support
                                cases across the current case lifecycle.
                            </p>
                        </div>

                        {/* REFRESH */}

                        <button
                            type="button"
                            onClick={() =>
                                loadMetrics(true)
                            }
                            disabled={
                                loading ||
                                refreshing
                            }
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                self-end
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                text-slate-500
                                transition
                                hover:border-[#d9e5f4]
                                hover:bg-[#f5f8fc]
                                hover:text-[#527eb9]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                                sm:self-auto
                            "
                            title="Refresh analytics"
                            aria-label="Refresh case analytics"
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

                    </div>
                </div>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="grid lg:grid-cols-[250px_minmax(0,1fr)]">

                    {/* =================================================
                        STATUS LIST
                    ================================================= */}

                    <div className="border-b border-slate-100 p-5 lg:border-b-0 lg:border-r sm:p-6">

                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                Status
                            </span>

                            <span className="text-[10px] text-slate-300">
                                Cases
                            </span>
                        </div>

                        <div className="space-y-1.5">

                            {data.map((item) => {
                                const config =
                                    STATUS_ORDER.find(
                                        (status) =>
                                            status.key ===
                                            item.key
                                    );

                                const Icon =
                                    config?.icon ||
                                    CircleDot;

                                return (
                                    <div
                                        key={item.key}
                                        className="
                                            group
                                            flex
                                            items-center
                                            justify-between
                                            rounded-xl
                                            px-3
                                            py-2.5
                                            transition-colors
                                            duration-200
                                            hover:bg-slate-50
                                        "
                                    >

                                        <div className="flex min-w-0 items-center gap-3">

                                            <div
                                                className={`
                                                    flex
                                                    h-8
                                                    w-8
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    ${
                                                        config?.soft ||
                                                        "bg-slate-100"
                                                    }
                                                    ${
                                                        config?.text ||
                                                        "text-slate-500"
                                                    }
                                                `}
                                            >
                                                <Icon size={13} />
                                            </div>

                                            <span className="truncate text-[11px] font-medium text-slate-600">
                                                {item.status}
                                            </span>

                                        </div>

                                        <span className="ml-3 text-sm font-bold text-[#101a28]">
                                            {loading
                                                ? "..."
                                                : item.count.toLocaleString()}
                                        </span>

                                    </div>
                                );
                            })}

                        </div>

                    </div>

                    {/* =================================================
                        CHART
                    ================================================= */}

                    <div className="min-w-0 p-5 sm:p-6">

                        <div className="mb-4 flex items-center justify-between">

                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                    Distribution
                                </span>

                                <p className="mt-1 text-xs text-slate-400">
                                    Current cases by status
                                </p>
                            </div>

                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-semibold text-slate-400">
                                Live
                            </span>

                        </div>

                        {loading ? (
                            <ChartSkeleton />
                        ) : data.every(
                            (item) =>
                                item.count === 0
                        ) ? (
                            <EmptyState />
                        ) : (
                            <div className="h-[310px] w-full">

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <BarChart
                                        data={data}
                                        margin={{
                                            top: 15,
                                            right: 10,
                                            left: -15,
                                            bottom: 5,
                                        }}
                                        barCategoryGap="24%"
                                    >

                                        <CartesianGrid
                                            stroke="#edf0f4"
                                            strokeDasharray="3 5"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="status"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{
                                                fill: "#94a0b2",
                                                fontSize: 9,
                                            }}
                                            interval={0}
                                            tickFormatter={(
                                                value
                                            ) => {
                                                if (
                                                    value ===
                                                    "Awaiting Customer"
                                                ) {
                                                    return "Awaiting";
                                                }

                                                if (
                                                    value ===
                                                    "In Progress"
                                                ) {
                                                    return "In progress";
                                                }

                                                return value;
                                            }}
                                        />

                                        <YAxis
                                            allowDecimals={false}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{
                                                fill: "#a2acba",
                                                fontSize: 9,
                                            }}
                                        />

                                        <Tooltip
                                            cursor={{
                                                fill: "rgba(82,126,185,0.04)",
                                            }}
                                            contentStyle={{
                                                border:
                                                    "1px solid #e5e9ef",
                                                borderRadius:
                                                    "12px",
                                                boxShadow:
                                                    "0 12px 30px rgba(16,32,55,0.10)",
                                                fontSize:
                                                    "11px",
                                            }}
                                            formatter={(
                                                value
                                            ) => [
                                                `${value} cases`,
                                                "Count",
                                            ]}
                                        />

                                        <Bar
                                            dataKey="count"
                                            radius={[
                                                6,
                                                6,
                                                2,
                                                2,
                                            ]}
                                            maxBarSize={42}
                                        >
                                            {data.map(
                                                (
                                                    entry,
                                                    index
                                                ) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            entry.color
                                                        }
                                                    />
                                                )
                                            )}
                                        </Bar>

                                    </BarChart>
                                </ResponsiveContainer>

                            </div>
                        )}

                    </div>

                </div>
            </section>

            {/* =====================================================
                BOTTOM SUMMARY
            ===================================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <SummaryCard
                    icon={Activity}
                    label="Active workload"
                    value={activeCases}
                    description="Cases currently requiring action"
                    iconClass="bg-[#edf4fd] text-[#527eb9]"
                />

                <SummaryCard
                    icon={AlertTriangle}
                    label="Escalated"
                    value={escalatedCases}
                    description="Cases requiring director attention"
                    iconClass="bg-[#fdf0f0] text-[#c65b5b]"
                />

                <SummaryCard
                    icon={CheckCircle2}
                    label="Resolved / Closed"
                    value={resolvedCases}
                    description="Cases completed in the lifecycle"
                    iconClass="bg-[#edf8f4] text-[#3d9b7a]"
                />

                <SummaryCard
                    icon={XCircle}
                    label="Cancelled"
                    value={cancelledCases}
                    description="Cases cancelled before completion"
                    iconClass="bg-[#f8eff1] text-[#9a6b75]"
                />

            </div>

        </div>
    );
}


/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
    icon: Icon,
    label,
    value,
    description,
    iconClass,
}) {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(16,32,55,0.035)]">

            <div className="flex items-start justify-between gap-4">

                <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#101a28]">
                        {value.toLocaleString()}
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-slate-400">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon size={15} />
                </div>

            </div>

        </div>
    );
}


/* =====================================================
   CHART SKELETON
===================================================== */

function ChartSkeleton() {
    return (
        <div className="h-[310px] w-full">

            <div className="flex h-full items-end justify-between gap-4 px-6 pb-8">

                {[42, 67, 35, 76, 52, 31, 61, 45].map(
                    (height, index) => (
                        <div
                            key={index}
                            className="w-full max-w-[42px] animate-pulse rounded-t-md bg-slate-100"
                            style={{
                                height: `${height}%`,
                            }}
                        />
                    )
                )}

            </div>

        </div>
    );
}
