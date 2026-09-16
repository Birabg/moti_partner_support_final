import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "../ui/table";

import { Badge } from "../ui/badge";

const statusTone = {
    OPEN: "warning",
    IN_PROGRESS: "default",
    CLOSED: "success",
    WAITING_CUSTOMER_FEEDBACK: "neutral",
};

const priorityTone = {
    LOW: "success",
    MEDIUM: "warning",
    HIGH: "warning",
    URGENT: "danger",
};

function ActionButton({
    onClick,
    children,
    variant = "outline",
}) {
    const base = `
        inline-flex
        items-center
        justify-center
        rounded-lg
        px-3
        py-1.5
        text-xs
        font-semibold
        transition-all
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-slate-200
        focus:ring-offset-1
    `;

    const variants = {
        primary: `
            bg-slate-900
            text-white
            shadow-sm
            hover:-translate-y-0.5
            hover:bg-slate-800
            hover:shadow
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
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`${base} ${variants[variant] || variants.outline}`}
        >
            {children}
        </button>
    );
}

function CustomerAvatar({ customer }) {
    const name = customer
        ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
        : "";

    const initials = name
        ? name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase()
        : "?";

    return (
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
                    bg-slate-100
                    text-xs
                    font-bold
                    text-slate-600
                "
            >
                {initials}
            </div>

            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                    {name || "-"}
                </p>

                <p className="text-xs text-slate-400">
                    Customer
                </p>
            </div>
        </div>
    );
}

export default function CaseTable({
    cases = [],
    onView,
    onAssign,
    onPriority,
    onResolve,
    onReassign,
}) {
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
            {/* Table header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Support Cases
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Manage and track customer support cases
                    </p>
                </div>

                <div
                    className="
                        rounded-full
                        bg-slate-100
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        text-slate-600
                    "
                >
                    {cases.length} {cases.length === 1 ? "case" : "cases"}
                </div>
            </div>

            {/* Responsive table */}
            <div className="overflow-x-auto">
                <Table className="min-w-[1100px]">
                    <TableHeader>
                        <TableRow className="border-b border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                            <TableHead className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                                Customer
                            </TableHead>

                            <TableHead className="py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                                Case Number
                            </TableHead>

                            <TableHead className="py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                                Organization
                            </TableHead>

                            <TableHead className="py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                                Date
                            </TableHead>

                            <TableHead className="py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                                Status
                            </TableHead>

                            <TableHead className="py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                                Priority
                            </TableHead>

                            <TableHead className="py-3 pr-5 text-xs font-bold uppercase tracking-wide text-slate-500">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {cases.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="px-5 py-16 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <div
                                            className="
                                                flex
                                                h-12
                                                w-12
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-slate-100
                                                text-slate-400
                                            "
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                className="h-6 w-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 12h6m-6 4h4m2-12H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8l-4-4Z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M14 4v4h4"
                                                />
                                            </svg>
                                        </div>

                                        <p className="mt-4 text-sm font-semibold text-slate-700">
                                            No cases found
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Try adjusting your search or filters.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            cases.map((item) => (
                                <TableRow
                                    key={item.id}
                                    className="
                                        border-b
                                        border-slate-100
                                        transition-colors
                                        duration-150
                                        hover:bg-slate-50/70
                                    "
                                >
                                    {/* Customer */}
                                    <TableCell className="px-5 py-4">
                                        <CustomerAvatar
                                            customer={item.customer}
                                        />
                                    </TableCell>

                                    {/* Case number */}
                                    <TableCell className="py-4">
                                        <span
                                            className="
                                                rounded-md
                                                bg-slate-100
                                                px-2
                                                py-1
                                                font-mono
                                                text-xs
                                                font-semibold
                                                text-slate-700
                                            "
                                        >
                                            {item.caseNumber || "-"}
                                        </span>
                                    </TableCell>

                                    {/* Organization */}
                                    <TableCell className="py-4">
                                        <span className="text-sm text-slate-600">
                                            {item.customer?.organization?.name || "-"}
                                        </span>
                                    </TableCell>

                                    {/* Date */}
                                    <TableCell className="py-4">
                                        <span className="text-sm text-slate-600">
                                            {item.createdAt
                                                ? new Date(
                                                      item.createdAt
                                                  ).toLocaleDateString()
                                                : "-"}
                                        </span>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell className="py-4">
                                        <Badge
                                            tone={
                                                statusTone[item.status] ||
                                                "neutral"
                                            }
                                        >
                                            {item.status}
                                        </Badge>
                                    </TableCell>

                                    {/* Priority */}
                                    <TableCell className="py-4">
                                        <Badge
                                            tone={
                                                priorityTone[item.priority] ||
                                                "neutral"
                                            }
                                        >
                                            {item.priority || "NORMAL"}
                                        </Badge>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="py-4 pr-5">
                                        <div className="flex flex-wrap gap-1.5">
                                            <ActionButton
                                                onClick={() =>
                                                    onView(item)
                                                }
                                                variant="primary"
                                            >
                                                View
                                            </ActionButton>

                                            <ActionButton
                                                onClick={() =>
                                                    onAssign(item)
                                                }
                                            >
                                                Assign
                                            </ActionButton>

                                            <ActionButton
                                                onClick={() =>
                                                    onResolve(item)
                                                }
                                            >
                                                Resolve
                                            </ActionButton>

                                            <ActionButton
                                                onClick={() =>
                                                    onPriority(item)
                                                }
                                            >
                                                Priority
                                            </ActionButton>

                                            <ActionButton
                                                onClick={() =>
                                                    onReassign(item)
                                                }
                                            >
                                                Reassign
                                            </ActionButton>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}