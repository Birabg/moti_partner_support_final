import { useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    ClipboardList,
    Users,
    CheckCircle2,
    Clock3,
    AlertCircle,
    TrendingUp,
    RefreshCw,
    Layers3,
} from "lucide-react";

import { managerApi } from "../../api/managerApi";
import { useAuth } from "../../context/useAuth";

import DashboardCard from "../../components/manager/DashboardCard";
import ManagerHeader from "../../components/manager/ManagerHeader";
import { Card, CardContent } from "../../components/ui/card";

export default function ManagerReports() {
    const { user } = useAuth();

    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ---------------------------------------------------------
       Load manager analytics
    --------------------------------------------------------- */

    async function loadOverview() {
        try {
            setLoading(true);

            const response = await managerApi.getScopeOverview();

            setSnapshot(response?.data?.data || null);
        } catch (error) {
            console.error(
                "Failed to load manager reports:",
                error
            );
        } finally {
            setLoading(false);
        }
    }

    /* ---------------------------------------------------------
       Initial load + refresh listeners
    --------------------------------------------------------- */

    useEffect(() => {
        let cancelled = false;

        const safeLoad = async () => {
            try {
                const response =
                    await managerApi.getScopeOverview();

                if (!cancelled) {
                    setSnapshot(
                        response?.data?.data || null
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to load manager reports:",
                    error
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        const refresh = () => {
            safeLoad();
        };

        safeLoad();

        window.addEventListener(
            "cases:updated",
            refresh
        );

        window.addEventListener(
            "focus",
            refresh
        );

        return () => {
            cancelled = true;

            window.removeEventListener(
                "cases:updated",
                refresh
            );

            window.removeEventListener(
                "focus",
                refresh
            );
        };
    }, []);

    /* ---------------------------------------------------------
       Scope
    --------------------------------------------------------- */

    const scopeName =
        snapshot?.department?.name ||
        snapshot?.division?.name ||
        snapshot?.section?.name ||
        "Current scope";

    /* ---------------------------------------------------------
       Case data
    --------------------------------------------------------- */

    const cases =
        snapshot?.caseMetrics?.cases || [];

    const totalCases =
        snapshot?.caseMetrics?.totalAssignedCases ||
        cases.length ||
        0;

    /* ---------------------------------------------------------
       Case statistics
    --------------------------------------------------------- */

    const statistics = useMemo(() => {
        const result = {
            open: 0,
            assigned: 0,
            inProgress: 0,
            pending: 0,
            escalated: 0,
            closed: 0,
            resolved: 0,
            unassigned: 0,
        };

        cases.forEach((item) => {
            const status = String(
                item.status || ""
            ).toUpperCase();

            const isAssigned =
                Boolean(item.assignedSupportId) ||
                Boolean(item.assignedSupport?.id);

            if (!isAssigned) {
                result.unassigned += 1;
            }

            switch (status) {
                case "OPEN":
                    result.open += 1;
                    break;

                case "ASSIGNED":
                    result.assigned += 1;
                    break;

                case "IN_PROGRESS":
                    result.inProgress += 1;
                    break;

                case "PENDING":
                case "WAITING_CUSTOMER_FEEDBACK":
                    result.pending += 1;
                    break;

                case "ESCALATED":
                    result.escalated += 1;
                    break;

                case "CLOSED":
                    result.closed += 1;
                    break;

                case "RESOLVED":
                    result.resolved += 1;
                    break;

                default:
                    break;
            }
        });

        return result;
    }, [cases]);

    /* ---------------------------------------------------------
       Staff statistics
    --------------------------------------------------------- */

    const totalStaff =
        snapshot?.hierarchyMetrics
            ?.totalSectionStaffCount ||
        snapshot?.hierarchyMetrics
            ?.totalDivisionStaffCount ||
        snapshot?.hierarchyMetrics
            ?.totalDepartmentStaffCount ||
        0;

    /* ---------------------------------------------------------
       Percentages
    --------------------------------------------------------- */

    const getPercentage = (value) => {
        if (!totalCases) return 0;

        return Math.round(
            (value / totalCases) * 100
        );
    };

    const completionRate =
        totalCases > 0
            ? Math.round(
                  ((statistics.closed +
                      statistics.resolved) /
                      totalCases) *
                      100
              )
            : 0;

    /* ---------------------------------------------------------
       Helpers
    --------------------------------------------------------- */

    const formatStatus = (status) => {
        return String(status)
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };

    const getStatusClass = (status) => {
        switch (
            String(status).toUpperCase()
        ) {
            case "OPEN":
                return "bg-blue-50 text-blue-700 border-blue-100";

            case "ASSIGNED":
                return "bg-indigo-50 text-indigo-700 border-indigo-100";

            case "IN_PROGRESS":
                return "bg-amber-50 text-amber-700 border-amber-100";

            case "PENDING":
                return "bg-orange-50 text-orange-700 border-orange-100";

            case "ESCALATED":
                return "bg-red-50 text-red-700 border-red-100";

            case "RESOLVED":
                return "bg-emerald-50 text-emerald-700 border-emerald-100";

            case "CLOSED":
                return "bg-slate-100 text-slate-600 border-slate-200";

            default:
                return "bg-slate-50 text-slate-600 border-slate-200";
        }
    };

    /* ---------------------------------------------------------
       Refresh
    --------------------------------------------------------- */

    const handleRefresh = async () => {
        await loadOverview();
    };

    /* ---------------------------------------------------------
       Render
    --------------------------------------------------------- */

    return (
        <div className="space-y-6">

            {/* -------------------------------------------------
                Header
            ------------------------------------------------- */}

            <ManagerHeader
                user={user}
                orgPath={scopeName}
                managerRole={
                    user?.managerType || "Manager"
                }
            />

            {/* -------------------------------------------------
                Main statistics
            ------------------------------------------------- */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <DashboardCard
                    title="Total Cases"
                    value={totalCases}
                    caption="Cases visible within the current manager scope"
                    icon={ClipboardList}
                    accent="amber"
                    loading={loading}
                />

                <DashboardCard
                    title="Scoped Staff"
                    value={totalStaff}
                    caption="Staff members within the current manager scope"
                    icon={Users}
                    accent="green"
                    loading={loading}
                />

                <DashboardCard
                    title="Completion Rate"
                    value={`${completionRate}%`}
                    caption="Cases resolved or closed within the scope"
                    icon={TrendingUp}
                    accent="rose"
                    loading={loading}
                />

            </div>

            {/* -------------------------------------------------
                Analytics header
            ------------------------------------------------- */}

            <Card className="overflow-hidden border-slate-200 shadow-sm">
                <CardContent className="p-0">

                    <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-6">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-start gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                                    <BarChart3 size={17} />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Executive Analytics
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Overview of case activity and
                                        operational performance within your
                                        management scope.
                                    </p>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={loading}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={14}
                                    className={
                                        loading
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                Refresh
                            </button>

                        </div>

                    </div>

                    {/* -------------------------------------------------
                        Case status overview
                    ------------------------------------------------- */}

                    <div className="p-5 sm:p-6">

                        <div className="mb-5">

                            <div className="flex items-center justify-between">

                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Case Status Overview
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Current distribution of cases
                                    </p>
                                </div>

                                <span className="text-xs font-semibold text-slate-400">
                                    {totalCases} total
                                </span>

                            </div>

                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                            {/* Open */}

                            <div className="rounded-xl border border-slate-200 bg-white p-4">

                                <div className="flex items-center justify-between">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <ClipboardList size={16} />
                                    </div>

                                    <span className="text-xs font-semibold text-slate-400">
                                        {getPercentage(
                                            statistics.open
                                        )}
                                        %
                                    </span>

                                </div>

                                <p className="mt-4 text-2xl font-bold text-slate-900">
                                    {statistics.open}
                                </p>

                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    Open Cases
                                </p>

                            </div>

                            {/* Assigned */}

                            <div className="rounded-xl border border-slate-200 bg-white p-4">

                                <div className="flex items-center justify-between">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                        <Users size={16} />
                                    </div>

                                    <span className="text-xs font-semibold text-slate-400">
                                        {getPercentage(
                                            statistics.assigned
                                        )}
                                        %
                                    </span>

                                </div>

                                <p className="mt-4 text-2xl font-bold text-slate-900">
                                    {statistics.assigned}
                                </p>

                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    Assigned Cases
                                </p>

                            </div>

                            {/* In progress */}

                            <div className="rounded-xl border border-slate-200 bg-white p-4">

                                <div className="flex items-center justify-between">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                        <Clock3 size={16} />
                                    </div>

                                    <span className="text-xs font-semibold text-slate-400">
                                        {getPercentage(
                                            statistics.inProgress
                                        )}
                                        %
                                    </span>

                                </div>

                                <p className="mt-4 text-2xl font-bold text-slate-900">
                                    {statistics.inProgress}
                                </p>

                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    In Progress
                                </p>

                            </div>

                            {/* Escalated */}

                            <div className="rounded-xl border border-slate-200 bg-white p-4">

                                <div className="flex items-center justify-between">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                        <AlertCircle size={16} />
                                    </div>

                                    <span className="text-xs font-semibold text-slate-400">
                                        {getPercentage(
                                            statistics.escalated
                                        )}
                                        %
                                    </span>

                                </div>

                                <p className="mt-4 text-2xl font-bold text-slate-900">
                                    {statistics.escalated}
                                </p>

                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    Escalated Cases
                                </p>

                            </div>

                        </div>

                    </div>

                </CardContent>
            </Card>

            {/* -------------------------------------------------
                Performance section
            ------------------------------------------------- */}

            <div className="grid gap-6 lg:grid-cols-2">

                {/* Case performance */}

                <Card className="border-slate-200 shadow-sm">

                    <CardContent className="p-5 sm:p-6">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <CheckCircle2 size={18} />
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Resolution Performance
                                </h3>

                                <p className="mt-1 text-xs text-slate-400">
                                    Completed cases across your scope
                                </p>
                            </div>

                        </div>

                        <div className="mt-6">

                            <div className="flex items-end justify-between">

                                <div>
                                    <p className="text-3xl font-bold text-slate-900">
                                        {completionRate}%
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Overall completion rate
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600">
                                        {statistics.resolved +
                                            statistics.closed}
                                    </p>

                                    <p className="text-[11px] text-slate-400">
                                        Completed
                                    </p>
                                </div>

                            </div>

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                    style={{
                                        width: `${completionRate}%`,
                                    }}
                                />

                            </div>

                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">

                            <div className="rounded-xl bg-slate-50 p-3">

                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Resolved
                                </p>

                                <p className="mt-1 text-lg font-bold text-slate-900">
                                    {statistics.resolved}
                                </p>

                            </div>

                            <div className="rounded-xl bg-slate-50 p-3">

                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Closed
                                </p>

                                <p className="mt-1 text-lg font-bold text-slate-900">
                                    {statistics.closed}
                                </p>

                            </div>

                        </div>

                    </CardContent>

                </Card>

                {/* Workload */}

                <Card className="border-slate-200 shadow-sm">

                    <CardContent className="p-5 sm:p-6">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                                <Layers3 size={18} />
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Workload Overview
                                </h3>

                                <p className="mt-1 text-xs text-slate-400">
                                    Current workload distribution
                                </p>
                            </div>

                        </div>

                        <div className="mt-6 space-y-4">

                            {/* Unassigned */}

                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <span className="text-xs font-semibold text-slate-600">
                                        Unassigned
                                    </span>

                                    <span className="text-xs font-bold text-rose-600">
                                        {statistics.unassigned}
                                    </span>

                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                    <div
                                        className="h-full rounded-full bg-rose-500"
                                        style={{
                                            width: `${getPercentage(
                                                statistics.unassigned
                                            )}%`,
                                        }}
                                    />

                                </div>

                            </div>

                            {/* Assigned */}

                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <span className="text-xs font-semibold text-slate-600">
                                        Assigned
                                    </span>

                                    <span className="text-xs font-bold text-indigo-600">
                                        {statistics.assigned}
                                    </span>

                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                    <div
                                        className="h-full rounded-full bg-indigo-500"
                                        style={{
                                            width: `${getPercentage(
                                                statistics.assigned
                                            )}%`,
                                        }}
                                    />

                                </div>

                            </div>

                            {/* In progress */}

                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <span className="text-xs font-semibold text-slate-600">
                                        In Progress
                                    </span>

                                    <span className="text-xs font-bold text-amber-600">
                                        {statistics.inProgress}
                                    </span>

                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                    <div
                                        className="h-full rounded-full bg-amber-500"
                                        style={{
                                            width: `${getPercentage(
                                                statistics.inProgress
                                            )}%`,
                                        }}
                                    />

                                </div>

                            </div>

                            {/* Pending */}

                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <span className="text-xs font-semibold text-slate-600">
                                        Pending
                                    </span>

                                    <span className="text-xs font-bold text-orange-600">
                                        {statistics.pending}
                                    </span>

                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                    <div
                                        className="h-full rounded-full bg-orange-500"
                                        style={{
                                            width: `${getPercentage(
                                                statistics.pending
                                            )}%`,
                                        }}
                                    />

                                </div>

                            </div>

                        </div>

                    </CardContent>

                </Card>

            </div>

            {/* -------------------------------------------------
                Detailed status table
            ------------------------------------------------- */}

            <Card className="overflow-hidden border-slate-200 shadow-sm">

                <CardContent className="p-0">

                    <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-6">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                                <BarChart3 size={17} />
                            </div>

                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    Status Breakdown
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Detailed case status distribution
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50/70">

                                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Status
                                    </th>

                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Cases
                                    </th>

                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Share
                                    </th>

                                    <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Distribution
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {[
                                    ["OPEN", statistics.open],
                                    ["ASSIGNED", statistics.assigned],
                                    [
                                        "IN_PROGRESS",
                                        statistics.inProgress,
                                    ],
                                    [
                                        "PENDING",
                                        statistics.pending,
                                    ],
                                    [
                                        "ESCALATED",
                                        statistics.escalated,
                                    ],
                                    [
                                        "RESOLVED",
                                        statistics.resolved,
                                    ],
                                    [
                                        "CLOSED",
                                        statistics.closed,
                                    ],
                                ].map(
                                    ([status, count]) => {

                                        const percentage =
                                            getPercentage(
                                                count
                                            );

                                        return (
                                            <tr
                                                key={
                                                    status
                                                }
                                                className="transition hover:bg-slate-50/70"
                                            >

                                                <td className="px-6 py-4">

                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                                                            status
                                                        )}`}
                                                    >
                                                        {formatStatus(
                                                            status
                                                        )}
                                                    </span>

                                                </td>

                                                <td className="px-4 py-4">

                                                    <span className="text-sm font-bold text-slate-800">
                                                        {
                                                            count
                                                        }
                                                    </span>

                                                </td>

                                                <td className="px-4 py-4">

                                                    <span className="text-sm font-medium text-slate-600">
                                                        {
                                                            percentage
                                                        }
                                                        %
                                                    </span>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center justify-end gap-3">

                                                        <div className="hidden w-32 overflow-hidden rounded-full bg-slate-100 sm:block">

                                                            <div
                                                                className="h-1.5 rounded-full bg-slate-800"
                                                                style={{
                                                                    width: `${percentage}%`,
                                                                }}
                                                            />

                                                        </div>

                                                        <span className="w-10 text-right text-xs font-semibold text-slate-400">
                                                            {
                                                                percentage
                                                            }
                                                            %
                                                        </span>

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                    <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-3 sm:px-6">

                        <div className="flex items-center justify-between">

                            <p className="text-xs text-slate-500">
                                Reporting scope:{" "}
                                <span className="font-semibold text-slate-700">
                                    {scopeName}
                                </span>
                            </p>

                            <p className="hidden text-xs text-slate-400 sm:block">
                                {totalCases} total cases
                            </p>

                        </div>

                    </div>

                </CardContent>

            </Card>

        </div>
    );
}