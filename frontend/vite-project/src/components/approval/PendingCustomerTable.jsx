import {
    Mail,
    Building2,
    BriefcaseBusiness,
    UserRound,
} from "lucide-react";

import ApprovalActionButtons from "./ApprovalActionButtons";

import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "../ui/table";

export default function PendingCustomerTable({
    customers = [],
    approveUser,
    rejectUser,
}) {
    return (
        <div className="w-full">
            {/* =====================================================
                TABLE HEADER
            ===================================================== */}

            <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                            Customer registrations
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Review customer information before approving access.
                        </p>
                    </div>

                    <div
                        className="
                            hidden sm:flex
                            items-center
                            gap-2
                            rounded-lg
                            border border-[#dbe7f8]
                            bg-[#edf4fd]
                            px-3
                            py-1.5
                        "
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#527eb9]" />

                        <span className="text-[11px] font-semibold text-[#527eb9]">
                            {customers.length} pending
                        </span>
                    </div>
                </div>
            </div>

            {/* =====================================================
                EMPTY STATE
            ===================================================== */}

            {customers.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center px-6">
                    <div className="text-center">
                        <div
                            className="
                                mx-auto
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-xl
                                bg-slate-50
                                border border-slate-100
                            "
                        >
                            <UserRound className="h-5 w-5 text-slate-400" />
                        </div>

                        <h4 className="mt-4 text-sm font-semibold text-slate-800">
                            No pending customers
                        </h4>

                        <p className="mt-1 text-xs text-slate-400">
                            New customer registrations will appear here.
                        </p>
                    </div>
                </div>
            ) : (
                /* =================================================
                   TABLE
                ================================================= */

                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                                <TableHead
                                    className="
                                        h-11
                                        px-5
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.12em]
                                        text-slate-400
                                    "
                                >
                                    Customer
                                </TableHead>

                                <TableHead
                                    className="
                                        h-11
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.12em]
                                        text-slate-400
                                    "
                                >
                                    Contact
                                </TableHead>

                                <TableHead
                                    className="
                                        h-11
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.12em]
                                        text-slate-400
                                    "
                                >
                                    Position
                                </TableHead>

                                <TableHead
                                    className="
                                        h-11
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.12em]
                                        text-slate-400
                                    "
                                >
                                    Organization
                                </TableHead>

                                <TableHead
                                    className="
                                        h-11
                                        pr-5
                                        text-right
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.12em]
                                        text-slate-400
                                    "
                                >
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {customers.map((customer) => {
                                const fullName =
                                    customer.fullName ||
                                    customer.name ||
                                    "Unnamed customer";

                                const email =
                                    customer.email ||
                                    "No email provided";

                                const position =
                                    customer.position ||
                                    "—";

                                const organization =
                                    customer.organization?.name ||
                                    "No organization";

                                return (
                                    <TableRow
                                        key={customer.id}
                                        className="
                                            group
                                            border-b
                                            border-slate-100
                                            transition-colors
                                            hover:bg-slate-50/70
                                        "
                                    >
                                        {/* =================================
                                            CUSTOMER
                                        ================================= */}

                                        <TableCell className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="
                                                        flex
                                                        h-9
                                                        w-9
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        bg-[#edf4fd]
                                                        text-[#527eb9]
                                                        border
                                                        border-[#dbe7f8]
                                                    "
                                                >
                                                    <UserRound className="h-4 w-4" />
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
                                                        {fullName}
                                                    </p>

                                                    <div className="mt-0.5 flex items-center gap-1.5">
                                                        {customer.memberNumber && (
                                                            <span className="inline-flex shrink-0 items-center rounded-md border border-slate-100 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-slate-500">
                                                                {customer.memberNumber}
                                                            </span>
                                                        )}
                                                        <p className="text-[11px] text-slate-400">
                                                            Customer registration
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* =================================
                                            EMAIL
                                        ================================= */}

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-300" />

                                                <span className="text-sm text-slate-600">
                                                    {email}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* =================================
                                            POSITION
                                        ================================= */}

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0 text-slate-300" />

                                                <span className="text-sm text-slate-600">
                                                    {position}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* =================================
                                            ORGANIZATION
                                        ================================= */}

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-300" />

                                                <span className="text-sm font-medium text-slate-700">
                                                    {organization}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* =================================
                                            ACTIONS
                                        ================================= */}

                                        <TableCell className="pr-5">
                                            <div className="flex justify-end">
                                                <ApprovalActionButtons
                                                    onApprove={() =>
                                                        approveUser(
                                                            customer.id,
                                                            "CUSTOMER"
                                                        )
                                                    }
                                                    onReject={() =>
                                                        rejectUser(
                                                            customer.id,
                                                            "CUSTOMER"
                                                        )
                                                    }
                                                />
                                            </div>
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
