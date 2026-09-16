import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "../ui/table";

import { Link } from "react-router-dom";

import {
    ArrowUpRight,
    Clock3,
    User,
    FileText,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from "lucide-react";


export default function AssignedCasesTable({
    rows = [],
    loading,
}) {

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="space-y-3">

                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="
                            h-[62px]
                            animate-pulse
                            rounded-xl
                            bg-slate-50
                        "
                    />
                ))}

            </div>
        );
    }


    /* =========================================================
       EMPTY
    ========================================================= */

    if (rows.length === 0) {
        return (
            <div className="
                flex
                flex-col
                items-center
                justify-center
                rounded-2xl
                bg-slate-50/70
                px-6
                py-12
                text-center
            ">

                <div className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-slate-300
                    shadow-sm
                ">
                    <FileText className="h-5 w-5" />
                </div>

                <h3 className="
                    mt-4
                    text-sm
                    font-bold
                    text-slate-600
                ">
                    No assigned cases
                </h3>

                <p className="
                    mt-1.5
                    max-w-sm
                    text-[11px]
                    leading-5
                    text-slate-400
                ">
                    Cases assigned to you will appear here when
                    they require your attention.
                </p>

            </div>
        );
    }


    /* =========================================================
       TABLE
    ========================================================= */

    return (
        <div className="
            w-full
            overflow-x-auto
            rounded-xl
            border
            border-slate-100
        ">

            <Table className="min-w-[900px]">

                {/* HEADER */}

                <TableHeader>

                    <TableRow className="
                        border-b
                        border-slate-100
                        bg-slate-50/80
                        hover:bg-slate-50/80
                    ">

                        <TableHead className="
                            h-11
                            px-4
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                        ">
                            Case
                        </TableHead>


                        <TableHead className="
                            h-11
                            px-4
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                        ">
                            Customer
                        </TableHead>


                        <TableHead className="
                            h-11
                            px-4
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                        ">
                            Subject
                        </TableHead>


                        <TableHead className="
                            h-11
                            px-4
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                        ">
                            Priority
                        </TableHead>


                        <TableHead className="
                            h-11
                            px-4
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                        ">
                            Status
                        </TableHead>


                        <TableHead className="
                            h-11
                            px-4
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                        ">
                            Created
                        </TableHead>


                        <TableHead className="
                            h-11
                            px-4
                            text-right
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                        ">
                            Action
                        </TableHead>

                    </TableRow>

                </TableHeader>


                {/* BODY */}

                <TableBody>

                    {rows.map((r) => (

                        <CaseRow
                            key={r.id}
                            caseData={r}
                        />

                    ))}

                </TableBody>

            </Table>

        </div>
    );
}


/* ============================================================
   CASE ROW
============================================================ */

