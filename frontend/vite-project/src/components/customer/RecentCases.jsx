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
    FaArrowRight,
    FaFolderOpen,
} from "react-icons/fa";

const statusStyles = {
    OPEN: "bg-blue-50 text-blue-700 border-blue-100",
    ASSIGNED: "bg-indigo-50 text-indigo-700 border-indigo-100",
    IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-100",
    PENDING: "bg-orange-50 text-orange-700 border-orange-100",
    ESCALATED: "bg-red-50 text-red-700 border-red-100",
    AWAITING_CUSTOMER_RESPONSE: "bg-violet-50 text-violet-700 border-violet-100",
    WAITING_CUSTOMER_FEEDBACK: "bg-violet-50 text-violet-700 border-violet-100",
    AWAITING_CUSTOMER: "bg-violet-50 text-violet-700 border-violet-100",
    AWAITING_CUSTOMER_FEEDBACK: "bg-violet-50 text-violet-700 border-violet-100",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    CUSTOMER_CONFIRMATION: "bg-violet-50 text-violet-700 border-violet-100",
    CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-100",
    REJECTED: "bg-red-50 text-red-700 border-red-100",
};

export default function RecentCases({
    cases = [],
    onView,
}) {
    return (
        <div className="bg-white">

            {/* =========================
                HEADER
            ========================== */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-5 border-b border-slate-100">

                <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Recent Cases
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Your latest support requests
                    </p>
                </div>

                <Link
                    to="/customer/my-cases"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                    View All
                    <FaArrowRight className="text-[10px]" />
                </Link>

            </div>

            {/* =========================
                EMPTY STATE
            ========================== */}
            {cases.length === 0 ? (
                <div className="py-16 px-6 text-center">

                    <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <FaFolderOpen className="text-xl text-slate-400" />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-slate-800">
                        No Support Cases
                    </h3>

                    <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                        You haven't created any support requests yet.
                    </p>

                    <Link
                        to="/customer/create-case"
                        className="inline-flex items-center gap-2 mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
                    >
                        Create a Request
                    </Link>

                </div>
            ) : (

                /* =========================
                   TABLE
                ========================== */
                <div className="overflow-x-auto">

                    <Table className="w-full">

                        <TableHeader>
                            <TableRow className="border-b border-slate-100 bg-slate-50/60">

                                <TableHead className="px-5 sm:px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Case
                                </TableHead>

                                <TableHead className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Category
                                </TableHead>

                                <TableHead className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </TableHead>

                                <TableHead className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Date
                                </TableHead>

                                <TableHead className="px-5 sm:px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                                    Action
                                </TableHead>

                            </TableRow>
                        </TableHeader>

                        <TableBody>

                            {cases.slice(0, 5).map((item) => {

                                const status =
                                    item.status || "OPEN";

                                const statusClass =
                                    statusStyles[status] ||
                                    "bg-slate-100 text-slate-600 border-slate-200";

                                return (
                                    <TableRow
                                        key={item.id}
                                        className="border-b border-slate-100 last:border-none hover:bg-slate-50/70 transition-colors"
                                    >

                                        {/* CASE NUMBER */}
                                        <TableCell className="px-5 sm:px-6 py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="hidden sm:flex w-9 h-9 rounded-lg bg-slate-100 items-center justify-center">
                                                    <FaFolderOpen className="text-xs text-slate-500" />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-sm text-slate-900" title={item.subject || ""}>
                                                        {item.caseNumber}
                                                    </p>

                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        Support case
                                                    </p>
                                                </div>

                                            </div>

                                        </TableCell>

                                        {/* CATEGORY */}
                                        <TableCell className="px-4 py-4">

                                            <span className="text-sm text-slate-600">
                                                {item.productCategory?.name ||
                                                    "General Support"}
                                            </span>

                                        </TableCell>

                                        {/* STATUS */}
                                        <TableCell className="px-4 py-4">

                                            <span
                                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass}`}
                                            >
                                                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70"></span>
                                                {status.replace(/_/g, " ")}
                                            </span>

                                        </TableCell>

                                        {/* DATE */}
                                        <TableCell className="px-4 py-4">

                                            <span className="text-sm text-slate-500 whitespace-nowrap">
                                                {new Date(
                                                    item.createdAt
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    }
                                                )}
                                            </span>

                                        </TableCell>

                                        {/* ACTION */}
                                        <TableCell className="px-5 sm:px-6 py-4 text-right">

                                            {onView ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onView(item)
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                                                >
                                                    View
                                                    <FaArrowRight className="text-[9px]" />
                                                </button>
                                            ) : (
                                                <a
                                                    href={`/customer/case/${item.id}`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                                                >
                                                    View
                                                    <FaArrowRight className="text-[9px]" />
                                                </a>
                                            )}

                                        </TableCell>

                                    </TableRow>
                                );
                            })}

                        </TableBody>

                    </Table>

                </div>
            )}

        </div>
    );
}
