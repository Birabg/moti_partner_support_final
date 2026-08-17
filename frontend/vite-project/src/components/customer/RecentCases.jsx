import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
// src/components/customer/RecentCases.jsx

import { Link } from "react-router-dom";

const badge = {
    OPEN: "bg-navy-100 text-navy-700",
    ASSIGNED: "bg-navy-100 text-navy-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-slate-200 text-slate-700",
    REJECTED: "bg-red-100 text-red-700",
};

export default function RecentCases({
    cases = [],
    onView,
}) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                    Recent Cases
                </h2>

                <Link
                    to="/customer/my-cases"
                    className="
                        text-navy-600
                        text-sm
                        font-medium
                        hover:underline
                    "
                >
                    View All
                </Link>
            </div>

            {cases.length === 0 ? (
                <div className="py-16 text-center">
                    <h3 className="text-lg font-semibold text-slate-700">
                        No Support Cases
                    </h3>

                    <p className="text-slate-500 mt-2">
                        You haven't created any support
                        requests yet.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="border-b text-left">
                                <TableHead className="py-3">
                                    Case #
                                </TableHead>

                                <TableHead>
                                    Category
                                </TableHead>

                                <TableHead>
                                    Status
                                </TableHead>

                                <TableHead>
                                    Date
                                </TableHead>

                                <TableHead>
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {cases.slice(0, 5).map((item) => (
                                <TableRow
                                    key={item.id}
                                    className="border-b last:border-none"
                                >
                                    <TableCell className="py-4 font-semibold">
                                        {item.caseNumber}
                                    </TableCell>

                                    <TableCell>
                                        {item.productCategory?.name}
                                    </TableCell>

                                    <TableCell>
                                        <span
                                            className={`
                                                px-3
                                                py-1
                                                rounded-full
                                                text-xs
                                                font-semibold
                                                ${
                                                    badge[
                                                        item.status
                                                    ] ||
                                                    "bg-slate-100"
                                                }
                                            `}
                                        >
                                            {item.status}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        {new Date(
                                            item.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>

                                    <TableCell>
                                        {onView ? (
                                            <button
                                                type="button"
                                                onClick={() => onView(item)}
                                                className="text-navy-600 hover:underline"
                                            >
                                                View
                                            </button>
                                        ) : (
                                            <a
                                                href={`/customer/case/${item.id}`}
                                                className="text-navy-600 hover:underline"
                                            >
                                                View
                                            </a>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}