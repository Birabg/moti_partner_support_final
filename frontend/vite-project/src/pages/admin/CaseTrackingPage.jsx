import { useEffect, useState } from "react";

import {
    RefreshCw,
    BriefcaseBusiness,
    SlidersHorizontal,
    ArrowUpDown,
    Activity,
    ChevronRight,
    AlertCircle,
} from "lucide-react";

import { getAllCases } from "../../api/caseApi";

import CaseStats from "../../components/cases/CaseStats";
import CaseFilters from "../../components/cases/CaseFilters";
import CaseTable from "../../components/cases/CaseTable";
import CaseDetailsDrawer from "../../components/cases/CaseDetailsDrawer";

import AssignStaffModal from "../../components/cases/AssignStaffModal";
import ChangePriorityModal from "../../components/cases/ChangePriorityModal";
import ResolveCaseModal from "../../components/cases/ResolveCaseModal";
import ReassignStaffModal from "../../components/cases/ReassignStaffModal";

import Pagination from "../../components/cases/Pagination";
import CaseSorting from "../../components/cases/CaseSorting";
import CaseToolbar from "../../components/cases/CaseToolbar";

export default function CaseTrackingPage() {

    const [cases, setCases] = useState([]);
    const [filteredCases, setFilteredCases] = useState([]);

    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [selectedCase, setSelectedCase] = useState(null);

    const [details, setDetails] = useState(false);
    const [assign, setAssign] = useState(false);
    const [priority, setPriority] = useState(false);
    const [showResolve, setShowResolve] = useState(false);
    const [showReassign, setShowReassign] = useState(false);

    const [sortBy, setSortBy] = useState("createdAt");
    const [order, setOrder] = useState("desc");

    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    /* =========================================================
       LOAD CASES
    ========================================================= */

    const loadCases = async () => {

        try {

            setLoading(true);

            const response = await getAllCases(
                page,
                limit,
                sortBy,
                order
            );

            const casesData =
                response?.data?.data || [];

            const paginationData =
                response?.data?.pagination || {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 1,
                };

            setCases(casesData);
            setFilteredCases(casesData);
            setPagination(paginationData);

        } catch (error) {

            console.error(
                "Loading cases failed:",
                error
            );

            setCases([]);
            setFilteredCases([]);

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        loadCases();

    }, [page, sortBy, order]);


    /* =========================================================
       REFRESH
    ========================================================= */

    const handleRefresh = async () => {

        try {

            setIsRefreshing(true);

            await loadCases();

        } finally {

            setIsRefreshing(false);

        }
    };


    /* =========================================================
       FILTER
    ========================================================= */

    const filterCases = ({
        search = "",
        status = "ALL",
    }) => {

        let result = [...cases];

        const normalizedSearch =
            search.trim().toLowerCase();

        if (normalizedSearch) {

            result = result.filter((item) => {

                const searchableText = `
                    ${item.caseNumber || ""}
                    ${item.subject || ""}
                    ${item.customer?.firstName || ""}
                    ${item.customer?.lastName || ""}
                    ${item.customer?.email || ""}
                `;

                return searchableText
                    .toLowerCase()
                    .includes(normalizedSearch);

            });

        }

        if (
            status &&
            status !== "ALL"
        ) {

            result = result.filter(
                (item) =>
                    item.status === status
            );

        }

        setFilteredCases(result);
    };


    /* =========================================================
       SORT
    ========================================================= */

    const handleSorting = (
        field,
        direction
    ) => {

        setSortBy(field);
        setOrder(direction);
        setPage(1);

    };


    /* =========================================================
       CLOSE MODALS
    ========================================================= */

    const closeAllModals = () => {

        setDetails(false);
        setAssign(false);
        setPriority(false);
        setShowResolve(false);
        setShowReassign(false);
        setSelectedCase(null);

    };


    /* =========================================================
       REFRESH AFTER ACTION
    ========================================================= */

    const refreshAfterAction = async () => {

        await loadCases();

        window.dispatchEvent(
            new CustomEvent("cases:updated")
        );

    };


    return (

        <div className="min-h-full bg-[#f8fafc] pb-10">

            <div className="mx-auto max-w-[1600px] space-y-7">

                {/* =================================================
                    HERO
                ================================================= */}

                <section
                    className="
                        relative
                        overflow-hidden
                        rounded-[24px]
                        bg-[#0b1b33]
                        text-white
                        shadow-[0_18px_50px_rgba(11,27,51,0.12)]
                    "
                >

                    {/* Background glow */}

                    <div
                        className="
                            pointer-events-none
                            absolute
                            -right-32
                            -top-40
                            h-[430px]
                            w-[430px]
                            rounded-full
                            bg-[#416da8]/20
                            blur-[95px]
                        "
                    />

                    <div
                        className="
                            pointer-events-none
                            absolute
                            -bottom-48
                            left-1/3
                            h-[380px]
                            w-[380px]
                            rounded-full
                            bg-[#658abd]/10
                            blur-[100px]
                        "
                    />

                    {/* Grid */}

                    <div
                        className="
                            pointer-events-none
                            absolute
                            inset-0
                            opacity-[0.045]
                            [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
                            [background-size:36px_36px]
                        "
                    />

                    <div
                        className="
                            relative
                            z-10
                            px-6
                            py-8
                            sm:px-9
                            sm:py-10
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-8
                                lg:flex-row
                                lg:items-end
                                lg:justify-between
                            "
                        >

                            {/* LEFT */}

                            <div className="max-w-2xl">

                                <div
                                    className="
                                        mb-5
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <span
                                        className="
                                            h-1.5
                                            w-1.5
                                            rounded-full
                                            bg-emerald-400
                                            shadow-[0_0_12px_rgba(52,211,153,.8)]
                                        "
                                    />

                                    <span
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.22em]
                                            text-white/40
                                        "
                                    >
                                        Support Operations
                                    </span>

                                </div>

                                <h1
                                    className="
                                        text-3xl
                                        font-bold
                                        tracking-[-0.045em]
                                        sm:text-4xl
                                    "
                                >
                                    Case Tracking
                                </h1>

                                <p
                                    className="
                                        mt-3
                                        max-w-xl
                                        text-sm
                                        leading-6
                                        text-white/45
                                    "
                                >
                                    Monitor, assign, prioritize,
                                    and resolve customer support
                                    cases from one centralized
                                    workspace.
                                </p>

                            </div>


                            {/* RIGHT */}

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-3
                                    sm:flex-row
                                    sm:items-center
                                "
                            >

                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-white/[0.055]
                                        px-5
                                        py-3
                                        backdrop-blur-md
                                    "
                                >

                                    <p
                                        className="
                                            text-[9px]
                                            font-bold
                                            uppercase
                                            tracking-[0.16em]
                                            text-white/30
                                        "
                                    >
                                        Total Cases
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            text-xl
                                            font-bold
                                            tracking-[-0.03em]
                                        "
                                    >
                                        {pagination.total || 0}
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={handleRefresh}
                                    disabled={
                                        loading ||
                                        isRefreshing
                                    }
                                    className="
                                        inline-flex
                                        h-[48px]
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-white/[0.07]
                                        px-5
                                        text-xs
                                        font-bold
                                        text-white
                                        transition
                                        hover:bg-white/[0.12]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >

                                    <RefreshCw
                                        size={14}
                                        className={
                                            loading ||
                                            isRefreshing
                                                ? "animate-spin"
                                                : ""
                                        }
                                    />

                                    Refresh

                                </button>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <section
                    className="
                        rounded-[20px]
                        border
                        border-slate-200/80
                        bg-white
                        p-2
                        shadow-[0_8px_30px_rgba(16,32,55,0.035)]
                    "
                >

                    <CaseToolbar
                        refresh={handleRefresh}
                        cases={cases}
                    />

                </section>


                {/* =================================================
                    OVERVIEW
                ================================================= */}

                <section>

                    <div
                        className="
                            mb-4
                            flex
                            items-end
                            justify-between
                        "
                    >

                        <div>

                            <p
                                className="
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.18em]
                                    text-[#567fbd]
                                "
                            >
                                Operations
                            </p>

                            <h2
                                className="
                                    mt-1
                                    text-lg
                                    font-bold
                                    tracking-[-0.025em]
                                    text-[#101a28]
                                "
                            >
                                Case activity
                            </h2>

                        </div>

                        <div
                            className="
                                hidden
                                items-center
                                gap-2
                                text-[10px]
                                text-slate-400
                                sm:flex
                            "
                        >

                            <span
                                className="
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    bg-emerald-400
                                "
                            />

                            Live overview

                        </div>

                    </div>


                    {loading ? (

                        <StatsSkeleton />

                    ) : (

                        <CaseStats cases={cases} />

                    )}

                </section>


                {/* =================================================
                    FILTERS
                ================================================= */}

                <section
                    className="
                        overflow-hidden
                        rounded-[22px]
                        border
                        border-slate-200/80
                        bg-white
                        shadow-[0_8px_30px_rgba(16,32,55,0.04)]
                    "
                >

                    {/* HEADER */}

                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            border-b
                            border-slate-100
                            px-5
                            py-5
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
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
                                    bg-[#edf4fd]
                                    text-[#527eb9]
                                "
                            >

                                <SlidersHorizontal
                                    size={15}
                                />

                            </div>

                            <div>

                                <p
                                    className="
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-[0.16em]
                                        text-slate-400
                                    "
                                >
                                    Case registry
                                </p>

                                <h2
                                    className="
                                        mt-0.5
                                        text-sm
                                        font-bold
                                        text-[#101a28]
                                    "
                                >
                                    Find and organize cases
                                </h2>

                            </div>

                        </div>


                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                self-start
                                rounded-xl
                                bg-slate-50
                                px-3
                                py-2
                                sm:self-auto
                            "
                        >

                            <span
                                className="
                                    text-[10px]
                                    font-medium
                                    text-slate-400
                                "
                            >
                                Showing
                            </span>

                            <span
                                className="
                                    text-xs
                                    font-bold
                                    text-slate-700
                                "
                            >
                                {filteredCases.length}
                            </span>

                        </div>

                    </div>


                    {/* CONTROLS */}

                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            p-4
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        "
                    >

                        <div className="min-w-0 flex-1">

                            <CaseFilters
                                onFilter={filterCases}
                            />

                        </div>


                        <div
                            className="
                                flex
                                shrink-0
                                items-center
                                gap-3
                                border-t
                                border-slate-100
                                pt-4
                                lg:border-l
                                lg:border-t-0
                                lg:pl-5
                                lg:pt-0
                            "
                        >

                            <div
                                className="
                                    hidden
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-slate-50
                                    text-slate-400
                                    xl:flex
                                "
                            >

                                <ArrowUpDown size={14} />

                            </div>

                            <div>

                                <span
                                    className="
                                        mb-1
                                        block
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-[0.15em]
                                        text-slate-400
                                    "
                                >
                                    Sort cases
                                </span>

                                <CaseSorting
                                    sortBy={sortBy}
                                    order={order}
                                    onSortChange={
                                        handleSorting
                                    }
                                />

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    CASE LIST
                ================================================= */}

                <section>

                    <div
                        className="
                            mb-4
                            flex
                            items-end
                            justify-between
                        "
                    >

                        <div>

                            <p
                                className="
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.18em]
                                    text-[#567fbd]
                                "
                            >
                                Case registry
                            </p>

                            <h2
                                className="
                                    mt-1
                                    text-lg
                                    font-bold
                                    tracking-[-0.025em]
                                    text-[#101a28]
                                "
                            >
                                Support cases
                            </h2>

                        </div>


                        {!loading && (

                            <span
                                className="
                                    text-[10px]
                                    font-medium
                                    text-slate-400
                                "
                            >
                                Page {pagination.page} of{" "}
                                {pagination.totalPages}
                            </span>

                        )}

                    </div>


                    {loading ? (

                        <CaseTableSkeleton />

                    ) : (

                        <div
                            className="
                                overflow-hidden
                                rounded-[22px]
                                border
                                border-slate-200/80
                                bg-white
                                shadow-[0_8px_30px_rgba(16,32,55,0.04)]
                            "
                        >

                            <CaseTable
                                cases={filteredCases}

                                onView={(item) => {
                                    setSelectedCase(item);
                                    setDetails(true);
                                }}

                                onAssign={(item) => {
                                    setSelectedCase(item);
                                    setAssign(true);
                                }}

                                onResolve={(item) => {
                                    setSelectedCase(item);
                                    setShowResolve(true);
                                }}

                                onReassign={(item) => {
                                    setSelectedCase(item);
                                    setShowReassign(true);
                                }}

                                onPriority={(item) => {
                                    setSelectedCase(item);
                                    setPriority(true);
                                }}
                            />

                        </div>

                    )}

                </section>


                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {!loading &&
                    filteredCases.length === 0 && (

                        <div
                            className="
                                rounded-[22px]
                                border
                                border-slate-200
                                bg-white
                                px-6
                                py-14
                                text-center
                            "
                        >

                            <div
                                className="
                                    mx-auto
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-slate-50
                                    text-slate-300
                                "
                            >

                                <AlertCircle size={20} />

                            </div>

                            <h3
                                className="
                                    mt-4
                                    text-sm
                                    font-bold
                                    text-slate-700
                                "
                            >
                                No cases found
                            </h3>

                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-slate-400
                                "
                            >
                                Try changing your search or
                                filter criteria.
                            </p>

                        </div>

                    )}


                {/* =================================================
                    PAGINATION
                ================================================= */}

                {!loading &&
                    pagination.totalPages > 1 && (

                        <section
                            className="
                                flex
                                items-center
                                justify-center
                                rounded-[20px]
                                border
                                border-slate-200
                                bg-white
                                px-4
                                py-3
                            "
                        >

                            <Pagination
                                page={pagination.page}
                                totalPages={
                                    pagination.totalPages
                                }
                                onPageChange={setPage}
                            />

                        </section>

                    )}


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    className="
                        flex
                        flex-col
                        gap-3
                        border-t
                        border-slate-200/80
                        pt-5
                        text-[10px]
                        text-slate-400
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <BriefcaseBusiness
                            size={13}
                            className="text-[#567fbd]"
                        />

                        MOTI Partner Support Platform

                    </div>

                    <div>
                        Support case management workspace
                    </div>

                </div>

            </div>


            {/* =====================================================
                DETAILS
            ===================================================== */}

            {details && (

                <CaseDetailsDrawer
                    caseData={selectedCase}
                    close={closeAllModals}
                />

            )}


            {/* =====================================================
                ASSIGN
            ===================================================== */}

            {assign && (

                <AssignStaffModal
                    caseData={selectedCase}
                    refresh={refreshAfterAction}
                    close={closeAllModals}
                />

            )}


            {/* =====================================================
                RESOLVE
            ===================================================== */}

            {showResolve && (

                <ResolveCaseModal
                    caseData={selectedCase}
                    refresh={refreshAfterAction}
                    close={closeAllModals}
                />

            )}


            {/* =====================================================
                REASSIGN
            ===================================================== */}

            {showReassign && (

                <ReassignStaffModal
                    caseData={selectedCase}
                    refresh={refreshAfterAction}
                    close={closeAllModals}
                />

            )}


            {/* =====================================================
                PRIORITY
            ===================================================== */}

            {priority && (

                <ChangePriorityModal
                    caseData={selectedCase}
                    refresh={refreshAfterAction}
                    close={closeAllModals}
                />

            )}

        </div>
    );
}


/* ================================================================
   STATS SKELETON
================================================================ */

function StatsSkeleton() {

    return (

        <div
            className="
                grid
                gap-4
                sm:grid-cols-2
                xl:grid-cols-4
            "
        >

            {Array.from({
                length: 4,
            }).map((_, index) => (

                <div
                    key={index}
                    className="
                        h-[145px]
                        animate-pulse
                        rounded-[20px]
                        border
                        border-slate-200
                        bg-white
                    "
                />

            ))}

        </div>

    );
}


/* ================================================================
   TABLE SKELETON
================================================================ */

function CaseTableSkeleton() {

    return (

        <div
            className="
                overflow-hidden
                rounded-[22px]
                border
                border-slate-200
                bg-white
            "
        >

            {/* TOP */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-slate-100
                    px-5
                    py-5
                "
            >

                <div>

                    <div
                        className="
                            h-4
                            w-36
                            animate-pulse
                            rounded-md
                            bg-slate-200
                        "
                    />

                    <div
                        className="
                            mt-2
                            h-3
                            w-52
                            animate-pulse
                            rounded-md
                            bg-slate-100
                        "
                    />

                </div>

                <div
                    className="
                        h-8
                        w-24
                        animate-pulse
                        rounded-xl
                        bg-slate-100
                    "
                />

            </div>


            {/* HEADER */}

            <div
                className="
                    hidden
                    grid-cols-7
                    gap-4
                    border-b
                    border-slate-100
                    bg-slate-50/70
                    px-5
                    py-4
                    md:grid
                "
            >

                {Array.from({
                    length: 7,
                }).map((_, index) => (

                    <div
                        key={index}
                        className="
                            h-3
                            animate-pulse
                            rounded-md
                            bg-slate-200
                        "
                    />

                ))}

            </div>


            {/* ROWS */}

            {Array.from({
                length: 6,
            }).map((_, rowIndex) => (

                <div
                    key={rowIndex}
                    className="
                        border-b
                        border-slate-100
                        px-5
                        py-5
                        last:border-b-0
                    "
                >

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            md:grid-cols-7
                            md:items-center
                        "
                    >

                        {Array.from({
                            length: 7,
                        }).map((_, columnIndex) => (

                            <div
                                key={columnIndex}
                                className={`
                                    h-4
                                    animate-pulse
                                    rounded-md
                                    bg-slate-100
                                    ${
                                        columnIndex === 0
                                            ? "w-28"
                                            : columnIndex === 1
                                            ? "w-full"
                                            : "w-20"
                                    }
                                `}
                            />

                        ))}

                    </div>

                </div>

            ))}


            {/* BOTTOM */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-t
                    border-slate-100
                    bg-slate-50/50
                    px-5
                    py-4
                "
            >

                <div
                    className="
                        h-3
                        w-24
                        animate-pulse
                        rounded-md
                        bg-slate-100
                    "
                />

                <div
                    className="
                        h-8
                        w-36
                        animate-pulse
                        rounded-xl
                        bg-slate-100
                    "
                />

            </div>

        </div>

    );
}