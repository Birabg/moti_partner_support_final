import { useEffect, useState } from "react";
import {
    Building2,
    Users,
    RefreshCw,
    Network,
} from "lucide-react";

import { managerApi } from "../../api/managerApi";
import { useAuth } from "../../context/useAuth";

import ManagerHeader from "../../components/manager/ManagerHeader";
import OrganizationTree from "../../components/manager/OrganizationTree";

import { Card, CardContent } from "../../components/ui/card";


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
        <div className="min-h-full bg-slate-50/60 pb-10">

            <div className="space-y-6">


                {/* =================================================
                    PAGE HEADER
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
                            pointer-events-none
                            absolute
                            bottom-0
                            right-1/4
                            h-24
                            w-24
                            rounded-full
                            bg-slate-100
                            blur-2xl
                        "
                    />


                    <div
                        className="
                            relative
                            flex
                            flex-col
                            gap-6
                            xl:flex-row
                            xl:items-center
                            xl:justify-between
                        "
                    >

                        {/* LEFT */}

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

                                <Network
                                    size={13}
                                    className="text-blue-600"
                                    strokeWidth={2.5}
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
                                    Organization
                                </span>

                            </div>


                            <h1
                                className="
                                    text-2xl
                                    font-bold
                                    tracking-[-0.025em]
                                    text-slate-950
                                    sm:text-3xl
                                    lg:text-[34px]
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
                                    text-slate-500
                                "
                            >
                                View your management scope and
                                organizational structure from one
                                centralized workspace.
                            </p>

                        </div>


                        {/* RIGHT */}

                        <div
                            className="
                                relative
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
                                    <Building2 size={17} />
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
                                        loading ||
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
                            px-5
                            py-4
                            text-sm
                            text-red-700
                        "
                    >
                        {error}
                    </div>
                )}


                {/* =================================================
                    OVERVIEW
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
                                Management scope
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
                            Current organization
                        </span>

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
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-5
                                shadow-[0_1px_3px_rgba(15,23,42,0.04)]
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-start
                                    justify-between
                                    gap-4
                                "
                            >

                                <div>

                                    <p
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.14em]
                                            text-slate-400
                                        "
                                    >
                                        Current Scope
                                    </p>


                                    {loading ? (

                                        <div
                                            className="
                                                mt-3
                                                h-7
                                                w-32
                                                animate-pulse
                                                rounded-md
                                                bg-slate-100
                                            "
                                        />

                                    ) : (

                                        <p
                                            className="
                                                mt-2
                                                text-xl
                                                font-bold
                                                tracking-[-0.025em]
                                                text-slate-900
                                            "
                                        >
                                            {scopeName}
                                        </p>

                                    )}


                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            text-slate-400
                                        "
                                    >
                                        Your assigned management scope
                                    </p>

                                </div>


                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-blue-50
                                        text-blue-600
                                    "
                                >
                                    <Building2 size={17} />
                                </div>

                            </div>

                        </div>


                        {/* Staff Card */}

                        <div
                            className="
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-5
                                shadow-[0_1px_3px_rgba(15,23,42,0.04)]
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-start
                                    justify-between
                                    gap-4
                                "
                            >

                                <div>

                                    <p
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.14em]
                                            text-slate-400
                                        "
                                    >
                                        Staff Members
                                    </p>


                                    {loading ? (

                                        <div
                                            className="
                                                mt-3
                                                h-7
                                                w-20
                                                animate-pulse
                                                rounded-md
                                                bg-slate-100
                                            "
                                        />

                                    ) : (

                                        <p
                                            className="
                                                mt-2
                                                text-xl
                                                font-bold
                                                tracking-[-0.025em]
                                                text-slate-900
                                            "
                                        >
                                            {staffCount.toLocaleString()}
                                        </p>

                                    )}


                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            text-slate-400
                                        "
                                    >
                                        Staff visible within your scope
                                    </p>

                                </div>


                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-emerald-50
                                        text-emerald-600
                                    "
                                >
                                    <Users size={17} />
                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ORGANIZATION TREE
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
                                Structure
                            </p>


                            <h2
                                className="
                                    mt-1
                                    text-base
                                    font-bold
                                    text-slate-900
                                "
                            >
                                Organization hierarchy
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
                            Current reporting structure
                        </span>

                    </div>


                    <Card
                        className="
                            overflow-hidden
                            rounded-2xl
                            border-slate-200
                            shadow-[0_1px_3px_rgba(15,23,42,0.04)]
                        "
                    >

                        <CardContent className="p-0">

                            <div
                                className="
                                    border-b
                                    border-slate-100
                                    px-5
                                    py-4
                                    sm:px-6
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
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
                                            bg-slate-100
                                            text-slate-600
                                        "
                                    >
                                        <Network size={16} />
                                    </div>


                                    <div>

                                        <h3
                                            className="
                                                text-sm
                                                font-bold
                                                text-slate-900
                                            "
                                        >
                                            Organization Tree
                                        </h3>


                                        <p
                                            className="
                                                mt-0.5
                                                text-xs
                                                text-slate-400
                                            "
                                        >
                                            Department, division and
                                            section hierarchy
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="p-5 sm:p-6">

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

                        </CardContent>

                    </Card>

                </section>

            </div>

        </div>
    );
}