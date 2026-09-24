import {
    Mail,
    Building2,
    BriefcaseBusiness,
    UserRoundCog,
    ShieldCheck,
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

export default function PendingStaffTable({
    staff = [],
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
                            Staff registrations
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Review staff accounts and assign organizational access.
                        </p>
                    </div>

                    <div
                        className="
                            hidden sm:flex
                            items-center
                            gap-2
                            rounded-lg
                            border border-[#f5e6c8]
                            bg-[#fff7e8]
                            px-3
                            py-1.5
                        "
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c58a27]" />

                        <span className="text-[11px] font-semibold text-[#c58a27]">
                            {staff.length} pending
                        </span>
                    </div>
                </div>
            </div>

            {/* =====================================================
                EMPTY STATE
            ===================================================== */}

            {staff.length === 0 ? (
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
                                border
                                border-slate-100
                                bg-slate-50
                            "
                        >
                            <UserRoundCog className="h-5 w-5 text-slate-400" />
                        </div>

                        <h4 className="mt-4 text-sm font-semibold text-slate-800">
                            No pending staff
                        </h4>

                        <p className="mt-1 text-xs text-slate-400">
                            New staff registrations will appear here.
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
                                    Staff member
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
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.12em]
                                        text-slate-400
                                    "
                                >
                                    Access
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
                            {staff.map((item) => {
                                const fullName =
                                    item.fullName ||
                                    item.name ||
                                    "Unnamed staff";

                                const email =
                                    item.email ||
                                    "No email provided";

                                const position =
                                    item.position ||
                                    "—";

                                const organization =
                                    item.organization?.name ||
                                    "No organization";

                                const role =
                                    item.role ||
                                    item.userRole ||
                                    "Staff";

                                return (
                                    <TableRow
                                        key={item.id}
                                        className="
                                            group
                                            border-b
                                            border-slate-100
                                            transition-colors
                                            hover:bg-slate-50/70
                                        "
                                    >
                                        {/* =================================
                                            STAFF MEMBER
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
                                                        border
                                                        border-[#f5e6c8]
                                                        bg-[#fff7e8]
                                                        text-[#c58a27]
                                                    "
                                                >
                                                    <UserRoundCog className="h-4 w-4" />
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
                                                        {item.staffNumber && (
                                                            <span className="inline-flex shrink-0 items-center rounded-md border border-slate-100 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-slate-500">
                                                                {item.staffNumber}
                                                            </span>
                                                        )}
                                                        <p className="text-[11px] text-slate-400">
                                                            Staff registration
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
                                            ACCESS / ROLE
                                        ================================= */}

                                        <TableCell>
                                            <div
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-1.5
                                                    rounded-lg
                                                    border
                                                    border-slate-200
                                                    bg-slate-50
                                                    px-2.5
                                                    py-1.5
                                                "
                                            >
                                                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />

                                                <span className="text-[11px] font-semibold text-slate-600">
                                                    {role}
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
                                                            item.id,
                                                            "STAFF"
                                                        )
                                                    }
                                                    onReject={() =>
                                                        rejectUser(
                                                            item.id,
                                                            "STAFF"
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
