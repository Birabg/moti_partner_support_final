import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
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

function ActionButton({ onClick, children, variant = "outline" }) {
    const base = "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors";
    const variants = {
        primary: "bg-navy-900 text-white hover:bg-navy-800",
        outline: "border border-navy-200 text-slate-600 hover:bg-navy-50",
    };
    return (
        <button onClick={onClick} className={`${base} ${variants[variant] || variants.outline}`}>
            {children}
        </button>
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
        <div className="overflow-hidden rounded-lg border border-navy-100 bg-white shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Case Number</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cases.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                                No Cases Found
                            </TableCell>
                        </TableRow>
                    ) : (
                        cases.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium text-slate-900">
                                    {item.customer ? `${item.customer.firstName} ${item.customer.lastName}` : "-"}
                                </TableCell>
                                <TableCell>{item.caseNumber || "-"}</TableCell>
                                <TableCell>{item.customer?.organization?.name || "-"}</TableCell>
                                <TableCell>
                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge tone={statusTone[item.status] || "neutral"}>{item.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge tone={priorityTone[item.priority] || "neutral"}>{item.priority || "NORMAL"}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1.5">
                                        <ActionButton onClick={() => onView(item)} variant="primary">View</ActionButton>
                                        <ActionButton onClick={() => onAssign(item)}>Assign</ActionButton>
                                        <ActionButton onClick={() => onResolve(item)}>Resolve</ActionButton>
                                        <ActionButton onClick={() => onPriority(item)}>Priority</ActionButton>
                                        <ActionButton onClick={() => onReassign(item)}>Reassign</ActionButton>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
