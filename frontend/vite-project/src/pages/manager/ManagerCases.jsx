import { useEffect, useMemo, useState } from "react";

import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    Clock3,
    CircleDot,
    RefreshCw,
} from "lucide-react";

import { managerApi } from "../../api/managerApi";
import ManagerHeader from "../../components/manager/ManagerHeader";
import CaseTable from "../../components/manager/CaseTable";

export default function ManagerCasesPage() {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError("");

                const response =
                    await managerApi.getScopeOverview();

                if (!cancelled) {
                    setOverview(
                        response?.data?.data || null
                    );
                }
            } catch (caughtError) {
                console.error(caughtError);

                if (!cancelled) {
                    setError(
                        "Unable to load manager case overview."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        const handleCaseUpdated = () => {
            load();
        };

        const handleFocus = () => {
            load();
        };

        window.addEventListener(
            "cases:updated",
            handleCaseUpdated
        );

        window.addEventListener(
            "focus",
            handleFocus
        );

        return () => {
            cancelled = true;

            window.removeEventListener(
                "cases:updated",
                handleCaseUpdated
            );

            window.removeEventListener(
                "focus",
                handleFocus
            );
        };
    }, []);

    const handleRefresh = async () => {
        try {
            setRefreshing(true);

            const response =
                await managerApi.getScopeOverview();

            setOverview(
                response?.data?.data || null
            );
        } catch (caughtError) {
            console.error(caughtError);
        } finally {
            setRefreshing(false);
        }
    };

    const cases =
        overview?.caseMetrics?.cases || [];

    const metrics =
        overview?.caseMetrics || {};

    const scopeName =
        overview?.department?.name ||
        overview?.division?.name ||
        overview?.section?.name ||
        "Case Oversight";

    const statusCounts =
        useMemo(() => {
            const result = {
                open: 0,
                assigned: 0,
                inProgress: 0,
                pending: 0,
                escalated: 0,
                resolved: 0,
                confirmation: 0,
                closed: 0,
            };

            cases.forEach((item) => {
                const status = String(
                    item?.status || ""
                ).toUpperCase();

                if (status === "OPEN") {
                    result.open++;
                }

                if (status === "ASSIGNED") {
                    result.assigned++;
                }

                if (status === "IN_PROGRESS") {
                    result.inProgress++;
                }

                if (status === "PENDING") {
                    result.pending++;
                }

                if (status === "ESCALATED") {
                    result.escalated++;
                }

                if (status === "RESOLVED") {
                    result.resolved++;
                }

                if (
                    status ===
                    "CUSTOMER_CONFIRMATION"
                ) {
                    result.confirmation++;
                }

                if (status === "CLOSED") {
                    result.closed++;
                }
            });

            return result;
        }, [cases]);

    const totalCases =
        Number(
            metrics?.totalAssignedCases
        ) || cases.length || 0;

    const activeCases =
        statusCounts.open +
        statusCounts.assigned +
        statusCounts.inProgress;

    const pendingCases =
        statusCounts.pending +
        statusCounts.escalated +
        statusCounts.confirmation;

    const completedCases =
        statusCounts.resolved +
        statusCounts.closed;

    return (
        <div className="min-h-full bg-slate-50/60 pb-10">

            <div className="space-y-6">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header
                    className="
                        relative
                        overflow-hidden
                        rounded-3xl
                        border
                        border-slate-200
                        bg-white
                        px-6
                        py-6
                        shadow-[0_1px_2px_rgba(15,23,42,0.03)]
                        sm:px-7
                        lg:px-8
                    "
                >
                    <div
                        className="
                            pointer-events-none
                            absolute
                            -right-20
                            -top-24
                            h-64
                            w-64
                            rounded-full
                            bg-blue-50
                            blur-3xl
                        "
                    />

                    <div
                        className="
                            relative
                            flex
                            flex-col
                            gap-5
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        "
                    >
                        <div>
                            <div
                                className="
                                    mb-3
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-blue-100
                                    bg-blue-50
                                    px-3
                                    py-1.5
                                "
                            >
                                <Activity
                                    size={13}
                                    className="text-blue-600"
                                />

                                <span
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.16em]
                                        text-blue-700
                                    "
                                >
                                    Manager Operations
                                </span>
                            </div>

                            <h1
                                className="
                                    text-2xl
                                    font-bold
                                    tracking-[-0.025em]
                                    text-slate-950
                                    sm:text-3xl
                                "
                            >
                                Case Oversight
                            </h1>

                            <p
                                className="
                                    mt-2
                                    max-w-2xl
                                    text-sm
                                    leading-6
                                    text-slate-500
                                "
                            >
                                Monitor support cases, workload,
                                priorities, and resolution activity
                                within your management scope.
                            </p>
                        </div>

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >
                            <div
                                className="
                                    hidden
                                    items-center
                                    gap-3
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-4
                                    py-3
                                    sm:flex
                                "
                            >
                                <div
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-white
                                        text-blue-600
                                        shadow-sm
                                        ring-1
                                        ring-slate-200
                                    "
                                >
                                    <ClipboardList size={17} />
                                </div>

                                <div>
                                    <p
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-slate-400
                                        "
                                    >
                                        Current Scope
                                    </p>

                                    <p
                                        className="
                                            mt-0.5
                                            max-w-[180px]
                                            truncate
                                            text-sm
                                            font-bold
                                            text-slate-900
                                        "
                                    >
                                        {scopeName}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={
                                    loading ||
                                    refreshing
                                }
                                className="
                                    inline-flex
                                    h-11
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-4
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    shadow-sm
                                    transition
                                    hover:border-blue-200
                                    hover:bg-blue-50
                                    hover:text-blue-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                <RefreshCw
                                    size={15}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                <span className="hidden sm:inline">
                                    Refresh
                                </span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div
                        className="
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            text-red-700
                        "
                    >
                        {error}
                    </div>
                )}

                {/* =================================================
                    METRIC CARDS
                ================================================= */}

                <section>
                    <div
                        className="
                            mb-3
                            flex
                            items-end
                            justify-between
                        "
                    >
                        <div>
                            <p
                                className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-slate-400
                                "
                            >
                                Overview
                            </p>

                            <h2
                                className="
                                    mt-1
                                    text-base
                                    font-bold
                                    text-slate-900
                                "
                            >
                                Case workload
                            </h2>
                        </div>

                        <span
                            className="
                                hidden
                                text-xs
                                font-medium
                                text-slate-400
                                sm:block
                            "
                        >
                            Current scope distribution
                        </span>
                    </div>

                    <div
                        className="
                            grid
                            gap-4
                            sm:grid-cols-2
                            xl:grid-cols-4
                        "
                    >
                        <MetricCard
                            title="Total Cases"
                            value={totalCases}
                            caption="Cases in your scope"
                            icon={ClipboardList}
                            iconClass="bg-[#edf4fd] text-[#527eb9]"
                            loading={loading}
                        />

                        <MetricCard
                            title="Active"
                            value={activeCases}
                            caption="Open and in progress"
                            icon={Activity}
                            iconClass="bg-[#edf7f3] text-[#3b8d73]"
                            loading={loading}
                        />

                        <MetricCard
                            title="Attention"
                            value={pendingCases}
                            caption="Pending or escalated"
                            icon={AlertTriangle}
                            iconClass="bg-[#fff7e8] text-[#c58a27]"
                            loading={loading}
                        />

                        <MetricCard
                            title="Completed"
                            value={completedCases}
                            caption="Resolved and closed"
                            icon={CheckCircle2}
                            iconClass="bg-[#edf8f4] text-[#3d9b7a]"
                            loading={loading}
                        />
                    </div>
                </section>

                {/* =================================================
                    STATUS BREAKDOWN
                ================================================= */}

                <section
                    className="
                        overflow-hidden
                        rounded-[22px]
                        border
                        border-slate-200/80
                        bg-white
                        shadow-[0_8px_30px_rgba(16,32,55,0.045)]
                    "
                >
                    <div
                        className="
                            border-b
                            border-slate-100
                            px-5
                            py-5
                            sm:px-6
                        "
                    >
                        <div
                            className="
                                flex
                                flex-col
                                gap-2
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            "
                        >
                            <div>
                                <p
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.16em]
                                        text-slate-400
                                    "
                                >
                                    Case lifecycle
                                </p>

                                <h2
                                    className="
                                        mt-1
                                        text-base
                                        font-bold
                                        tracking-[-0.02em]
                                        text-slate-900
                                    "
                                >
                                    Status distribution
                                </h2>
                            </div>

                            <span
                                className="
                                    w-fit
                                    rounded-full
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-2.5
                                    py-1
                                    text-[9px]
                                    font-semibold
                                    text-slate-400
                                "
                            >
                                {totalCases} total
                            </span>
                        </div>
                    </div>

                    <div
                        className="
                            grid
                            grid-cols-2
                            divide-x
                            divide-y
                            divide-slate-100
                            sm:grid-cols-4
                            sm:divide-y-0
                        "
                    >
                        <StatusItem
                            label="Open"
                            value={statusCounts.open}
                            icon={CircleDot}
                            iconClass="text-[#527eb9]"
                        />

                        <StatusItem
                            label="In Progress"
                            value={statusCounts.inProgress}
                            icon={Activity}
                            iconClass="text-[#3b8d73]"
                        />

                        <StatusItem
                            label="Pending"
                            value={statusCounts.pending}
                            icon={Clock3}
                            iconClass="text-[#c58a27]"
                        />

                        <StatusItem
                            label="Escalated"
                            value={statusCounts.escalated}
                            icon={AlertTriangle}
                            iconClass="text-[#c65b5b]"
                        />
                    </div>
                </section>

                {/* =================================================
                    CASE REGISTRY
                ================================================= */}

                <section>
                    <div
                        className="
                            mb-3
                            flex
                            items-end
                            justify-between
                        "
                    >
                        <div>
                            <p
                                className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-slate-400
                                "
                            >
                                Case registry
                            </p>

                            <h2
                                className="
                                    mt-1
                                    text-base
                                    font-bold
                                    text-slate-900
                                "
                            >
                                Recent scope cases
                            </h2>
                        </div>

                        <span
                            className="
                                text-xs
                                font-medium
                                text-slate-400
                            "
                        >
                            Showing {Math.min(
                                cases.length,
                                8
                            )} cases
                        </span>
                    </div>

                    <CaseTable
                        rows={cases}
                        loading={loading}
                    />
                </section>
            </div>
        </div>
    );
}


