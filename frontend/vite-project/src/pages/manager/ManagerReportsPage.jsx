import { useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    ClipboardList,
    CheckCircle2,
    Clock3,
    AlertCircle,
    RefreshCw,
    TrendingUp,
    Users,
} from "lucide-react";

import { managerApi } from "../../api/managerApi";
import { useAuth } from "../../context/useAuth";

import DashboardCard from "../../components/manager/DashboardCard";
import ManagerHeader from "../../components/manager/ManagerHeader";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";


export default function ManagerReportsPage() {

    const { user } = useAuth();

    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);


    /*
    |--------------------------------------------------------------------------
    | Load reports
    |--------------------------------------------------------------------------
    */

    const loadReports = async () => {

        try {

            setLoading(true);

            const response = await managerApi.getMetrics();

            setOverview(
                response?.data?.data || null
            );

        } catch (error) {

            console.error(
                "Failed to load manager reports:",
                error
            );

        } finally {

            setLoading(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | Initial load + refresh
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadReports();

        const handleCasesUpdated = () => {
            loadReports();
        };

        window.addEventListener(
            "cases:updated",
            handleCasesUpdated
        );

        window.addEventListener(
            "focus",
            handleCasesUpdated
        );

        return () => {

            window.removeEventListener(
                "cases:updated",
                handleCasesUpdated
            );

            window.removeEventListener(
                "focus",
                handleCasesUpdated
            );

        };

    }, []);


    /*
    |--------------------------------------------------------------------------
    | Metrics
    |--------------------------------------------------------------------------
    */

    const summary = overview?.summary || {};


    const totalCases =
        summary?.totalCases ||
        overview?.totalCases ||
        0;


    const openCases =
        summary?.openCases ||
        summary?.activeCases ||
        overview?.openCases ||
        0;


    const resolvedCases =
        summary?.resolvedCases ||
        summary?.closedCases ||
        overview?.resolvedCases ||
        0;


    const pendingCases =
        summary?.pendingCases ||
        overview?.pendingCases ||
        0;


    const totalStaff =
        summary?.totalStaff ||
        overview?.totalStaff ||
        0;


    /*
    |--------------------------------------------------------------------------
    | Resolution rate
    |--------------------------------------------------------------------------
    */

    const resolutionRate = useMemo(() => {

        if (!totalCases) {
            return 0;
        }

        return Math.round(
            (resolvedCases / totalCases) * 100
        );

    }, [totalCases, resolvedCases]);


    /*
    |--------------------------------------------------------------------------
    | Scope
    |--------------------------------------------------------------------------
    */

    const scope =
        overview?.department?.name ||
        overview?.division?.name ||
        overview?.section?.name ||
        "Current scope";


    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    const formatNumber = (value) => {

        return Number(value || 0).toLocaleString();

    };


    return (

        <div className="space-y-6">

            {/* =========================================================
                HEADER
            ========================================================= */}

            <ManagerHeader
                user={user}
                orgPath={scope}
                managerRole={
                    user?.managerType ||
                    "Manager"
                }
            />


            {/* =========================================================
                PAGE TITLE
            ========================================================= */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div>

                    <div className="flex items-center gap-2">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">

                            <BarChart3 size={17} />

                        </div>

                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            Reports & Analytics
                        </h1>

                    </div>

                    <p className="mt-2 max-w-2xl text-sm text-slate-500">
                        Monitor case activity, resolution performance,
                        workload and operational trends within your
                        management scope.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={loadReports}
                    disabled={loading}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
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


            {/* =========================================================
                MAIN STATISTICS
            ========================================================= */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <DashboardCard
                    title="Total Cases"
                    value={formatNumber(totalCases)}
                    caption="Cases within the current reporting scope"
                    icon={ClipboardList}
                    accent="amber"
                    loading={loading}
                />


                <DashboardCard
                    title="Active Cases"
                    value={formatNumber(openCases)}
                    caption="Cases currently requiring attention"
                    icon={Clock3}
                    accent="rose"
                    loading={loading}
                />


                <DashboardCard
                    title="Resolved Cases"
                    value={formatNumber(resolvedCases)}
                    caption="Cases successfully resolved or closed"
                    icon={CheckCircle2}
                    accent="green"
                    loading={loading}
                />


                <DashboardCard
                    title="Resolution Rate"
                    value={`${resolutionRate}%`}
                    caption="Resolved cases compared with total cases"
                    icon={TrendingUp}
                    accent="blue"
                    loading={loading}
                />

            </div>


            {/* =========================================================
                ANALYTICS GRID
            ========================================================= */}

            <div className="grid gap-6 lg:grid-cols-3">


                {/* -----------------------------------------------------
                    CASE OVERVIEW
                ----------------------------------------------------- */}

                <Card className="overflow-hidden border-slate-200 shadow-sm lg:col-span-2">

                    <CardHeader className="border-b border-slate-100 bg-white">

                        <div className="flex items-center justify-between">

                            <div>

                                <CardTitle className="text-base font-bold text-slate-900">
                                    Case Overview
                                </CardTitle>

                                <p className="mt-1 text-xs text-slate-500">
                                    Current case distribution across
                                    your reporting scope.
                                </p>

                            </div>

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">

                                <BarChart3 size={16} />

                            </div>

                        </div>

                    </CardHeader>


                    <CardContent className="p-5">

                        <div className="space-y-5">


                            {/* Total */}

                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <span className="text-xs font-semibold text-slate-600">
                                        Total Cases
                                    </span>

                                    <span className="text-sm font-bold text-slate-900">
                                        {formatNumber(totalCases)}
                                    </span>

                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                    <div
                                        className="h-full rounded-full bg-slate-800"
                                        style={{
                                            width: totalCases
                                                ? "100%"
                                                : "0%",
                                        }}
                                    />

                                </div>

                            </div>


                            {/* Active */}

                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <div className="flex items-center gap-2">

                                        <span className="h-2 w-2 rounded-full bg-amber-500" />

                                        <span className="text-xs font-semibold text-slate-600">
                                            Active
                                        </span>

                                    </div>

                                    <span className="text-sm font-bold text-slate-900">
                                        {formatNumber(openCases)}
                                    </span>

                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                    <div
                                        className="h-full rounded-full bg-amber-500"
                                        style={{
                                            width: totalCases
                                                ? `${Math.min(
                                                    (openCases / totalCases) * 100,
                                                    100
                                                )}%`
                                                : "0%",
                                        }}
                                    />

                                </div>

                            </div>


                            {/* Resolved */}

                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <div className="flex items-center gap-2">

                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                                        <span className="text-xs font-semibold text-slate-600">
                                            Resolved
                                        </span>

                                    </div>

                                    <span className="text-sm font-bold text-slate-900">
                                        {formatNumber(resolvedCases)}
                                    </span>

                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                    <div
                                        className="h-full rounded-full bg-emerald-500"
                                        style={{
                                            width: totalCases
                                                ? `${Math.min(
                                                    (resolvedCases / totalCases) * 100,
                                                    100
                                                )}%`
                                                : "0%",
                                        }}
                                    />

                                </div>

                            </div>


                            {/* Pending */}

                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <div className="flex items-center gap-2">

                                        <span className="h-2 w-2 rounded-full bg-rose-500" />

                                        <span className="text-xs font-semibold text-slate-600">
                                            Pending
                                        </span>

                                    </div>

                                    <span className="text-sm font-bold text-slate-900">
                                        {formatNumber(pendingCases)}
                                    </span>

                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                    <div
                                        className="h-full rounded-full bg-rose-500"
                                        style={{
                                            width: totalCases
                                                ? `${Math.min(
                                                    (pendingCases / totalCases) * 100,
                                                    100
                                                )}%`
                                                : "0%",
                                        }}
                                    />

                                </div>

                            </div>

                        </div>

                    </CardContent>

                </Card>


                {/* -----------------------------------------------------
                    PERFORMANCE
                ----------------------------------------------------- */}

                <Card className="border-slate-200 shadow-sm">

                    <CardHeader className="border-b border-slate-100">

                        <CardTitle className="text-base font-bold text-slate-900">
                            Performance
                        </CardTitle>

                        <p className="text-xs text-slate-500">
                            Key operational indicators.
                        </p>

                    </CardHeader>


                    <CardContent className="p-5">

                        <div className="space-y-4">


                            {/* Resolution */}

                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                                <div className="flex items-center justify-between">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">

                                            <CheckCircle2 size={16} />

                                        </div>

                                        <div>

                                            <p className="text-xs font-semibold text-slate-500">
                                                Resolution Rate
                                            </p>

                                            <p className="mt-0.5 text-lg font-bold text-slate-900">
                                                {resolutionRate}%
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* Pending */}

                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">

                                        <AlertCircle size={16} />

                                    </div>

                                    <div>

                                        <p className="text-xs font-semibold text-slate-500">
                                            Pending Attention
                                        </p>

                                        <p className="mt-0.5 text-lg font-bold text-slate-900">
                                            {formatNumber(pendingCases)}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* Staff */}

                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                                        <Users size={16} />

                                    </div>

                                    <div>

                                        <p className="text-xs font-semibold text-slate-500">
                                            Scoped Staff
                                        </p>

                                        <p className="mt-0.5 text-lg font-bold text-slate-900">
                                            {formatNumber(totalStaff)}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </CardContent>

                </Card>

            </div>


            {/* =========================================================
                REPORT SUMMARY
            ========================================================= */}

            <Card className="overflow-hidden border-slate-200 shadow-sm">

                <CardContent className="p-0">

                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                        <div className="flex items-start gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">

                                <BarChart3 size={18} />

                            </div>

                            <div>

                                <h2 className="text-sm font-bold text-slate-900">
                                    Executive Summary
                                </h2>

                                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                                    The current reporting view is based on
                                    the manager's scoped analytics data.
                                    Case counts and performance indicators
                                    update whenever the reporting data is
                                    refreshed.
                                </p>

                            </div>

                        </div>


                        <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Reporting Scope
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                {scope}
                            </p>

                        </div>

                    </div>

                </CardContent>

            </Card>

        </div>

    );
}
