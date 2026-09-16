import { useEffect, useMemo, useState } from "react";

import {
    AlertTriangle,
    ArrowRight,
    ArrowRightLeft,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Clock3,
    RefreshCw,
    UserCheck,
    UserPlus,
    Users,
} from "lucide-react";

import Axios from "../../api/axios";
import {
    assignCase,
    reassignCase,
} from "../../api/caseApi";

import CaseDetailsDrawer from "../../components/cases/CaseDetailsDrawer";
import { useAuth } from "../../context/useAuth";
import { managerApi } from "../../api/managerApi";

export default function ManagerAssignCase() {

    const { user } = useAuth();

    const [detailCase, setDetailCase] = useState(null);
    const [snapshot, setSnapshot] = useState(null);
    const [staffList, setStaffList] = useState([]);
    const [selectedStaffByCase, setSelectedStaffByCase] =
        useState({});

    const [loading, setLoading] = useState(true);
    const [staffLoading, setStaffLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submittingCaseId, setSubmittingCaseId] =
        useState(null);

    const [error, setError] = useState("");

    /* =========================================================
       LOAD OVERVIEW
    ========================================================= */

    async function loadOverview(showRefresh = false) {

        try {

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response =
                await managerApi.getScopeOverview();

            setSnapshot(
                response?.data?.data || null
            );

        } catch (caughtError) {

            console.error(
                "Manager assignment overview error:",
                caughtError
            );

            setError(
                "Unable to load the assignment queue right now."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    }


    /* =========================================================
       LOAD SUPPORT STAFF
    ========================================================= */

    async function loadSupportStaff() {

        try {

            setStaffLoading(true);

            const response =
                await Axios.get("/staff/support");

            setStaffList(
                response?.data?.data || []
            );

        } catch (caughtError) {

            console.error(
                "Support staff load error:",
                caughtError
            );

        } finally {

            setStaffLoading(false);

        }
    }


    /* =========================================================
       INITIAL LOAD + EVENTS
    ========================================================= */

    useEffect(() => {

        let cancelled = false;

        async function initialLoad() {

            try {

                setLoading(true);
                setStaffLoading(true);
                setError("");

                const [
                    overviewResponse,
                    staffResponse,
                ] = await Promise.all([
                    managerApi.getScopeOverview(),
                    Axios.get("/staff/support"),
                ]);

                if (!cancelled) {

                    setSnapshot(
                        overviewResponse?.data?.data || null
                    );

                    setStaffList(
                        staffResponse?.data?.data || []
                    );

                }

            } catch (caughtError) {

                console.error(
                    "Manager assignment page load error:",
                    caughtError
                );

                if (!cancelled) {
                    setError(
                        "Unable to load assignment information right now."
                    );
                }

            } finally {

                if (!cancelled) {

                    setLoading(false);
                    setStaffLoading(false);

                }

            }
        }

        initialLoad();


        const handleCaseUpdated = () => {

            loadOverview();
            loadSupportStaff();

        };


        const handleFocus = () => {

            loadOverview();
            loadSupportStaff();

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
        snapshot?.caseMetrics?.cases || [];


    const queue = useMemo(() => {

        return cases
            .filter(
                (item) =>
                    ![
                        "CLOSED",
                        "RESOLVED",
                        "WAITING_CUSTOMER_FEEDBACK",
                    ].includes(
                        String(
                            item?.status || ""
                        ).toUpperCase()
                    )
            )
            .sort((a, b) => {

                const aNeedsAssignment =
                    !a.assignedSupportId &&
                    !a.assignedSupport?.id;

                const bNeedsAssignment =
                    !b.assignedSupportId &&
                    !b.assignedSupport?.id;

                return (
                    Number(bNeedsAssignment) -
                    Number(aNeedsAssignment)
                );

            });

    }, [cases]);


    const scopeName =
        snapshot?.department?.name ||
        snapshot?.division?.name ||
        snapshot?.section?.name ||
        "Current scope";


    const totalCases =
        Number(
            snapshot?.caseMetrics?.totalAssignedCases
        ) ||
        cases.length ||
        0;


    const unassignedCases =
        queue.filter(
            (item) =>
                !item.assignedSupportId &&
                !item.assignedSupport?.id
        ).length;


    const assignedCases =
        queue.length - unassignedCases;


    /* =========================================================
       ASSIGN / REASSIGN
    ========================================================= */

    const handleAssignment = async (item) => {

        const currentValue =
            selectedStaffByCase[item.id] ||
            item.assignedSupport?.id ||
            item.assignedSupportId ||
            "";


        if (!currentValue) {

            alert(
                "Please select a support staff member before routing this case."
            );

            return;

        }


        setSubmittingCaseId(item.id);


        try {

            if (
                item.assignedSupportId ||
                item.assignedSupport?.id
            ) {

                await reassignCase(
                    item.id,
                    {
                        assignedSupportId:
                            currentValue,
                    }
                );

            } else {

                await assignCase(
                    item.id,
                    {
                        assignedSupportId:
                            currentValue,
                    }
                );

            }


            setSelectedStaffByCase(
                (current) => {

                    const next = {
                        ...current,
                    };

                    delete next[item.id];

                    return next;

                }
            );


            await loadOverview();

        } catch (caughtError) {

            console.error(
                "Manager assignment action failed:",
                caughtError
            );

            alert(
                "The assignment request could not be completed for this case."
            );

        } finally {

            setSubmittingCaseId(null);

        }

    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="min-h-full bg-slate-50/60 pb-10">

            <div className="space-y-7">


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
                            pointer-events-none
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
                            pointer-events-none
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
                            pointer-events-none
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

                                <span
                                    className="
                                        h-1.5
                                        w-1.5
                                        rounded-full
                                        bg-emerald-400
                                    "
                                />

                                <span
                                    className="
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-[0.2em]
                                        text-slate-400
                                    "
                                >
                                    Manager Operations
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
                                Assign Cases
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
                                Route support cases to the
                                appropriate staff members within
                                your management scope.
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

                                    <ClipboardList
                                        className="h-3 w-3"
                                    />

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

                                    <Users
                                        className="h-3 w-3"
                                    />

                                    {staffList.length} support staff

                                </span>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() => {
                                loadOverview(true);
                                loadSupportStaff();
                            }}
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
                            <AlertTriangle
                                className="h-4 w-4"
                            />
                        </div>

                        <div>

                            <p
                                className="
                                    text-xs
                                    font-semibold
                                    text-red-800
                                "
                            >
                                Assignment queue unavailable
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-red-600
                                "
                            >
                                {error}
                            </p>

                        </div>

                    </div>
                )}


                {/* =================================================
                    SUMMARY
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
                            Assignment Overview
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
                            Case routing workload
                        </h2>

                    </div>


                    <div
                        className="
                            grid
                            gap-4
                            sm:grid-cols-2
                            xl:grid-cols-4
                        "
                    >

                        <AssignmentMetric
                            label="Assignment Queue"
                            value={queue.length}
                            description="Open and active cases"
                            icon={ClipboardList}
                            iconClass="bg-blue-50 text-blue-600"
                            loading={loading}
                        />


                        <AssignmentMetric
                            label="Needs Assignment"
                            value={unassignedCases}
                            description="Cases without an owner"
                            icon={UserPlus}
                            iconClass="bg-amber-50 text-amber-600"
                            loading={loading}
                        />


                        <AssignmentMetric
                            label="Already Assigned"
                            value={assignedCases}
                            description="Cases with active owners"
                            icon={UserCheck}
                            iconClass="bg-emerald-50 text-emerald-600"
                            loading={loading}
                        />


                        <AssignmentMetric
                            label="Visible Cases"
                            value={totalCases}
                            description="Cases in your scope"
                            icon={Users}
                            iconClass="bg-indigo-50 text-indigo-600"
                            loading={loading}
                        />

                    </div>

                </section>


                {/* =================================================
                    QUEUE
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

                    {/* Queue header */}

                    <div
                        className="
                            flex
                            flex-col
                            gap-3
                            border-b
                            border-slate-100
                            px-6
                            py-5
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
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
                                    bg-blue-50
                                    text-blue-600
                                "
                            >
                                <ArrowRightLeft
                                    className="h-4 w-4"
                                />
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
                                    Case Management
                                </p>

                                <h2
                                    className="
                                        text-lg
                                        font-semibold
                                        tracking-[-0.02em]
                                        text-slate-950
                                    "
                                >
                                    Assignment Queue
                                </h2>

                            </div>

                        </div>


                        <span
                            className="
                                w-fit
                                rounded-full
                                bg-slate-100
                                px-2.5
                                py-1
                                text-[10px]
                                font-semibold
                                text-slate-500
                            "
                        >
                            {queue.length} active cases

                        </span>

                    </div>


                    {/* Queue content */}

                    <div>

                        {loading ? (

                            <AssignmentSkeleton />

                        ) : queue.length === 0 ? (

                            <EmptyQueue />

                        ) : (

                            <div
                                className="
                                    divide-y
                                    divide-slate-100
                                "
                            >

                                {queue
                                    .slice(0, 8)
                                    .map(
                                        (
                                            item,
                                            index
                                        ) => (

                                            <AssignmentRow
                                                key={
                                                    item.id ||
                                                    `${item.caseNumber}-${index}`
                                                }
                                                item={item}
                                                staffList={
                                                    staffList
                                                }
                                                staffLoading={
                                                    staffLoading
                                                }
                                                selectedStaff={
                                                    selectedStaffByCase[
                                                        item.id
                                                    ] ||
                                                    item
                                                        .assignedSupport
                                                        ?.id ||
                                                    item.assignedSupportId ||
                                                    ""
                                                }
                                                submitting={
                                                    submittingCaseId ===
                                                    item.id
                                                }
                                                onSelectStaff={(
                                                    value
                                                ) =>
                                                    setSelectedStaffByCase(
                                                        (
                                                            current
                                                        ) => ({
                                                            ...current,
                                                            [item.id]:
                                                                value,
                                                        })
                                                    )
                                                }
                                                onView={() =>
                                                    setDetailCase(
                                                        item
                                                    )
                                                }
                                                onAssign={() =>
                                                    handleAssignment(
                                                        item
                                                    )
                                                }
                                            />

                                        )
                                    )}

                            </div>

                        )}

                    </div>

                </section>


                {/* =================================================
                    FOOTER NOTE
                ================================================= */}

                <div
                    className="
                        flex
                        flex-col
                        gap-3
                        rounded-2xl
                        border
                        border-slate-200/80
                        bg-white
                        px-5
                        py-4
                        shadow-[0_4px_18px_rgba(15,35,65,0.035)]
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
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
                                bg-emerald-50
                                text-emerald-600
                            "
                        >
                            <UserCheck
                                className="h-4 w-4"
                            />
                        </div>

                        <div>

                            <p
                                className="
                                    text-xs
                                    font-semibold
                                    text-slate-700
                                "
                            >
                                Assignment workspace
                            </p>

                            <p
                                className="
                                    mt-0.5
                                    text-[10px]
                                    text-slate-400
                                "
                            >
                                Cases are routed to support staff
                                within the available assignment pool.
                            </p>

                        </div>

                    </div>


                    <span
                        className="
                            text-[10px]
                            font-medium
                            text-slate-400
                        "
                    >
                        Showing up to 8 cases
                    </span>

                </div>


            </div>


            {detailCase && (
                <CaseDetailsDrawer
                    caseData={detailCase}
                    close={() =>
                        setDetailCase(null)
                    }
                />
            )}

        </div>
    );
}


/* ================================================================
   ASSIGNMENT METRIC
================================================================ */

function AssignmentMetric({
    label,
    value,
    description,
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
                rounded-[22px]
                border
                border-slate-200/80
                bg-white
                p-5
                shadow-[0_8px_25px_rgba(15,35,65,0.045)]
                transition
                duration-200
                hover:-translate-y-0.5
                hover:shadow-[0_12px_30px_rgba(15,35,65,0.07)]
            "
        >

            <div
                className="
                    flex
                    items-start
                    justify-between
                "
            >

                <div
                    className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        ${iconClass}
                    `}
                >
                    <Icon className="h-[18px] w-[18px]" />
                </div>


                <ChevronRight
                    className="
                        h-3.5
                        w-3.5
                        text-slate-200
                        transition
                        group-hover:text-slate-400
                    "
                />

            </div>


            <div className="mt-6">

                <p
                    className="
                        text-xs
                        font-medium
                        text-slate-500
                    "
                >
                    {label}
                </p>


                {loading ? (

                    <div
                        className="
                            mt-2
                            h-9
                            w-14
                            animate-pulse
                            rounded-md
                            bg-slate-100
                        "
                    />

                ) : (

                    <p
                        className="
                            mt-1
                            text-3xl
                            font-semibold
                            tracking-[-0.04em]
                            text-slate-950
                        "
                    >
                        {Number(
                            value || 0
                        ).toLocaleString()}
                    </p>

                )}


                <p
                    className="
                        mt-2
                        text-[10px]
                        text-slate-400
                    "
                >
                    {description}
                </p>

            </div>

        </div>
    );
}


/* ================================================================
   ASSIGNMENT ROW
================================================================ */

function AssignmentRow({
    item,
    staffList,
    staffLoading,
    selectedStaff,
    submitting,
    onSelectStaff,
    onView,
    onAssign,
}) {

    const assigned =
        Boolean(
            item.assignedSupportId ||
            item.assignedSupport?.id
        );


    const status =
        String(
            item.status || "UNKNOWN"
        ).toUpperCase();


    const priority =
        String(
            item.priority || "NORMAL"
        ).toUpperCase();


    const ownerName = item.assignedSupport
        ? `${item.assignedSupport.firstName || ""} ${
              item.assignedSupport.lastName || ""
          }`.trim()
        : "Unassigned";


    return (
        <article
            className="
                group
                px-5
                py-5
                transition
                hover:bg-slate-50/60
                sm:px-6
            "
        >

            <div
                className="
                    flex
                    flex-col
                    gap-5
                    xl:flex-row
                    xl:items-center
                "
            >

                {/* =================================================
                    CASE INFO
                ================================================= */}

                <div className="min-w-0 flex-1">

                    <div
                        className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
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
                                bg-slate-100
                                text-slate-500
                                transition
                                group-hover:bg-blue-50
                                group-hover:text-blue-600
                            "
                        >
                            <ClipboardList
                                className="h-4 w-4"
                            />
                        </div>


                        <div className="min-w-0">

                            <div
                                className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                "
                            >

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-slate-900
                                    "
                                >
                                    {item.caseNumber ||
                                        item.id}
                                </p>


                                <StatusBadge
                                    status={status}
                                />


                                <PriorityBadge
                                    priority={priority}
                                />

                            </div>

                        </div>

                    </div>


                    <p
                        className="
                            mt-3
                            truncate
                            text-sm
                            font-medium
                            text-slate-700
                        "
                    >
                        {item.subject ||
                            "No subject provided"}
                    </p>


                    <div
                        className="
                            mt-2
                            flex
                            flex-wrap
                            items-center
                            gap-x-4
                            gap-y-1
                        "
                    >

                        <span
                            className="
                                text-[10px]
                                text-slate-400
                            "
                        >
                            Current owner:
                            <span
                                className="
                                    ml-1
                                    font-semibold
                                    text-slate-600
                                "
                            >
                                {ownerName}
                            </span>
                        </span>


                        <span
                            className="
                                text-[10px]
                                text-slate-300
                            "
                        >
                            •
                        </span>


                        <span
                            className="
                                text-[10px]
                                font-medium
                                text-slate-400
                            "
                        >
                            {assigned
                                ? "Active assignment"
                                : "Awaiting assignment"}
                        </span>

                    </div>

                </div>


                {/* =================================================
                    ASSIGNMENT CONTROL
                ================================================= */}

                <div
                    className="
                        flex
                        w-full
                        flex-col
                        gap-2
                        sm:flex-row
                        xl:w-[420px]
                    "
                >

                    <select
                        value={selectedStaff}
                        onChange={(event) =>
                            onSelectStaff(
                                event.target.value
                            )
                        }
                        disabled={
                            staffLoading ||
                            submitting
                        }
                        className="
                            h-10
                            min-w-0
                            flex-1
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-xs
                            font-medium
                            text-slate-700
                            outline-none
                            transition
                            hover:border-slate-300
                            focus:border-blue-300
                            focus:ring-4
                            focus:ring-blue-50
                            disabled:cursor-not-allowed
                            disabled:bg-slate-50
                            disabled:text-slate-400
                        "
                    >

                        <option value="">
                            {staffLoading
                                ? "Loading support staff..."
                                : "Select support staff"}
                        </option>


                        {staffList.map(
                            (staff) => (

                                <option
                                    key={staff.id}
                                    value={staff.id}
                                >
                                    {`${staff.firstName || ""} ${
                                        staff.lastName || ""
                                    }`.trim() ||
                                        staff.email ||
                                        "Support staff"}
                                </option>

                            )
                        )}

                    </select>


                    <button
                        type="button"
                        onClick={onAssign}
                        disabled={submitting}
                        className="
                            inline-flex
                            h-10
                            shrink-0
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-[#0b1d38]
                            px-4
                            text-xs
                            font-semibold
                            text-white
                            transition
                            hover:bg-[#122b4f]
                            disabled:cursor-not-allowed
                            disabled:bg-slate-300
                        "
                    >

                        {submitting ? (

                            <RefreshCw
                                className="
                                    h-3.5
                                    w-3.5
                                    animate-spin
                                "
                            />

                        ) : (

                            <UserPlus
                                className="h-3.5 w-3.5"
                            />

                        )}

                        {submitting
                            ? "Saving..."
                            : assigned
                            ? "Reassign"
                            : "Assign"}

                    </button>

                </div>


                {/* =================================================
                    VIEW
                ================================================= */}

                <button
                    type="button"
                    onClick={onView}
                    className="
                        inline-flex
                        h-10
                        shrink-0
                        items-center
                        justify-center
                        gap-1.5
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-3
                        text-xs
                        font-semibold
                        text-slate-600
                        transition
                        hover:border-blue-200
                        hover:bg-blue-50
                        hover:text-blue-700
                        xl:w-auto
                    "
                >

                    View details

                    <ArrowRight
                        className="h-3 w-3"
                    />

                </button>

            </div>

        </article>
    );
}


/* ================================================================
   STATUS BADGE
================================================================ */

function StatusBadge({ status }) {

    const config = {
        OPEN: {
            label: "Open",
            className:
                "border-amber-100 bg-amber-50 text-amber-700",
        },

        ASSIGNED: {
            label: "Assigned",
            className:
                "border-indigo-100 bg-indigo-50 text-indigo-700",
        },

        IN_PROGRESS: {
            label: "In Progress",
            className:
                "border-blue-100 bg-blue-50 text-blue-700",
        },

        PENDING: {
            label: "Pending",
            className:
                "border-orange-100 bg-orange-50 text-orange-700",
        },

        ESCALATED: {
            label: "Escalated",
            className:
                "border-red-100 bg-red-50 text-red-700",
        },

        RESOLVED: {
            label: "Resolved",
            className:
                "border-emerald-100 bg-emerald-50 text-emerald-700",
        },

        CLOSED: {
            label: "Closed",
            className:
                "border-slate-200 bg-slate-100 text-slate-600",
        },
    };


    const current =
        config[status] || {
            label: status
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(
                    /\b\w/g,
                    (letter) =>
                        letter.toUpperCase()
                ),
            className:
                "border-slate-200 bg-slate-50 text-slate-600",
        };


    return (
        <span
            className={`
                inline-flex
                items-center
                rounded-full
                border
                px-2
                py-0.5
                text-[9px]
                font-bold
                uppercase
                tracking-[0.06em]
                ${current.className}
            `}
        >
            {current.label}
        </span>
    );
}


/* ================================================================
   PRIORITY BADGE
================================================================ */

function PriorityBadge({ priority }) {

    const config = {
        CRITICAL:
            "bg-red-50 text-red-700 border-red-100",

        HIGH:
            "bg-orange-50 text-orange-700 border-orange-100",

        MEDIUM:
            "bg-amber-50 text-amber-700 border-amber-100",

        LOW:
            "bg-emerald-50 text-emerald-700 border-emerald-100",

        NORMAL:
            "bg-slate-50 text-slate-600 border-slate-200",
    };


    const label =
        priority
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );


    return (
        <span
            className={`
                inline-flex
                items-center
                rounded-full
                border
                px-2
                py-0.5
                text-[9px]
                font-semibold
                ${config[priority] ||
                    config.NORMAL}
            `}
        >
            {label}
        </span>
    );
}


/* ================================================================
   EMPTY QUEUE
================================================================ */

function EmptyQueue() {

    return (
        <div
            className="
                flex
                flex-col
                items-center
                justify-center
                px-6
                py-16
                text-center
            "
        >

            <div
                className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-emerald-50
                    text-emerald-600
                "
            >
                <CheckCircle2
                    className="h-5 w-5"
                />
            </div>


            <h3
                className="
                    mt-4
                    text-sm
                    font-semibold
                    text-slate-800
                "
            >
                Assignment queue is clear
            </h3>


            <p
                className="
                    mt-1
                    max-w-sm
                    text-xs
                    leading-5
                    text-slate-400
                "
            >
                There are currently no open or active
                cases requiring assignment within your scope.
            </p>

        </div>
    );
}


/* ================================================================
   LOADING SKELETON
================================================================ */

function AssignmentSkeleton() {

    return (
        <div
            className="
                divide-y
                divide-slate-100
            "
        >

            {[1, 2, 3, 4].map(
                (item) => (

                    <div
                        key={item}
                        className="
                            px-5
                            py-5
                            sm:px-6
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-5
                                xl:flex-row
                                xl:items-center
                            "
                        >

                            <div className="flex-1">

                                <div className="flex gap-3">

                                    <div
                                        className="
                                            h-9
                                            w-9
                                            shrink-0
                                            animate-pulse
                                            rounded-xl
                                            bg-slate-100
                                        "
                                    />

                                    <div
                                        className="
                                            flex-1
                                            space-y-2
                                        "
                                    >

                                        <div
                                            className="
                                                h-3
                                                w-36
                                                animate-pulse
                                                rounded
                                                bg-slate-100
                                            "
                                        />

                                        <div
                                            className="
                                                h-3
                                                w-2/3
                                                animate-pulse
                                                rounded
                                                bg-slate-100
                                            "
                                        />

                                        <div
                                            className="
                                                h-2.5
                                                w-44
                                                animate-pulse
                                                rounded
                                                bg-slate-50
                                            "
                                        />

                                    </div>

                                </div>

                            </div>


                            <div
                                className="
                                    h-10
                                    w-full
                                    animate-pulse
                                    rounded-xl
                                    bg-slate-100
                                    xl:w-[420px]
                                "
                            />

                        </div>

                    </div>

                )
            )}

        </div>
    );
}