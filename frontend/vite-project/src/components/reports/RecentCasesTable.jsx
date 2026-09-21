import {
    FaFolderOpen,
    FaClock,
    FaUser,
    FaArrowRight,
} from "react-icons/fa";

import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "../ui/table";

export default function RecentCasesTable({
    cases = [],
}) {
    const getStatusConfig = (status) => {
        switch (status) {
            case "OPEN":
                return {
                    label: "Open",
                    className: "bg-blue-50 text-blue-700 border-blue-100",
                    dot: "bg-blue-500",
                };

            case "IN_PROGRESS":
                return {
                    label: "In Progress",
                    className: "bg-amber-50 text-amber-700 border-amber-100",
                    dot: "bg-amber-500",
                };

            case "PENDING":
                return {
                    label: "Pending",
                    className: "bg-purple-50 text-purple-700 border-purple-100",
                    dot: "bg-purple-500",
                };

            case "ESCALATED":
                return {
                    label: "Escalated",
                    className: "bg-red-50 text-red-700 border-red-100",
                    dot: "bg-red-500",
                };

            case "WAITING_CUSTOMER_FEEDBACK":
            case "AWAITING_CUSTOMER":
            case "AWAITING_CUSTOMER_FEEDBACK":
                return {
                    label: "Awaiting Customer",
                    className: "bg-indigo-50 text-indigo-700 border-indigo-100",
                    dot: "bg-indigo-500",
                };

            case "RESOLVED":
                return {
                    label: "Resolved",
                    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
                    dot: "bg-emerald-500",
                };

            case "CLOSED":
                return {
                    label: "Closed",
                    className: "bg-slate-100 text-slate-600 border-slate-200",
                    dot: "bg-slate-400",
                };

            case "CANCELLED":
                return {
                    label: "Cancelled",
                    className: "bg-[#f8eff1] text-[#9a6b75] border-[#f1dde2]",
                    dot: "bg-[#9a6b75]",
                };

            default:
                return {
                    label: status || "Unknown",
                    className: "bg-slate-100 text-slate-600 border-slate-200",
                    dot: "bg-slate-400",
                };
        }
    };

    const formatStatus = (status) => {
        if (!status) return "Unknown";

        return status
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const getInitials = (name) => {
        if (!name) return "?";

        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase();
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "N/A";
        }

        return parsed.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (date) => {
        if (!date) return "";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "";
        }

        return parsed.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div
            className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)]
            "
        >
            {/* HEADER */}
            <div className="border-b border-slate-100 px-6 py-6 sm:px-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                        <div
                            className="
                                flex
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-slate-100
                                text-slate-600
                            "
                        >
                            <FaFolderOpen className="text-lg" />
                        </div>

                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                                    Recent Cases
                                </h2>

                                <span
                                    className="
                                        rounded-full
                                        bg-slate-100
                                        px-2.5
                                        py-1
                                        text-[11px]
                                        font-semibold
                                        text-slate-600
                                    "
                                >
                                    {cases.length}
                                </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                Latest customer support requests and their current status.
                            </p>
                        </div>

                    </div>

                    {cases.length > 0 && (
                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-slate-200
                                bg-slate-50
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-slate-500
                            "
                        >
                            <FaClock className="text-slate-400" />

                            Updated recently
                        </div>
                    )}

                </div>
            </div>

            {/* EMPTY STATE */}
            {cases.length === 0 ? (
                <div className="px-6 py-20 text-center">

                    <div
                        className="
                            mx-auto
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-2xl
                            bg-slate-100
                        "
                    >
                        <FaFolderOpen className="text-2xl text-slate-400" />
                    </div>

                    <h3 className="mt-5 text-lg font-semibold text-slate-800">
                        No Cases Found
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Recent customer support cases will appear here once
                        customers begin submitting requests.
                    </p>

                </div>
            ) : (

                <>
                    {/* TABLE */}
                    <div className="overflow-x-auto">

                        <Table className="min-w-[1000px] w-full">

                            <TableHeader className="bg-slate-50/80">

                                <TableRow className="border-b border-slate-200">

                                    <TableHead className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                        Case
                                    </TableHead>

                                    <TableHead className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                        Customer
                                    </TableHead>

                                    <TableHead className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                        Assigned Staff
                                    </TableHead>

                                    <TableHead className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                        Status
                                    </TableHead>

                                    <TableHead className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                        Priority
                                    </TableHead>

                                    <TableHead className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                        Created
                                    </TableHead>

                                </TableRow>

                            </TableHeader>

                            <TableBody>

                                {cases.map((item, index) => {

                                    const caseNumber =
                                        item.identity?.caseNumber ||
                                        item.caseNumber ||
                                        `CASE-${String(index + 1).padStart(4, "0")}`;

                                    const subject =
                                        item.identity?.subject ||
                                        item.subject ||
                                        "Support Request";

                                    const customer =
                                        item.actors?.creatorCustomer?.name ||
                                        item.customer?.name ||
                                        "N/A";

                                    const staff =
                                        item.actors?.assignedAgent?.name ||
                                        item.assignedAgent?.name ||
                                        "Unassigned";

                                    const status =
                                        item.lifecycle?.status ||
                                        item.status ||
                                        "OPEN";

                                    const priority =
                                        item.lifecycle?.priority ||
                                        item.priority ||
                                        "NORMAL";

                                    const createdAt =
                                        item.lifecycle?.createdAt ||
                                        item.createdAt;

                                    const statusConfig =
                                        getStatusConfig(status);

                                    const priorityConfig =
                                        priority === "HIGH" ||
                                        priority === "URGENT"
                                            ? "bg-red-50 text-red-700 border-red-100"
                                            : priority === "MEDIUM"
                                            ? "bg-amber-50 text-amber-700 border-amber-100"
                                            : "bg-slate-100 text-slate-600 border-slate-200";

                                    return (
                                        <TableRow
                                            key={
                                                item.identity?.id ||
                                                item.id ||
                                                index
                                            }
                                            className="
                                                group
                                                border-b
                                                border-slate-100
                                                transition-colors
                                                hover:bg-slate-50/70
                                            "
                                        >

                                            {/* CASE */}
                                            <TableCell className="px-6 py-5">

                                                <div className="flex items-center gap-3">

                                                    <div
                                                        className="
                                                            flex
                                                            h-10
                                                            w-10
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            bg-slate-100
                                                            text-xs
                                                            font-bold
                                                            text-slate-500
                                                        "
                                                    >
                                                        {String(index + 1).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">

                                                        <p
                                                            className="
                                                                truncate
                                                                font-semibold
                                                                text-slate-900
                                                            "
                                                            title={subject}
                                                        >
                                                            {caseNumber}
                                                        </p>

                                                        <p
                                                            className="
                                                                mt-1
                                                                max-w-[250px]
                                                                truncate
                                                                text-xs
                                                                text-slate-500
                                                            "
                                                            title={subject}
                                                        >
                                                            {subject}
                                                        </p>

                                                    </div>

                                                </div>

                                            </TableCell>

                                            {/* CUSTOMER */}
                                            <TableCell className="px-5 py-5">

                                                <div className="flex items-center gap-3">

                                                    <div
                                                        className="
                                                            flex
                                                            h-9
                                                            w-9
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            bg-blue-50
                                                            text-xs
                                                            font-bold
                                                            text-blue-600
                                                        "
                                                    >
                                                        {getInitials(customer)}
                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="truncate font-medium text-slate-800">
                                                            {customer}
                                                        </p>

                                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                                            Customer
                                                        </p>

                                                    </div>

                                                </div>

                                            </TableCell>

                                            {/* STAFF */}
                                            <TableCell className="px-5 py-5">

                                                {staff === "Unassigned" ? (

                                                    <div className="flex items-center gap-2 text-sm text-slate-400">

                                                        <FaUser className="text-xs" />

                                                        Unassigned

                                                    </div>

                                                ) : (

                                                    <div className="flex items-center gap-3">

                                                        <div
                                                            className="
                                                                flex
                                                                h-9
                                                                w-9
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                                bg-emerald-50
                                                                text-xs
                                                                font-bold
                                                                text-emerald-600
                                                            "
                                                        >
                                                            {getInitials(staff)}
                                                        </div>

                                                        <div className="min-w-0">

                                                            <p className="truncate font-medium text-slate-800">
                                                                {staff}
                                                            </p>

                                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                                Support Staff
                                                            </p>

                                                        </div>

                                                    </div>

                                                )}

                                            </TableCell>

                                            {/* STATUS */}
                                            <TableCell className="px-5 py-5">

                                                <span
                                                    className={`
                                                        inline-flex
                                                        items-center
                                                        gap-2
                                                        rounded-full
                                                        border
                                                        px-3
                                                        py-1.5
                                                        text-xs
                                                        font-semibold
                                                        ${statusConfig.className}
                                                    `}
                                                >

                                                    <span
                                                        className={`
                                                            h-1.5
                                                            w-1.5
                                                            rounded-full
                                                            ${statusConfig.dot}
                                                        `}
                                                    />

                                                    {statusConfig.label ||
                                                        formatStatus(status)}

                                                </span>

                                            </TableCell>

                                            {/* PRIORITY */}
                                            <TableCell className="px-5 py-5">

                                                <span
                                                    className={`
                                                        inline-flex
                                                        rounded-full
                                                        border
                                                        px-3
                                                        py-1.5
                                                        text-xs
                                                        font-semibold
                                                        ${priorityConfig}
                                                    `}
                                                >
                                                    {formatStatus(priority)}
                                                </span>

                                            </TableCell>

                                            {/* DATE */}
                                            <TableCell className="px-5 py-5">

                                                <div className="flex items-center gap-3">

                                                    <div
                                                        className="
                                                            flex
                                                            h-8
                                                            w-8
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            bg-slate-100
                                                        "
                                                    >
                                                        <FaClock className="text-xs text-slate-400" />
                                                    </div>

                                                    <div>

                                                        <p className="whitespace-nowrap text-sm font-medium text-slate-700">
                                                            {formatDate(createdAt)}
                                                        </p>

                                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                                            {formatTime(createdAt)}
                                                        </p>

                                                    </div>

                                                </div>

                                            </TableCell>

                                        </TableRow>
                                    );
                                })}

                            </TableBody>

                        </Table>

                    </div>

                    {/* FOOTER */}
                    <div
                        className="
                            flex
                            flex-col
                            gap-3
                            border-t
                            border-slate-100
                            bg-slate-50/50
                            px-6
                            py-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >

                        <p className="text-xs text-slate-500">

                            Showing{" "}

                            <span className="font-semibold text-slate-700">
                                {cases.length}
                            </span>{" "}

                            recent{" "}
                            {cases.length === 1 ? "case" : "cases"}

                        </p>

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">

                            View latest support activity

                            <FaArrowRight className="text-[10px]" />

                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
