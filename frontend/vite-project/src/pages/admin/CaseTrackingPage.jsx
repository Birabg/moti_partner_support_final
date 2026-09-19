import {
    useEffect,
    useState,
} from "react";

import { useAuth } from "../../context/useAuth";

import {
    getAllCases,
} from "../../api/caseApi";


import CaseStats from "../../components/cases/CaseStats";
import CaseFilters from "../../components/cases/CaseFilters";
import CaseTable from "../../components/cases/CaseTable";
import CaseDetailsDrawer from "../../components/cases/CaseDetailsDrawer";

import AssignStaffModal from "../../components/cases/AssignStaffModal";
import ChangePriorityModal from "../../components/cases/ChangePriorityModal";
import ResolveCaseModal from "../../components/cases/ResolveCaseModal";
import ReassignStaffModal from "../../components/cases/ReassignStaffModal";
import CancelCaseModal from "../../components/cases/CancelCaseModal";
import EscalateModal from "../../components/cases/EscalateModal";
import CloseCaseModal from "../../components/cases/CloseCaseModal";

import Pagination from "../../components/cases/Pagination";
import CaseSorting from "../../components/cases/CaseSorting";

import {
    RefreshCw,
    FileText,
} from "lucide-react";

import AdminPageHero from "../../components/admin/AdminPageHero";


// ============================================================
// PAGE
// ============================================================

