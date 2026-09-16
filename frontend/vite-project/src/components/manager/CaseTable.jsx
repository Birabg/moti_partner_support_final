import {
    ArrowUpRight,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    Clock3,
    UserCircle2,
} from "lucide-react";

import { Card } from "../ui/card";


const STATUS_TONE = {
    OPEN: {
        badge: "border-blue-100 bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
    },

    ASSIGNED: {
        badge: "border-indigo-100 bg-indigo-50 text-indigo-700",
        dot: "bg-indigo-500",
    },

    IN_PROGRESS: {
        badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
    },

    PENDING: {
        badge: "border-amber-100 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
    },

    ESCALATED: {
        badge: "border-red-100 bg-red-50 text-red-700",
        dot: "bg-red-500",
    },

    RESOLVED: {
        badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
    },

    CUSTOMER_CONFIRMATION: {
        badge: "border-violet-100 bg-violet-50 text-violet-700",
        dot: "bg-violet-500",
    },

    CLOSED: {
        badge: "border-slate-200 bg-slate-100 text-slate-600",
        dot: "bg-slate-500",
    },
};


function formatStatus(value) {
    if (!value) {
        return "Unknown";
    }

    return String(value)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


function formatPriority(value) {
    if (!value) {
        return "Normal";
    }

    return String(value)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


function getPriorityTone(value) {
    const priority = String(value || "").toUpperCase();

    if (priority === "CRITICAL") {
        return "bg-red-500";
    }

    if (priority === "HIGH") {
        return "bg-orange-500";
    }

    if (priority === "MEDIUM") {
        return "bg-amber-500";
    }

    if (priority === "LOW") {
        return "bg-emerald-500";
    }

    return "bg-slate-300";
}


function formatDate(value) {
    if (!value) {
        return "Date unavailable";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}


function getCustomerName(row) {
    const customer = row?.customer;

    if (!customer) {
        return null;
    }

    if (customer.name) {
        return customer.name;
    }

    const name = [
        customer.firstName,
        customer.middleName,
        customer.lastName,
    ]
        .filter(Boolean)
        .join(" ");

    return name || null;
}


export default function CaseTable({
    rows = [],
    loading = false,
}) {
    if (loading) {
        return (
            <div
                className="
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-slate-200/80
                    bg-white
                    shadow-[0_8px_30px_rgba(16,32,55,0.045)]
                "
            >
                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                    <div className="mt-2 h-2.5 w-44 animate-pulse rounded bg-slate-100" />
                </div>

                <div className="divide-y divide-slate-100">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="flex items-center gap-4 px-5 py-5 sm:px-6"
                        >
                            <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-100" />

                            <div className="min-w-0 flex-1">
                                <div className="h-3.5 w-40 animate-pulse rounded bg-slate-100" />
                                <div className="mt-2 h-2.5 w-64 max-w-full animate-pulse rounded bg-slate-100" />
                            </div>

                            <div className="hidden h-6 w-20 animate-pulse rounded-full bg-slate-100 sm:block" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }


    if (!rows || rows.length === 0) {
        return (
            <div
                className="
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-slate-200/80
                    bg-white
                    shadow-[0_8px_30px_rgba(16,32,55,0.045)]
                "
            >
                <div className="px-6 py-14 text-center">

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
                            text-slate-400
                        "
                    >
                        <BriefcaseBusiness className="h-5 w-5" />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-800">
                        No cases found
                    </p>

                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                        There are currently no cases available within this
                        manager scope.
                    </p>
                </div>
            </div>
        );
    }


    return (
        <div
            className="
                overflow-hidden
                rounded-[22px]
                border
                border-slate-200/80
                bg-white
                shadow-[0_8px_30px_rgba(16,32,55,0.045)]
            "
        >

            {/* TABLE HEADER */}

            <div
                className="
                    hidden
                    grid-cols-[minmax(0,1.6fr)_150px_130px_150px_32px]
                    items-center
                    gap-4
                    border-b
                    border-slate-100
                    bg-slate-50/40
                    px-5
                    py-3
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    text-slate-400
                    md:grid
                    sm:px-6
                "
            >
                <span>Case</span>
                <span>Status</span>
                <span>Priority</span>
                <span>Created</span>
                <span />
            </div>


            {/* CASE ROWS */}

            <div className="divide-y divide-slate-100">

                {rows.slice(0, 8).map((row, index) => {

                    const status =
                        String(row?.status || "")
                            .toUpperCase();

                    const tone =
                        STATUS_TONE[status] || {
                            badge:
                                "border-slate-200 bg-slate-50 text-slate-600",
                            dot: "bg-slate-400",
                        };

                    const customerName =
                        getCustomerName(row);

                    const caseNumber =
                        row?.caseNumber ||
                        row?.id ||
                        `CASE-${index + 1}`;

                    const subject =
                        row?.subject ||
                        "No subject provided";

                    return (
                        <Card
                            key={
                                row?.id ||
                                `${caseNumber}-${index}`
                            }
                            className="
                                group
                                relative
                                rounded-none
                                border-0
                                p-0
                                shadow-none
                                transition-colors
                                duration-200
                                hover:bg-slate-50/60
                            "
                        >

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    gap-4
                                    px-5
                                    py-5
                                    md:grid-cols-[minmax(0,1.6fr)_150px_130px_150px_32px]
                                    md:items-center
                                    md:gap-4
                                    sm:px-6
                                "
                            >

                                {/* CASE INFO */}

                                <div className="min-w-0">

                                    <div className="flex min-w-0 items-start gap-3">

                                        <div
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-slate-50
                                                text-slate-500
                                                transition
                                                duration-200
                                                group-hover:bg-blue-50
                                                group-hover:text-blue-600
                                            "
                                        >
                                            <BriefcaseBusiness className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 flex-1">

                                            <div className="flex items-center gap-2">

                                                <p
                                                    className="
                                                        truncate
                                                        text-sm
                                                        font-semibold
                                                        tracking-[-0.01em]
                                                        text-slate-900
                                                    "
                                                >
                                                    {caseNumber}
                                                </p>

                                                {row?.id && (
                                                    <span className="hidden text-[9px] text-slate-300 sm:inline">
                                                        #{String(row.id).slice(-6)}
                                                    </span>
                                                )}

                                            </div>

                                            <p
                                                className="
                                                    mt-1
                                                    truncate
                                                    text-xs
                                                    leading-5
                                                    text-slate-400
                                                "
                                            >
                                                {subject}
                                            </p>

                                        </div>

                                    </div>


                                    {/* MOBILE META */}

                                    <div
                                        className="
                                            mt-3
                                            flex
                                            flex-wrap
                                            items-center
                                            gap-2
                                            md:hidden
                                        "
                                    >

                                        <span
                                            className={`
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                rounded-full
                                                border
                                                px-2.5
                                                py-1
                                                text-[9px]
                                                font-bold
                                                uppercase
                                                tracking-[0.06em]
                                                ${tone.badge}
                                            `}
                                        >
                                            <span
                                                className={`
                                                    h-1.5
                                                    w-1.5
                                                    rounded-full
                                                    ${tone.dot}
                                                `}
                                            />

                                            {formatStatus(status)}
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400">

                                            <span
                                                className={`
                                                    h-1.5
                                                    w-1.5
                                                    rounded-full
                                                    ${getPriorityTone(
                                                        row?.priority
                                                    )}
                                                `}
                                            />

                                            {formatPriority(
                                                row?.priority
                                            )}

                                        </span>

                                    </div>

                                </div>


                                {/* STATUS */}

                                <div className="hidden md:block">

                                    <span
                                        className={`
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            rounded-full
                                            border
                                            px-2.5
                                            py-1
                                            text-[9px]
                                            font-bold
                                            uppercase
                                            tracking-[0.06em]
                                            ${tone.badge}
                                        `}
                                    >
                                        <span
                                            className={`
                                                h-1.5
                                                w-1.5
                                                rounded-full
                                                ${tone.dot}
                                            `}
                                        />

                                        {formatStatus(status)}
                                    </span>

                                </div>


                                {/* PRIORITY */}

                                <div className="hidden md:flex items-center gap-2">

                                    <span
                                        className={`
                                            h-2
                                            w-2
                                            rounded-full
                                            ${getPriorityTone(
                                                row?.priority
                                            )}
                                        `}
                                    />

                                    <span className="text-xs font-medium text-slate-600">
                                        {formatPriority(
                                            row?.priority
                                        )}
                                    </span>

                                </div>


                                {/* DATE / CUSTOMER */}

                                <div className="hidden min-w-0 md:block">

                                    <div className="flex items-center gap-2">

                                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-300" />

                                        <span className="truncate text-[10px] font-medium text-slate-500">
                                            {formatDate(
                                                row?.createdAt ||
                                                row?.created_at
                                            )}
                                        </span>

                                    </div>

                                    {customerName && (
                                        <div className="mt-1 flex items-center gap-2">

                                            <UserCircle2 className="h-3 w-3 shrink-0 text-slate-300" />

                                            <span className="truncate text-[9px] text-slate-400">
                                                {customerName}
                                            </span>

                                        </div>
                                    )}

                                </div>


                                {/* ACTION */}

                                <div className="hidden md:flex justify-end">

                                    <div
                                        className="
                                            flex
                                            h-7
                                            w-7
                                            items-center
                                            justify-center
                                            rounded-lg
                                            text-slate-300
                                            transition
                                            group-hover:bg-blue-50
                                            group-hover:text-blue-600
                                        "
                                    >
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </div>

                                </div>


                                {/* MOBILE FOOTER */}

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        border-t
                                        border-slate-100
                                        pt-3
                                        md:hidden
                                    "
                                >

                                    <div className="flex items-center gap-2">

                                        <Clock3 className="h-3.5 w-3.5 text-slate-300" />

                                        <span className="text-[10px] text-slate-400">
                                            {formatDate(
                                                row?.createdAt ||
                                                row?.created_at
                                            )}
                                        </span>

                                    </div>

                                    {customerName ? (
                                        <div className="flex max-w-[55%] items-center gap-1.5">

                                            <UserCircle2 className="h-3.5 w-3.5 shrink-0 text-slate-300" />

                                            <span className="truncate text-[10px] text-slate-400">
                                                {customerName}
                                            </span>

                                        </div>
                                    ) : (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-300" />
                                    )}

                                </div>

                            </div>

                        </Card>
                    );
                })}

            </div>


            {/* FOOTER */}

            {rows.length > 8 && (
                <div
                    className="
                        flex
                        items-center
                        justify-center
                        border-t
                        border-slate-100
                        bg-slate-50/30
                        px-5
                        py-3
                    "
                >
                    <p className="text-[10px] font-medium text-slate-400">
                        Showing the first 8 of{" "}
                        <span className="font-semibold text-slate-600">
                            {rows.length}
                        </span>{" "}
                        cases
                    </p>
                </div>
            )}

        </div>
    );
}