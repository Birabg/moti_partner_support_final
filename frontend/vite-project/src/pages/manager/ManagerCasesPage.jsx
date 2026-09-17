import { useEffect, useState } from "react";

import {
    ArrowRight,
    BarChart3,
    BriefcaseBusiness,
    ClipboardList,
    ShieldCheck,
} from "lucide-react";

import { managerApi } from "../../api/managerApi";
import { useAuth } from "../../context/useAuth";

import DashboardCard from "../../components/manager/DashboardCard";
import ManagerHeader from "../../components/manager/ManagerHeader";
import CaseTable from "../../components/manager/CaseTable";

export default function ManagerCasesPage() {
    const { user } = useAuth();

    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const response =
                    await managerApi.getScopeOverview();

                if (!cancelled) {
                    setOverview(
                        response?.data?.data || null
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to load manager cases:",
                    error
                );
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

    /* =========================================================
       DATA
    ========================================================= */

    const cases =
        overview?.caseMetrics?.cases || [];

    const statusCounts =
        overview?.caseMetrics?.casesByStatus || {};

    const totalCases =
        overview?.caseMetrics?.totalAssignedCases ||
        cases.length ||
        0;

    const activeCases =
        (statusCounts.OPEN || 0) +
        (statusCounts.ASSIGNED || 0) +
        (statusCounts.IN_PROGRESS || 0) +
        (statusCounts.PENDING || 0) +
        (statusCounts.ESCALATED || 0);

    const completedCases =
        (statusCounts.RESOLVED || 0) +
        (statusCounts.CLOSED || 0);

    const scopeName =
        overview?.department?.name ||
        overview?.division?.name ||
        overview?.section?.name ||
        "Case Oversight";

    return (
        <div className="min-h-full bg-slate-50/70">

            <main className="ps-container space-y-7 pb-12">

                {/* =================================================
                    HEADER
                ================================================= */}

                <ManagerHeader
                    user={user}
                    orgPath={scopeName}
                    managerRole={
                        user?.managerType ||
                        "Manager"
                    }
                />

                {/* =================================================
                    HERO
                ================================================= */}

                <section className="relative overflow-hidden rounded-[26px] bg-[#0b1d38] shadow-[0_16px_40px_rgba(15,35,65,0.10)]">

                    {/* Grid background */}

                    <div
                        className="absolute inset-0 opacity-[0.07]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                            backgroundSize:
                                "32px 32px",
                        }}
                    />

                    {/* Glow */}

                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

                    <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

                    {/* Hero content */}

                    <div className="relative flex flex-col gap-7 px-6 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <div className="mb-3 flex items-center gap-2">

                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                    Manager Workspace
                                </span>

                            </div>

                            <h1 className="text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                                Case Oversight
                            </h1>

                            <div className="mt-3 flex flex-wrap items-center gap-2">

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[10px] font-medium text-slate-300">

                                    <BriefcaseBusiness className="h-3 w-3" />

                                    {scopeName}

                                </span>

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[10px] font-medium text-slate-300">

                                    <ShieldCheck className="h-3 w-3" />

                                    Manager Access

                                </span>

                            </div>

                        </div>

                        {/* Hero metrics */}

                        <div className="flex items-center gap-5">

                            <div>

                                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                                    Total
                                </p>

                                <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                                    {loading
                                        ? "—"
                                        : totalCases}
                                </p>

                            </div>

                            <div className="h-9 w-px bg-white/10" />

                            <div>

                                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                                    Active
                                </p>

                                <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-blue-300">
                                    {loading
                                        ? "—"
                                        : activeCases}
                                </p>

                            </div>

                            <div className="h-9 w-px bg-white/10" />

                            <div>

                                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                                    Completed
                                </p>

                                <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-emerald-300">
                                    {loading
                                        ? "—"
                                        : completedCases}
                                </p>

                            </div>

                        </div>

                    </div>
                </section>

                {/* =================================================
                    PERFORMANCE OVERVIEW
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

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                        <DashboardCard
                            title="Assigned Cases"
                            value={totalCases}
                            caption="Cases within your scope"
                            icon={ClipboardList}
                            accent="blue"
                            loading={loading}
                        />

                        <DashboardCard
                            title="Active Cases"
                            value={activeCases}
                            caption="Cases requiring attention"
                            icon={BarChart3}
                            accent="amber"
                            loading={loading}
                        />

                        <DashboardCard
                            title="Completed"
                            value={completedCases}
                            caption="Resolved or closed"
                            icon={ShieldCheck}
                            accent="green"
                            loading={loading}
                        />

                    </div>

                </section>

                {/* =================================================
                    CASE TABLE
                ================================================= */}

                <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,35,65,0.045)]">

                    {/* Section header */}

                    <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">

                        <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                                <ClipboardList className="h-4 w-4" />

                            </div>

                            <div>

                                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
                                    Case Management
                                </p>

                                <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                                    Recent Scope Cases
                                </h2>

                            </div>

                        </div>

                        <div className="flex items-center gap-3">

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                                {loading
                                    ? "Loading"
                                    : `${totalCases} cases`}
                            </span>

                        </div>

                    </div>

                    {/* Table */}

                    <CaseTable
                        rows={cases}
                        loading={loading}
                    />

                </section>

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
                                Scoped case access
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                                Cases shown here are limited to your assigned management scope.
                            </p>

                        </div>

                    </div>

                    <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-blue-600">

                        {scopeName}

                        <ArrowRight className="h-3 w-3" />

                    </div>

                </div>

            </main>

        </div>
    );
}
