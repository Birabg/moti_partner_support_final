import ApprovalActionButtons from "./ApprovalActionButtons";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";

export default function PendingCustomerTable({ customers, approveUser, rejectUser }) {
    return (
        <div className="rounded-lg border border-navy-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Pending Customers</h2>

            <div className="overflow-hidden rounded-md border border-navy-100">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Organization</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-6 text-center text-slate-500">
                                    No pending customers.
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium text-slate-900">{customer.fullName}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>{customer.position}</TableCell>
                                    <TableCell>{customer.organization?.name}</TableCell>
                                    <TableCell>
                                        <ApprovalActionButtons
                                            onApprove={() => approveUser(customer.id, "CUSTOMER")}
                                            onReject={() => rejectUser(customer.id, "CUSTOMER")}
                                        />
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
