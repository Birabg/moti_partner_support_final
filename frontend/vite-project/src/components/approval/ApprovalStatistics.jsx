import {
    Clock3,
    UserPlus,
    Users,
    UserCheck,
    ArrowUpRight,
} from "lucide-react";

export default function ApprovalStatistics({
    customers = [],
    staff = [],
    approvedUsers = [],
}) {
    const pendingCustomers = customers.length;
    const pendingStaff = staff.length;
    const totalPending = pendingCustomers + pendingStaff;
    const totalApproved = approvedUsers.length;

    const statistics = [
        {
            label: "Pending Approvals",
            value: totalPending,
            description: "Registrations awaiting review",
            icon: Clock3,
            iconClass: "border border-[#f5e6c8] bg-[#fff7e8] text-[#c58a27]",
            valueClass: "text-slate-950",
            accentClass: "bg-[#c58a27]",
            hoverClass: "group-hover:text-[#c58a27]",
        },
        {
            label: "Pending Customers",
            value: pendingCustomers,
            description: "Customer registrations awaiting approval",
            icon: UserPlus,
            iconClass: "border border-[#dbe7f8] bg-[#edf4fd] text-[#527eb9]",
            valueClass: "text-slate-950",
            accentClass: "bg-[#527eb9]",
            hoverClass: "group-hover:text-[#527eb9]",
        },
        {
            label: "Pending Staff",
            value: pendingStaff,
            description: "Staff registrations awaiting approval",
            icon: Users,
            iconClass: "border border-[#e0e4f4] bg-[#eef1fb] text-[#4d5fa5]",
            valueClass: "text-slate-950",
            accentClass: "bg-[#4d5fa5]",
            hoverClass: "group-hover:text-[#4d5fa5]",
        },
        {
            label: "Approved Users",
            value: totalApproved,
            description: "Users currently in the directory",
            icon: UserCheck,
            iconClass: "border border-[#d2eae2] bg-[#edf7f3] text-[#3b8d73]",
            valueClass: "text-slate-950",
            accentClass: "bg-[#3b8d73]",
            hoverClass: "group-hover:text-[#3b8d73]",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statistics.map((item) => {
                const Icon = item.icon;

                return (
                    <div
                        key={item.label}
                        className="
                            group
                            relative
                            overflow-hidden
                            rounded-[22px]
                            border
                            border-slate-200/80
                            bg-white
                            shadow-[0_1px_3px_rgba(15,23,42,0.03),0_8px_24px_rgba(15,23,42,0.025)]
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            hover:shadow-[0_14px_35px_-18px_rgba(15,23,42,0.25)]
                        "
                    >
                        {/* Bottom accent */}
                        <div
                            className={`
                                absolute
                                bottom-0
                                left-0
                                right-0
                                h-[2px]
                                ${item.accentClass}
                            `}
                        />

                        <div className="p-5">
                            {/* Top row */}
                            <div className="flex items-start justify-between gap-4">
                                <div
                                    className={`
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        ${item.iconClass}
                                    `}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div
                                    className={`
                                        flex
                                        items-center
                                        gap-1
                                        text-[10px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.14em]
                                        text-slate-300
                                        transition-colors
                                        ${item.hoverClass}
                                    `}
                                >
                                    Overview

                                    <ArrowUpRight className="h-3 w-3" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mt-5">
                                <p
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.14em]
                                        text-slate-400
                                    "
                                >
                                    {item.label}
                                </p>

                                <p
                                    className={`
                                        mt-1.5
                                        text-[36px]
                                        font-semibold
                                        leading-none
                                        tracking-[-0.055em]
                                        ${item.valueClass}
                                    `}
                                >
                                    {item.value}
                                </p>

                                <p
                                    className="
                                        mt-1.5
                                        text-xs
                                        leading-5
                                        text-slate-400
                                    "
                                >
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
