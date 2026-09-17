import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "../ui/table";

import { Badge } from "../ui/badge";

import {
    FileText,
    Eye,
    UserPlus,
    CheckCircle2,
    SlidersHorizontal,
    UsersRound,
    Inbox,
    X,
    ArrowUpCircle,
    ShieldCheck,
} from "lucide-react";


// ============================================================
// STATUS CONFIGURATION
// ============================================================

const statusConfig = {

    OPEN: {
        label: "Open",
        tone: "warning",
    },

    IN_PROGRESS: {
        label: "In Progress",
        tone: "default",
    },

    ESCALATED: {
        label: "Escalated",
        tone: "danger",
    },

    PENDING: {
        label: "Pending",
        tone: "warning",
    },

    AWAITING_CUSTOMER_RESPONSE: {
        label: "Awaiting Customer Response",
        tone: "neutral",
    },

    WAITING_CUSTOMER_FEEDBACK: {
        label: "Awaiting Customer Response",
        tone: "neutral",
    },

    CLOSED: {
        label: "Closed",
        tone: "success",
    },

    RESOLVED: {
        label: "Resolved",
        tone: "success",
    },

};


// ============================================================
// PRIORITY CONFIGURATION
// ============================================================

const priorityConfig = {

    LOW: {
        label: "Low",
        tone: "success",
    },

    MEDIUM: {
        label: "Medium",
        tone: "warning",
    },

    HIGH: {
        label: "High",
        tone: "warning",
    },

    URGENT: {
        label: "Urgent",
        tone: "danger",
    },

};


// ============================================================
// FORMAT STATUS
// ============================================================

function getStatusConfig(status) {

    return (
        statusConfig[status] || {
            label: formatText(status),
            tone: "neutral",
        }
    );

}


// ============================================================
// FORMAT PRIORITY
// ============================================================

function getPriorityConfig(priority) {

    return (
        priorityConfig[priority] || {
            label: formatText(priority || "NORMAL"),
            tone: "neutral",
        }
    );

}


// ============================================================
// FORMAT TEXT
// ============================================================

function formatText(value) {

    if (!value) {
        return "-";
    }

    return value
        .toString()
        .toLowerCase()
        .split("_")
        .map(
            word =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");

}


// ============================================================
// ACTION BUTTON
// ============================================================

function ActionButton({
    onClick,
    children,
    icon: Icon,
    variant = "outline",
}) {

    const base = `
        inline-flex
        items-center
        justify-center
        gap-1.5
        rounded-lg
        px-3
        py-2
        text-xs
        font-semibold
        whitespace-nowrap
        transition-all
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-blue-100
        focus:ring-offset-1
    `;


    const variants = {

        primary: `
            border
            border-[#17345c]
            bg-[#17345c]
            text-white
            shadow-sm
            hover:bg-[#102949]
            hover:border-[#102949]
        `,

        outline: `
            border
            border-slate-200
            bg-white
            text-slate-600
            hover:border-slate-300
            hover:bg-slate-50
            hover:text-slate-900
        `,

        success: `
            border
            border-emerald-100
            bg-emerald-50
            text-emerald-700
            hover:bg-emerald-100
        `,

        danger: `
            border
            border-red-200
            bg-red-50
            text-red-700
            hover:bg-red-100
        `,

    };


    return (

        <button
            type="button"
            onClick={onClick}
            className={`
                ${base}
                ${variants[variant] || variants.outline}
            `}
        >

            {Icon && (
                <Icon
                    size={14}
                    strokeWidth={1.9}
                />
            )}

            {children}

        </button>

    );

}


// ============================================================
// CUSTOMER AVATAR
// ============================================================

function CustomerAvatar({
    customer
}) {

    const name = customer
        ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
        : "";


    const initials = name
        ? name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(
                part =>
                    part[0]
            )
            .join("")
            .toUpperCase()
        : "?";


    return (

        <div
            className="
                flex
                items-center
                gap-3
                min-w-[210px]
            "
        >

            <div
                className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-blue-100
                    bg-blue-50
                    text-xs
                    font-bold
                    text-blue-700
                "
            >

                {initials}

            </div>


            <div className="min-w-0">

                <p
                    className="
                        truncate
                        text-sm
                        font-semibold
                        text-slate-900
                    "
                >
                    {name || "-"}
                </p>


                <p
                    className="
                        mt-0.5
                        text-xs
                        text-slate-400
                    "
                >
                    Customer
                </p>

            </div>

        </div>

    );

}


// ============================================================
// CASE NUMBER
// ============================================================

function CaseNumber({
    value
}) {

    return (

        <div className="flex items-center gap-2.5">

            <div
                className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-slate-50
                    text-slate-400
                "
            >

                <FileText
                    size={14}
                    strokeWidth={1.8}
                />

            </div>


            <span
                className="
                    whitespace-nowrap
                    font-mono
                    text-sm
                    font-semibold
                    text-slate-700
                "
            >
                {value || "-"}
            </span>

        </div>

    );

}


// ============================================================
// ORGANIZATION
// ============================================================

function OrganizationName({
    organization
}) {

    return (

        <div className="flex items-center gap-2">

            <UsersRound
                size={15}
                className="shrink-0 text-slate-300"
                strokeWidth={1.8}
            />

            <span
                className="
                    max-w-[180px]
                    truncate
                    text-sm
                    text-slate-600
                "
            >
                {organization || "-"}
            </span>

        </div>

    );

}


// ============================================================
// DATE
// ============================================================

function CaseDate({
    date
}) {

    if (!date) {

        return (
            <span className="text-sm text-slate-400">
                -
            </span>
        );

    }


    const formattedDate =
        new Date(date).toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );


    return (

        <span
            className="
                whitespace-nowrap
                text-sm
                font-medium
                text-slate-600
            "
        >
            {formattedDate}
        </span>

    );

}


// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState() {

    return (

        <TableRow>

            <TableCell
                colSpan={7}
                className="
                    px-5
                    py-20
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        items-center
                        justify-center
                        text-center
                    "
                >

                    <div
                        className="
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            bg-slate-50
                            text-slate-300
                        "
                    >

                        <Inbox
                            size={24}
                            strokeWidth={1.5}
                        />

                    </div>


                    <p
                        className="
                            mt-4
                            text-sm
                            font-semibold
                            text-slate-700
                        "
                    >
                        No cases found
                    </p>


                    <p
                        className="
                            mt-1
                            max-w-sm
                            text-xs
                            leading-5
                            text-slate-400
                        "
                    >
                        There are no cases matching your
                        current search or filter criteria.
                    </p>

                </div>

            </TableCell>

        </TableRow>

    );

}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CaseTable({

    cases = [],

    onView,

    onAssign,

    onPriority,

    onResolve,

    onReassign,

    onCancel,

    onEscalate,

    onClose,

}) {

    const terminalStatuses = ["CLOSED", "RESOLVED", "CANCELLED"];

    const cancellableStatuses = ["OPEN", "ASSIGNED", "IN_PROGRESS", "PENDING", "ESCALATED"];

    const escalateStatuses = ["IN_PROGRESS", "PENDING"];

    const closeStatuses = ["RESOLVED", "CUSTOMER_CONFIRMATION"];

    return (

        <div
            className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
            "
        >


            {/* ==================================================
                TABLE HEADER / TITLE
            ================================================== */}

            <div
                className="
                    flex
                    flex-col
                    gap-4
                    border-b
                    border-slate-100
                    px-6
                    py-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >

                {/* LEFT */}

                <div
                    className="
                        flex
                        items-start
                        gap-3
                    "
                >

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

                        <FileText
                            size={18}
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

                            <h3
                                className="
                                    text-base
                                    font-semibold
                                    text-slate-900
                                "
                            >
                                Your case history
                            </h3>


                            <span
                                className="
                                    rounded-full
                                    bg-slate-100
                                    px-2.5
                                    py-1
                                    text-xs
                                    font-semibold
                                    text-slate-500
                                "
                            >
                                {cases.length}
                            </span>

                        </div>


                        <p
                            className="
                                mt-1
                                text-sm
                                text-slate-400
                            "
                        >
                            Review previously handled cases
                            and their latest status.
                        </p>

                    </div>

                </div>


                {/* RIGHT */}

                <div
                    className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-slate-400
                    "
                >

                    <ActivityIndicator />

                    Live case data

                </div>

            </div>


            {/* ==================================================
                TABLE
            ================================================== */}

            <div
                className="
                    overflow-x-auto
                "
            >

                <Table
                    className="
                        min-w-[1250px]
                    "
                >


                    {/* ==================================================
                        STICKY COLUMN HEADER
                    ================================================== */}

                    <TableHeader>

                        <TableRow
                            className="
                                sticky
                                top-0
                                z-30
                                border-b
                                border-slate-200
                                bg-white
                                hover:bg-white
                            "
                        >

                            <TableHead
                                className="
                                    sticky
                                    left-0
                                    z-40
                                    min-w-[230px]
                                    bg-white
                                    px-6
                                    py-4
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-slate-500
                                "
                            >
                                Customer
                            </TableHead>


                            <TableHead
                                className="
                                    min-w-[210px]
                                    bg-white
                                    py-4
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-slate-500
                                "
                            >
                                Case
                            </TableHead>


                            <TableHead
                                className="
                                    min-w-[200px]
                                    bg-white
                                    py-4
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-slate-500
                                "
                            >
                                Organization
                            </TableHead>


                            <TableHead
                                className="
                                    min-w-[150px]
                                    bg-white
                                    py-4
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-slate-500
                                "
                            >
                                Date
                            </TableHead>


                            <TableHead
                                className="
                                    min-w-[190px]
                                    bg-white
                                    py-4
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-slate-500
                                "
                            >
                                Status
                            </TableHead>


                            <TableHead
                                className="
                                    min-w-[130px]
                                    bg-white
                                    py-4
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-slate-500
                                "
                            >
                                Priority
                            </TableHead>


                            <TableHead
                                className="
                                    min-w-[350px]
                                    bg-white
                                    py-4
                                    pr-6
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-slate-500
                                "
                            >
                                Actions
                            </TableHead>

                        </TableRow>

                    </TableHeader>


                    {/* ==================================================
                        BODY
                    ================================================== */}

<TableBody>

                            {cases.length === 0 ? (

                            <EmptyState />

                        ) : (

                            cases.map((item) => {

                                const status =
                                    getStatusConfig(
                                        item.status
                                    );

                                const canCancel = cancellableStatuses.includes(item.status);

                                const canEscalate = escalateStatuses.includes(item.status);

                                const canClose = closeStatuses.includes(item.status);

                                const isTerminal = terminalStatuses.includes(item.status);

                                const priority =
                                    getPriorityConfig(
                                        item.priority
                                    );


                                return (

                                    <TableRow
                                        key={item.id}
                                        className="
                                            group
                                            border-b
                                            border-slate-100
                                            transition-colors
                                            duration-150
                                            hover:bg-slate-50/70
                                        "
                                    >

                                        {/* =================================
                                            CUSTOMER
                                        ================================= */}

                                        <TableCell
                                            className="
                                                px-6
                                                py-5
                                            "
                                        >

                                            <CustomerAvatar
                                                customer={
                                                    item.customer
                                                }
                                            />

                                        </TableCell>


                                        {/* =================================
                                            CASE
                                        ================================= */}

                                        <TableCell
                                            className="
                                                py-5
                                            "
                                        >

                                            <CaseNumber
                                                value={
                                                    item.caseNumber
                                                }
                                            />

                                        </TableCell>


                                        {/* =================================
                                            ORGANIZATION
                                        ================================= */}

                                        <TableCell
                                            className="
                                                py-5
                                            "
                                        >

                                            <OrganizationName
                                                organization={
                                                    item
                                                        .customer
                                                        ?.organization
                                                        ?.name
                                                }
                                            />

                                        </TableCell>


                                        {/* =================================
                                            DATE
                                        ================================= */}

                                        <TableCell
                                            className="
                                                py-5
                                            "
                                        >

                                            <CaseDate
                                                date={
                                                    item.createdAt
                                                }
                                            />

                                        </TableCell>


                                        {/* =================================
                                            STATUS
                                        ================================= */}

                                        <TableCell
                                            className="
                                                py-5
                                            "
                                        >

                                            <Badge
                                                tone={
                                                    status.tone
                                                }
                                            >
                                                {status.label}
                                            </Badge>

                                        </TableCell>


                                        {/* =================================
                                            PRIORITY
                                        ================================= */}

                                        <TableCell
                                            className="
                                                py-5
                                            "
                                        >

                                            <Badge
                                                tone={
                                                    priority.tone
                                                }
                                            >
                                                {priority.label}
                                            </Badge>

                                        </TableCell>


                                        {/* =================================
                                            ACTIONS
                                        ================================= */}

                                        <TableCell
                                            className="
                                                py-5
                                                pr-6
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                "
                                            >

                                                {/* VIEW */}

                                                <ActionButton
                                                    onClick={() =>
                                                        onView?.(item)
                                                    }
                                                    variant="primary"
                                                    icon={Eye}
                                                >
                                                    View
                                                </ActionButton>

                                                {!isTerminal && (

                                                    <>

                                                    {/* ASSIGN */}

                                                    <ActionButton
                                                        onClick={() =>
                                                            onAssign?.(item)
                                                        }
                                                        icon={UserPlus}
                                                    >
                                                        Assign
                                                    </ActionButton>


                                                    {/* RESOLVE */}

                                                    <ActionButton
                                                        onClick={() =>
                                                            onResolve?.(item)
                                                        }
                                                        variant="success"
                                                        icon={
                                                            CheckCircle2
                                                        }
                                                    >
                                                        Resolve
                                                    </ActionButton>


                                                    {/* PRIORITY */}

                                                    <ActionButton
                                                        onClick={() =>
                                                            onPriority?.(item)
                                                        }
                                                        icon={
                                                            SlidersHorizontal
                                                        }
                                                    >
                                                        Priority
                                                    </ActionButton>


                                                    {/* REASSIGN */}

                                                    <ActionButton
                                                        onClick={() =>
                                                            onReassign?.(item)
                                                        }
                                                        icon={
                                                            UserPlus
                                                        }
                                                    >
                                                        Reassign
                                                    </ActionButton>

                                                    {/* CANCEL */}

                                                    {canCancel && onCancel && (
                                                        <ActionButton
                                                            onClick={() =>
                                                                onCancel?.(item)
                                                            }
                                                            variant="danger"
                                                            icon={X}
                                                        >
                                                            Cancel
                                                        </ActionButton>
                                                    )}

                                                    {/* ESCALATE */}

                                                    {canEscalate && onEscalate && (
                                                        <ActionButton
                                                            onClick={() =>
                                                                onEscalate?.(item)
                                                            }
                                                            variant="accent"
                                                            icon={ArrowUpCircle}
                                                        >
                                                            Escalate
                                                        </ActionButton>
                                                    )}

                                                    {/* CLOSE */}

                                                    {canClose && onClose && (
                                                        <ActionButton
                                                            onClick={() =>
                                                                onClose?.(item)
                                                            }
                                                            variant="outline"
                                                            icon={ShieldCheck}
                                                        >
                                                            Close
                                                        </ActionButton>
                                                    )}

                                                    </>

                                                )}

                                            </div>

                                        </TableCell>

                                    </TableRow>

                                );

                            })

                        )}

                    </TableBody>

                </Table>

            </div>


            {/* ==================================================
                TABLE FOOTER
            ================================================== */}

            <div
                className="
                    flex
                    flex-col
                    gap-2
                    border-t
                    border-slate-100
                    bg-slate-50/40
                    px-6
                    py-4
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
                        text-sm
                        text-slate-400
                    "
                >

                    <ActivityIndicator />

                    <span>

                        {cases.length === 0
                            ? "0 cases"
                            : `${cases.length} ${
                                  cases.length === 1
                                      ? "case"
                                      : "cases"
                              }`
                        }

                    </span>

                </div>


                <div
                    className="
                        text-sm
                        text-slate-400
                    "
                >

                    Showing current page results

                </div>

            </div>

        </div>

    );

}


// ============================================================
// LIVE INDICATOR
// ============================================================

function ActivityIndicator() {

    return (

        <span
            className="
                inline-block
                h-2
                w-2
                rounded-full
                bg-emerald-500
            "
        />

    );

}