/* =====================================================
   METRIC CARD
===================================================== */

function MetricCard({
    title,
    value,
    caption,
    icon: Icon,
    iconClass,
    loading,
}) {
    return (
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
                shadow-[0_4px_18px_-12px_rgba(15,23,42,0.22)]
                transition
                duration-200
                hover:-translate-y-[1px]
                hover:shadow-[0_8px_25px_-14px_rgba(15,23,42,0.25)]
            "
        >
            <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">
                    <p
                        className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.14em]
                            text-slate-400
                        "
                    >
                        {title}
                    </p>

                    {loading ? (
                        <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
                    ) : (
                        <p
                            className="
                                mt-1
                                text-2xl
                                font-bold
                                tracking-[-0.035em]
                                text-[#101a28]
                            "
                        >
                            {Number(value || 0).toLocaleString()}
                        </p>
                    )}

                    <p
                        className="
                            mt-2
                            text-[11px]
                            leading-5
                            text-slate-400
                        "
                    >
                        {caption}
                    </p>
                </div>

                <div
                    className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${iconClass}
                    `}
                >
                    <Icon size={17} />
                </div>
            </div>

            <div
                className="
                    absolute
                    bottom-0
                    left-0
                    h-[2px]
                    w-0
                    bg-slate-300
                    transition-all
                    duration-300
                    group-hover:w-full
                "
            />
        </div>
    );
}


/* =====================================================
   STATUS ITEM
===================================================== */

function StatusItem({
    label,
    value,
    icon: Icon,
    iconClass,
}) {
    return (
        <div className="flex items-center gap-3 px-5 py-4 sm:px-6">

            <div
                className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-slate-50
                "
            >
                <Icon
                    size={14}
                    className={iconClass}
                />
            </div>

            <div className="min-w-0">
                <p
                    className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-slate-400
                    "
                >
                    {label}
                </p>

                <p
                    className="
                        mt-0.5
                        text-lg
                        font-bold
                        tracking-[-0.025em]
                        text-slate-800
                    "
                >
                    {Number(value || 0).toLocaleString()}
                </p>
            </div>
        </div>
    );
}