export default function CaseTrackingPage() {

    const { user } = useAuth();


    // ============================================================
    // CASE DATA
    // ============================================================

    const [cases, setCases] = useState([]);

    const [filteredCases, setFilteredCases] = useState([]);


    const [loading, setLoading] = useState(false);


    // ============================================================
    // SELECTED CASE
    // ============================================================

    const [selectedCase, setSelectedCase] = useState(null);


    // ============================================================
    // MODALS / DRAWERS
    // ============================================================

    const [details, setDetails] = useState(false);

    const [assign, setAssign] = useState(false);

    const [priority, setPriority] = useState(false);

    const [showResolve, setShowResolve] = useState(false);

    const [showReassign, setShowReassign] = useState(false);

    const [showCancel, setShowCancel] = useState(false);

    const [showEscalate, setShowEscalate] = useState(false);

    const [showClose, setShowClose] = useState(false);


    // ============================================================
    // SORTING
    // ============================================================

    const [sortBy, setSortBy] = useState("createdAt");

    const [order, setOrder] = useState("desc");


    // ============================================================
    // PAGINATION
    // ============================================================

    const [page, setPage] = useState(1);

    const [limit] = useState(10);


    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });


    // ============================================================
    // REFRESH EVENT
    // ============================================================

    const notifyCaseDashboardRefresh = () => {

        window.dispatchEvent(
            new CustomEvent("cases:updated")
        );

    };


    // ============================================================
    // LOAD CASES
    // ============================================================

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

        }

        catch (error) {

            console.error(
                "Loading cases failed:",
                error
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ============================================================
    // LOAD CASES + AUTO REFRESH
    // ============================================================

    useEffect(() => {

        let intervalId = setInterval(() => {
            loadCases();
        }, 15000);

        loadCases();

        return () => {
            clearInterval(intervalId);
        };

    }, [
        page,
        sortBy,
        order,
    ]);


    // ============================================================
    // FILTER
    // ============================================================

    const filterCases = ({
        search,
        status,
    }) => {

        let result = [...cases];


        // SEARCH

        if (search) {

            const query =
                search.toLowerCase().trim();


            result = result.filter(
                (item) => {

                    const searchableText = `

                        ${item.caseNumber || ""}

                        ${item.subject || ""}

                        ${item.description || ""}

                        ${item.customer?.firstName || ""}

                        ${item.customer?.lastName || ""}

                        ${item.customer?.email || ""}

                        ${item.customer?.organization?.name || ""}

                    `.toLowerCase();


                    return searchableText.includes(
                        query
                    );

                }
            );

        }


        // STATUS

        if (
            status &&
            status !== "ALL"
        ) {

            result = result.filter(
                item => {

                    if (
                        status ===
                        "AWAITING_CUSTOMER_RESPONSE"
                    ) {

                        return (
                            item.status ===
                                "AWAITING_CUSTOMER_RESPONSE" ||
                            item.status ===
                                "WAITING_CUSTOMER_FEEDBACK"
                        );

                    }


                    return (
                        item.status === status
                    );

                }
            );

        }


        setFilteredCases(result);

    };


    // ============================================================
    // SORTING
    // ============================================================

    const handleSorting = (
        field,
        direction
    ) => {

        setSortBy(field);

        setOrder(direction);

        setPage(1);

    };


    // ============================================================
    // REFRESH
    // ============================================================

    const handleRefresh = async () => {

        await loadCases();

    };


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div
            className="
                min-h-screen
                space-y-6
                bg-slate-50/50
                pb-8
            "
        >


            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <AdminPageHero
                eyebrow="Case Management"
                title="All support cases"
                description="Track, filter and review every support case across the organization."
                icon={FileText}
            />



            {/* =====================================================
                CASE STATISTICS
            ===================================================== */}

            <section>

                <CaseStats
                    cases={cases}
                />

            </section>



            {/* =====================================================
                CASE HISTORY
            ===================================================== */}

            <section
                className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                "
            >


                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        border-b
                        border-slate-100
                        px-5
                        py-5
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        "
                    >

                        {/* LEFT */}

                        <div
                            className="
                                flex
                                min-w-0
                                items-start
                                gap-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-blue-50
                                    text-blue-600
                                "
                            >

                                <FileText
                                    size={17}
                                    strokeWidth={1.8}
                                />

                            </div>


                            <div>

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <span
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.14em]
                                            text-blue-600
                                        "
                                    >
                                        Case Management
                                    </span>


                                    <span
                                        className="
                                            h-1
                                            w-1
                                            rounded-full
                                            bg-slate-300
                                        "
                                    />


                                    <span
                                        className="
                                            text-[11px]
                                            font-medium
                                            text-slate-400
                                        "
                                    >
                                        {cases.length}{" "}
                                        {cases.length === 1
                                            ? "case"
                                            : "cases"}
                                    </span>

                                </div>


                                <h2
                                    className="
                                        mt-1
                                        text-base
                                        font-semibold
                                        text-slate-900
                                    "
                                >
                                    Your case history
                                </h2>


                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    Review previously handled
                                    cases and their latest status.
                                </p>

                            </div>

                        </div>



                        {/* RIGHT — REFRESH */}

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={loading}
                            className="
                                inline-flex
                                h-9
                                shrink-0
                                items-center
                                justify-center
                                gap-2
                                self-start
                                rounded-lg
                                bg-[#17345c]
                                px-3.5
                                text-xs
                                font-semibold
                                text-white
                                shadow-sm
                                transition-all
                                duration-200
                                hover:bg-[#102949]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                                lg:self-center
                            "
                        >

                            <RefreshCw
                                size={14}
                                strokeWidth={2}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh

                        </button>

                    </div>


                    {/* =================================================
                        SEARCH + FILTER + SORT
                    ================================================= */}

                    <div
                        className="
                            mt-5
                            flex
                            flex-col
                            gap-2
                            lg:flex-row
                            lg:items-center
                        "
                    >

                        {/* GLOBAL SEARCH */}

                        <div
                            className="
                                min-w-0
                                flex-1
                            "
                        >

                            <CaseFilters
                                onFilter={
                                    filterCases
                                }
                            />

                        </div>


                        {/* SORTING */}

                        <div
                            className="
                                shrink-0
                            "
                        >

                            <CaseSorting
                                sortBy={
                                    sortBy
                                }
                                order={
                                    order
                                }
                                onSortChange={
                                    handleSorting
                                }
                            />

                        </div>

                    </div>

                </div>



                {/* =================================================
                    TABLE META
                ================================================= */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-slate-100
                        bg-slate-50/40
                        px-5
                        py-2.5
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            text-[11px]
                            font-medium
                            text-slate-400
                        "
                    >

                        <span
                            className="
                                h-1.5
                                w-1.5
                                rounded-full
                                bg-emerald-500
                            "
                        />

                        {filteredCases.length}{" "}
                        {filteredCases.length === 1
                            ? "case"
                            : "cases"}

                    </div>


                    <div
                        className="
                            text-[11px]
                            text-slate-400
                        "
                    >

                        {filteredCases.length} of{" "}
                        {cases.length} shown

                    </div>

                </div>



                {/* =================================================
                    TABLE
                ================================================= */}

                <div>

                    {loading ? (

                        <div
                            className="
                                flex
                                min-h-[320px]
                                items-center
                                justify-center
                                text-sm
                                text-slate-400
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <RefreshCw
                                    size={15}
                                    className="animate-spin"
                                />

                                Loading cases...

                            </div>

                        </div>

                    ) : (

                        <CaseTable
                            cases={
                                filteredCases
                            }

                            permissions={
                                user?.permissions ||
                                []
                            }

                            onView={(item) => {

                                setSelectedCase(
                                    item
                                );

                                setDetails(
                                    true
                                );

                            }}

                            onAssign={(item) => {

                                setSelectedCase(
                                    item
                                );

                                setAssign(
                                    true
                                );

                            }}

                            onResolve={(item) => {

                                setSelectedCase(
                                    item
                                );

                                setShowResolve(
                                    true
                                );

                            }}

                            onReassign={(item) => {

                                setSelectedCase(
                                    item
                                );

                                setShowReassign(
                                    true
                                );

                            }}

                            onPriority={(item) => {

                                setSelectedCase(
                                    item
                                );

                                setPriority(
                                    true
                                );

                            }}

                            onCancel={(item) => {

                                setSelectedCase(
                                    item
                                );

                                setShowCancel(
                                    true
                                );

                            }}

                            onEscalate={(item) => {

                                setSelectedCase(
                                    item
                                );

                                setShowEscalate(
                                    true
                                );

                            }}

                            onClose={(item) => {

                                setSelectedCase(
                                    item
                                );

                                setShowClose(
                                    true
                                );

                            }}

                        />

                    )}

                </div>



                {/* =================================================
                    PAGINATION
                ================================================= */}

                <div
                    className="
                        border-t
                        border-slate-100
                        px-5
                        py-3
                    "
                >

                    <Pagination
                        page={
                            pagination.page
                        }

                        totalPages={
                            pagination.totalPages
                        }

                        onPageChange={
                            setPage
                        }
                    />

                </div>

            </section>



            {/* =====================================================
                DETAILS DRAWER
            ===================================================== */}

            {details && (

                <CaseDetailsDrawer
                    caseData={
                        selectedCase
                    }

                    close={() =>
                        setDetails(false)
                    }
                />

            )}



            {/* =====================================================
                ASSIGN
            ===================================================== */}

            {assign && (

                <AssignStaffModal
                    caseData={
                        selectedCase
                    }

                    refresh={async () => {

                        await loadCases();

                        notifyCaseDashboardRefresh();

                    }}

                    close={() =>
                        setAssign(false)
                    }
                />

            )}



            {/* =====================================================
                RESOLVE
            ===================================================== */}

            {showResolve && (

                <ResolveCaseModal
                    caseData={
                        selectedCase
                    }

                    refresh={async () => {

                        await loadCases();

                        notifyCaseDashboardRefresh();

                    }}

                    close={() =>
                        setShowResolve(false)
                    }
                />

            )}



            {/* =====================================================
                REASSIGN
            ===================================================== */}

            {showReassign && (

                <ReassignStaffModal
                    caseData={
                        selectedCase
                    }

                    refresh={async () => {

                        await loadCases();

                        notifyCaseDashboardRefresh();

                    }}

                    close={() =>
                        setShowReassign(false)
                    }
                />

            )}



            {/* =====================================================
                PRIORITY
            ===================================================== */}

            {priority && (

                <ChangePriorityModal
                    caseData={
                        selectedCase
                    }

                    refresh={async () => {

                        await loadCases();

                        notifyCaseDashboardRefresh();

                    }}

                    close={() =>
                        setPriority(false)
                    }
                />

            )}

            {/* =====================================================
                CANCEL
            ===================================================== */}

            {showCancel && (

                <CancelCaseModal
                    caseData={
                        selectedCase
                    }

                    refresh={async () => {

                        await loadCases();

                        notifyCaseDashboardRefresh();

                    }}

                    close={() =>
                        setShowCancel(false)
                    }
                />

            )}

            {/* =====================================================
                ESCALATE
            ===================================================== */}

            {showEscalate && (

                <EscalateModal
                    caseData={
                        selectedCase
                    }

                    refresh={async () => {

                        await loadCases();

                        notifyCaseDashboardRefresh();

                    }}

                    close={() =>
                        setShowEscalate(false)
                    }
                />

            )}

            {/* =====================================================
                CLOSE
            ===================================================== */}

            {showClose && (

                <CloseCaseModal
                    caseData={
                        selectedCase
                    }

                    refresh={async () => {

                        await loadCases();

                        notifyCaseDashboardRefresh();

                    }}

                    close={() =>
                        setShowClose(false)
                    }
                />

            )}

        </div>

    );

}
