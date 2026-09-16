import {
    Users,
    UserRoundCog,
    Clock3,
    ArrowUpRight,
} from "lucide-react";

export default function ApprovalStatistics({
    customers = [],
    staff = [],
}) {
    const total = customers.length + staff.length;

    const statistics = [
        {
            label: "Pending Customers",
            value: customers.length,
            description: "Customer registrations awaiting approval",
            icon: Users,
            iconClass: "bg-blue-50 text-blue-600",
            valueClass: "text-blue-600",
            borderClass: "border-blue-500",
        },
        {
            label: "Pending Staff",
            value: staff.length,
            description: "Staff registrations awaiting approval",
            icon: UserRoundCog,
            iconClass: "bg-amber-50 text-amber-600",
            valueClass: "text-amber-600",
            borderClass: "border-amber-500",
        },
        {
            label: "Total Pending",
            value: total,
            description: "All registrations requiring review",
            icon: Clock3,
            iconClass: "bg-slate-100 text-slate-600",
            valueClass: "text-slate-900",
            borderClass: "border-slate-900",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {statistics.map((item) => {
                const Icon = item.icon;

                return (
                    <div
                        key={item.label}
                        className={`
                            group
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)]
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            hover:shadow-[0_12px_30px_-15px_rgba(15,23,42,0.22)]
                        `}
                    >
                        {/* Bottom accent */}
                        <div
                            className={`
                                absolute
                                bottom-0
                                left-0
                                right-0
                                h-[2px]
                                ${item.borderClass}
                            `}
                        />

                        <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div
                                    className={`
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        ${item.iconClass}
                                    `}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                                    Overview
                                    <ArrowUpRight className="h-3 w-3" />
                                </div>
                            </div>

                            <div className="mt-5">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    {item.label}
                                </p>

                                <p
                                    className={`
                                        mt-2
                                        text-3xl
                                        font-semibold
                                        tracking-tight
                                        ${item.valueClass}
                                    `}
                                >
                                    {item.value}
                                </p>

                                <p className="mt-1.5 text-xs text-slate-400">
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