function CaseRow({
    caseData,
}) {

    const {
        id,
        caseNumber,
        subject,
        priority,
        status,
        createdAt,
    } = caseData;


    const customerName =
        caseData.customerName ||
        caseData.customer?.name ||
        [
            caseData.customer?.firstName,
            caseData.customer?.lastName,
        ]
            .filter(Boolean)
            .join(" ") ||
        "Unknown customer";


    return (
        <TableRow
            className="
                group
                border-b
                border-slate-100
                bg-white
                transition-colors
                hover:bg-slate-50/70
            "
        >

            {/* CASE NUMBER */}

            <TableCell className="px-4 py-4">

                <div className="flex items-center gap-2.5">

                    <div className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[#edf4fd]
                        text-[#527eb9]
                    ">

                        <FileText className="h-3.5 w-3.5" />

                    </div>

                    <div className="min-w-0">

                        <p className="
                            text-[10px]
                            font-bold
                            text-[#101a28]
                            whitespace-nowrap
                        ">
                            {caseNumber || id}
                        </p>

                        <p className="
                            mt-0.5
                            text-[9px]
                            text-slate-400
                        ">
                            Support case
                        </p>

                    </div>

                </div>

            </TableCell>


            {/* CUSTOMER */}

            <TableCell className="px-4 py-4">

                <div className="flex items-center gap-2.5">

                    <div className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-100
                        text-slate-500
                    ">

                        <User className="h-3.5 w-3.5" />

                    </div>

                    <span className="
                        max-w-[150px]
                        truncate
                        text-[10px]
                        font-semibold
                        text-slate-600
                    ">
                        {customerName}
                    </span>

                </div>

            </TableCell>


            {/* SUBJECT */}

            <TableCell className="px-4 py-4">

                <div className="max-w-[230px]">

                    <p className="
                        truncate
                        text-[10px]
                        font-semibold
                        text-[#101a28]
                    ">
                        {subject || "Untitled case"}
                    </p>

                    <p className="
                        mt-0.5
                        truncate
                        text-[9px]
                        text-slate-400
                    ">
                        Support request
                    </p>

                </div>

            </TableCell>


            {/* PRIORITY */}

            <TableCell className="px-4 py-4">

                <PriorityBadge
                    priority={priority}
                />

            </TableCell>


            {/* STATUS */}

            <TableCell className="px-4 py-4">

                <StatusBadge
                    status={status}
                />

            </TableCell>


            {/* CREATED */}

            <TableCell className="px-4 py-4">

                <div className="flex items-center gap-2">

                    <Clock3 className="
                        h-3
                        w-3
                        shrink-0
                        text-slate-300
                    " />

                    <div>

                        <p className="
                            whitespace-nowrap
                            text-[10px]
                            font-medium
                            text-slate-600
                        ">
                            {formatDate(createdAt)}
                        </p>

                        <p className="
                            mt-0.5
                            whitespace-nowrap
                            text-[9px]
                            text-slate-400
                        ">
                            {formatTime(createdAt)}
                        </p>

                    </div>

                </div>

            </TableCell>


            {/* ACTION */}

            <TableCell className="px-4 py-4 text-right">

                <Link
                    to={`/support/cases/${id}`}
                    className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        px-3
                        py-2
                        text-[9px]
                        font-bold
                        text-slate-600
                        shadow-sm
                        transition-all
                        hover:border-[#cbdcf0]
                        hover:bg-[#f5f9fe]
                        hover:text-[#527eb9]
                        hover:shadow-md
                    "
                >

                    Open

                    <ArrowUpRight className="
                        h-3
                        w-3
                        transition-transform
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                    " />

                </Link>

            </TableCell>

        </TableRow>
    );
}


/* ============================================================
   PRIORITY BADGE
============================================================ */

function PriorityBadge({
    priority,
}) {

    const normalized =
        String(priority || "")
            .toUpperCase();


    const config = {

        LOW: {
            label: "Low",
            className: "bg-slate-50 text-slate-500 border-slate-200",
        },

        MEDIUM: {
            label: "Medium",
            className: "bg-[#edf4fd] text-[#527eb9] border-[#dce9f7]",
        },

        HIGH: {
            label: "High",
            className: "bg-[#fff7e8] text-[#b7832e] border-[#f4e5c8]",
        },

        CRITICAL: {
            label: "Critical",
            className: "bg-red-50 text-red-600 border-red-100",
        },

        URGENT: {
            label: "Urgent",
            className: "bg-red-50 text-red-600 border-red-100",
        },

    };


    const current =
        config[normalized] || {
            label: priority
                ? String(priority)
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())
                : "Normal",

            className:
                "bg-slate-50 text-slate-500 border-slate-200",
        };


    return (
        <span className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5
            py-1
            text-[9px]
            font-bold
            ${current.className}
        `}>

            {(normalized === "HIGH" ||
                normalized === "CRITICAL" ||
                normalized === "URGENT") && (
                <AlertCircle className="h-2.5 w-2.5" />
            )}

            {current.label}

        </span>
    );
}


/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
    status,
}) {

    const normalized =
        String(status || "")
            .toUpperCase();


    const config = {

        OPEN: {
            label: "Open",
            icon: Clock3,
            className: "bg-blue-50 text-blue-600 border-blue-100",
        },

        IN_PROGRESS: {
            label: "In Progress",
            icon: Loader2,
            className: "bg-indigo-50 text-indigo-600 border-indigo-100",
        },

        PENDING: {
            label: "Pending",
            icon: Clock3,
            className: "bg-amber-50 text-amber-600 border-amber-100",
        },

        ESCALATED: {
            label: "Escalated",
            icon: AlertCircle,
            className: "bg-red-50 text-red-600 border-red-100",
        },

        RESOLVED: {
            label: "Resolved",
            icon: CheckCircle2,
            className: "bg-emerald-50 text-emerald-600 border-emerald-100",
        },

        CUSTOMER_CONFIRMATION: {
            label: "Awaiting Customer",
            icon: Clock3,
            className: "bg-violet-50 text-violet-600 border-violet-100",
        },

        CLOSED: {
            label: "Closed",
            icon: CheckCircle2,
            className: "bg-slate-50 text-slate-500 border-slate-200",
        },

    };


    const current =
        config[normalized] || {
            label: status
                ? String(status)
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())
                : "Unknown",

            icon: Clock3,
            className:
                "bg-slate-50 text-slate-500 border-slate-200",
        };


    const Icon = current.icon;


    return (
        <span className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5
            py-1
            text-[9px]
            font-bold
            whitespace-nowrap
            ${current.className}
        `}>

            <Icon className="h-2.5 w-2.5" />

            {current.label}

        </span>
    );
}


/* ============================================================
   DATE HELPERS
============================================================ */

function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}


function formatTime(value) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });
}