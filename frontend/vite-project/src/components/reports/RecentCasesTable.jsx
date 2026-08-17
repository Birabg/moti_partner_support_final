import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import {
    FaFolderOpen,
    FaClock,
    FaCheckCircle,
} from "react-icons/fa";

export default function RecentCasesTable({
    cases = [],
}) {
    const getStatusColor = (status) => {
        switch (status) {
            case "OPEN":
                return "bg-red-100 text-red-700";

            case "IN_PROGRESS":
                return "bg-yellow-100 text-yellow-700";

            case "WAITING_CUSTOMER_FEEDBACK":
                return "bg-navy-100 text-navy-700";

            case "CLOSED":
                return "bg-green-100 text-green-700";

            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    return (
        <div
            className="
                bg-white
                rounded-lg
                border
                shadow-sm
                overflow-hidden
            "
        >
            <div className="px-8 py-6 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">
                            Recent Cases
                        </h2>

                        <p className="text-slate-500 mt-1">
                            Latest support requests
                        </p>
                    </div>

                    <FaFolderOpen className="text-3xl text-green-600" />
                </div>
            </div>

            {cases.length === 0 ? (
                <div className="py-20 text-center">
                    <FaFolderOpen className="mx-auto text-5xl text-slate-300" />

                    <h3 className="mt-5 text-xl font-semibold text-slate-700">
                        No Cases Found
                    </h3>

                    <p className="mt-2 text-slate-500">
                        Recent support cases will appear here.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader className="bg-slate-50">
                            <TableRow className="text-left">
                                <TableHead className="px-6 py-4">
                                    Case
                                </TableHead>

                                <TableHead className="px-6 py-4">
                                    Customer
                                </TableHead>

                                <TableHead className="px-6 py-4">
                                    Assigned Staff
                                </TableHead>

                                <TableHead className="px-6 py-4">
                                    Status
                                </TableHead>

                                <TableHead className="px-6 py-4">
                                    Created
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {cases.map((item) => (
                                <TableRow
                                    key={
                                        item.identity?.id ||
                                        item.id
                                    }
                                    className="border-t hover:bg-slate-50 transition"
                                >
                                    <TableCell className="px-6 py-5">
                                        <div>
                                            <p className="font-semibold">
                                                {
                                                    item.identity
                                                        ?.caseNumber
                                                }
                                            </p>

                                            <p className="text-sm text-slate-500">
                                                {
                                                    item.identity
                                                        ?.subject
                                                }
                                            </p>
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-6 py-5">
                                        {item.actors
                                            ?.creatorCustomer
                                            ?.name ||
                                            "N/A"}
                                    </TableCell>

                                    <TableCell className="px-6 py-5">
                                        {item.actors
                                            ?.assignedAgent
                                            ?.name ||
                                            "Unassigned"}
                                    </TableCell>

                                    <TableCell className="px-6 py-5">
                                        <span
                                            className={`
                                                px-3
                                                py-1
                                                rounded-full
                                                text-sm
                                                font-medium
                                                ${getStatusColor(
                                                    item
                                                        .lifecycle
                                                        ?.status
                                                )}
                                            `}
                                        >
                                            {
                                                item
                                                    .lifecycle
                                                    ?.status
                                            }
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <FaClock />

                                            {new Date(
                                                item
                                                    .lifecycle
                                                    ?.createdAt
                                            ).toLocaleDateString()}
                                        </div>
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