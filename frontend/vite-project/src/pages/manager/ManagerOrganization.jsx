import { useEffect, useState } from "react";
import {
    AlertTriangle,
    ArrowUpRight,
    Building2,
    Network,
    RefreshCw,
    ShieldCheck,
    Users,
} from "lucide-react";

import { managerApi } from "../../api/managerApi";
import { useAuth } from "../../context/useAuth";

import OrganizationTree from "../../components/manager/OrganizationTree";


export default function ManagerOrganization() {

    const { user } = useAuth();

    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");


    // =====================================================
    // LOAD ORGANIZATION
    // =====================================================

    const loadOrganization = async () => {

        try {

            setError("");

            const response =
                await managerApi.getScopeOverview();

            setSnapshot(
                response?.data?.data || null
            );

        } catch (caughtError) {

            console.error(
                "Manager organization load error:",
                caughtError
            );

            setError(
                "Unable to load organization information."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadOrganization();

    }, []);


    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = async () => {

        try {

            setRefreshing(true);

            await loadOrganization();

        } finally {

            setRefreshing(false);

        }
    };


    // =====================================================
    // DATA
    // =====================================================

    const scope =
        snapshot?.department ||
        snapshot?.division ||
        snapshot?.section ||
        {};

    const hierarchy =
        snapshot?.hierarchyMetrics || {};


    const scopeName =
        scope?.name ||
        "Organization Overview";


    const staffCount =
        hierarchy?.totalSectionStaffCount ??
        hierarchy?.totalDivisionStaffCount ??
        hierarchy?.totalDepartmentStaffCount ??
        0;


    return (
        <div className="min-h-full bg-slate-50/70">

            <main className="ps-container space-y-7 pb-12">


                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <section
                    className="
                        relative
                        overflow-hidden
                        rounded-[26px]
                        bg-[#0b1d38]
                        shadow-[0_16px_40px_rgba(15,35,65,0.10)]
                    "
                >

                    <div
                        className="
                            absolute
                            inset-0
                            opacity-[0.07]
                        "
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                            backgroundSize:
                                "32px 32px",
                        }}
                    />

                    <div
                        className="
                            absolute
                            -right-24
                            -top-24
                            h-72
                            w-72
                            rounded-full
                            bg-blue-400/10
                            blur-3xl
                        "
                    />

                    <div
                        className="
                            absolute
                            -bottom-32
                            left-1/3
                            h-64
                            w-64
                            rounded-full
                            bg-indigo-400/10
                            blur-3xl
                        "
                    />

                    <div
                        className="
                            relative
                            flex
                            flex-col
                            gap-7
                            px-6
                            py-7
                            sm:px-8
                            sm:py-8
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        "
                    >

                        <div>

                            <div
                                className="
                                    mb-3
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                <span
                                    className="
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-[0.2em]
                                        text-slate-400
                                    "
                                >
                                    Organization Workspace
                                </span>

                            </div>

                            <h1
                                className="
                                    text-2xl
                                    font-semibold
                                    tracking-[-0.035em]
                                    text-white
                                    sm:text-3xl
                                "
                            >
                                Organization Structure
                            </h1>

                            <p
                                className="
                                    mt-2
                                    max-w-2xl
                                    text-sm
                                    leading-6
                                    text-slate-400
                                "
                            >
                                View your management scope and
                                organizational structure from one
                                centralized workspace.
                            </p>

                            <div
                                className="
                                    mt-4
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                "
                            >

                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        border
                                        border-white/10
                                        bg-white/[0.07]
                                        px-2.5
                                        py-1
                                        text-[10px]
                                        font-medium
                                        text-slate-300
                                    "
                                >

                                    <Building2 className="h-3 w-3" />

                                    {scopeName}

                                </span>

                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        border
                                        border-white/10
                                        bg-white/[0.07]
                                        px-2.5
                                        py-1
                                        text-[10px]
                                        font-medium
                                        text-slate-300
                                    "
                                >

                                    <Users className="h-3 w-3" />

                                    {staffCount} staff

                                </span>

                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        border
                                        border-white/10
                                        bg-white/[0.07]
                                        px-2.5
                                        py-1
                                        text-[10px]
                                        font-medium
                                        text-slate-300
                                    "
                                >

                                    <ShieldCheck className="h-3 w-3" />

                                    Manager Access

                                </span>

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
                                h-10
                                shrink-0
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-white
                                px-4
                                text-xs
                                font-semibold
                                text-[#0b1d38]
                                transition
                                hover:bg-slate-100
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >

                            <RefreshCw
                                className={
                                    loading ||
                                    refreshing
                                        ? "h-3.5 w-3.5 animate-spin"
                                        : "h-3.5 w-3.5"
                                }
                            />

                            Refresh

                        </button>

                    </div>

                </section>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div
                        className="
                            flex
                            items-start
                            gap-3
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50
                            px-5
                            py-4
                        "
                    >

                        <div
                            className="
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-red-100
                                text-red-600
                            "
                        >
                            <AlertTriangle className="h-4 w-4" />
                        </div>

                        <div>

                            <p className="text-xs font-semibold text-red-800">
                                Organization unavailable
                            </p>

                            <p className="mt-1 text-xs text-red-600">
                                {error}
                            </p>

                        </div>

                    </div>
                )}


                {/* =================================================
                    OVERVIEW
                ================================================= */}

                <section>

                    <div className="mb-4">

                        <p
                            className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.2em]
                                text-blue-600
                            "
                        >
                            Overview
                        </p>

                        <h2
                            className="
                                mt-1
                                text-xl
                                font-semibold
                                tracking-[-0.025em]
                                text-slate-950
                            "
                        >
                            Management scope
                        </h2>

                    </div>

                    <div
                        className="
                            grid
                            gap-4
                            sm:grid-cols-2
                        "
                    >

                        {/* Scope Card */}

                        <div
                            className="
                                group
                                rounded-[22px]
                                border
                                border-slate-200/80
                                bg-white
                                p-5
                                shadow-[0_8px_25px_rgba(15,35,65,0.045)]
                                transition
                                duration-200
                                hover:-translate-y-0.5
                                hover:shadow-[0_12px_30px_rgba(16,32,55,0.07)]
                            "
                        >

                            <div className="flex items-start justify-between">

                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-blue-50
                                        text-blue-600
                                    "
                                >
                                    <Building2 className="h-[18px] w-[18px]" />
                                </div>

                                <ArrowUpRight className="h-3.5 w-3.5 text-slate-200 transition group-hover:text-slate-400" />

                            </div>

                            <div className="mt-6">

                                <p className="text-xs font-medium text-slate-500">
                                    Current Scope
                                </p>

                                <div className="mt-1.5">

                                    {loading ? (

                                        <div className="h-9 w-32 animate-pulse rounded-md bg-slate-100" />

                                    ) : (

                                        <span
                                            className="
                                                block
                                                truncate
                                                text-2xl
                                                font-semibold
                                                tracking-[-0.04em]
                                                text-slate-950
                                            "
                                        >
                                            {scopeName}
                                        </span>

                                    )}

                                </div>

                                <p className="mt-2 text-[10px] text-slate-400">
                                    Your assigned management scope
                                </p>

                            </div>

                        </div>

                        {/* Staff Card */}

                        <div
                            className="
                                group
                                rounded-[22px]
                                border
                                border-slate-200/80
                                bg-white
                                p-5
                                shadow-[0_8px_25px_rgba(15,35,65,0.045)]
                                transition
                                duration-200
                                hover:-translate-y-0.5
                                hover:shadow-[0_12px_30px_rgba(16,32,55,0.07)]
                            "
                        >

                            <div className="flex items-start justify-between">

                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-emerald-50
                                        text-emerald-600
                                    "
                                >
                                    <Users className="h-[18px] w-[18px]" />
                                </div>

                                <ArrowUpRight className="h-3.5 w-3.5 text-slate-200 transition group-hover:text-slate-400" />

                            </div>

                            <div className="mt-6">

                                <p className="text-xs font-medium text-slate-500">
                                    Staff Members
                                </p>

                                <div className="mt-1.5">

                                    {loading ? (

                                        <div className="h-9 w-20 animate-pulse rounded-md bg-slate-100" />

                                    ) : (

                                        <span className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                                            {staffCount.toLocaleString()}
                                        </span>

                                    )}

                                </div>

                                <p className="mt-2 text-[10px] text-slate-400">
                                    Staff visible within your scope
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ORGANIZATION TREE
                ================================================= */}

                <section
                    className="
                        overflow-hidden
                        rounded-[24px]
                        border
                        border-slate-200/80
                        bg-white
                        shadow-[0_8px_30px_rgba(15,35,65,0.045)]
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            border-b
                            border-slate-100
                            px-6
                            py-5
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
                                bg-blue-50
                                text-blue-600
                            "
                        >
                            <Network className="h-4 w-4" />
                        </div>

                        <div>

                            <p
                                className="
                                    text-[9px]
                                    font-bold
                                    uppercase
                                    tracking-[0.18em]
                                    text-blue-600
                                "
                            >
                                Structure
                            </p>

                            <h2
                                className="
                                    text-lg
                                    font-semibold
                                    tracking-[-0.02em]
                                    text-slate-950
                                "
                            >
                                Organization hierarchy
                            </h2>

                        </div>

                    </div>

                    <div className="p-4 sm:p-5">

                        {loading ? (

                            <div className="space-y-4">

                                {Array.from({
                                    length: 4,
                                }).map((_, index) => (

                                    <div
                                        key={index}
                                        className="
                                            flex
                                            items-center
                                            gap-4
                                            rounded-xl
                                            border
                                            border-slate-100
                                            bg-slate-50
                                            p-4
                                        "
                                    >

                                        <div
                                            className="
                                                h-9
                                                w-9
                                                animate-pulse
                                                rounded-xl
                                                bg-slate-200
                                            "
                                        />

                                        <div className="flex-1">

                                            <div
                                                className="
                                                    h-4
                                                    w-40
                                                    animate-pulse
                                                    rounded-md
                                                    bg-slate-200
                                                "
                                            />

                                            <div
                                                className="
                                                    mt-2
                                                    h-3
                                                    w-64
                                                    animate-pulse
                                                    rounded-md
                                                    bg-slate-100
                                                "
                                            />

                                        </div>

                                    </div>

                                ))}

                            </div>

                        ) : (

                            <OrganizationTree
                                snapshot={snapshot}
                            />

                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}
