import {
    Building2,
    CheckCircle2,
    CircleOff,
    Users,
} from "lucide-react";

export default function OrganizationStatistics({
    organizations = [],
}) {
    const total = organizations.length;

    const active = organizations.filter(
        (item) => item.isActive
    ).length;

    const inactive = organizations.filter(
        (item) => !item.isActive
    ).length;

    const customers = organizations.reduce(
        (total, item) =>
            total + (item._count?.customers || 0),
        0
    );

    const statistics = [
        {
            label: "Total Organizations",
            value: total,
            description: "All registered organizations",
            icon: Building2,
            iconClass: "bg-blue-50 text-blue-600",
            valueClass: "text-slate-900",
        },
        {
            label: "Active Organizations",
            value: active,
            description: "Currently active organizations",
            icon: CheckCircle2,
            iconClass: "bg-emerald-50 text-emerald-600",
            valueClass: "text-emerald-600",
        },
        {
            label: "Inactive Organizations",
            value: inactive,
            description: "Temporarily inactive organizations",
            icon: CircleOff,
            iconClass: "bg-amber-50 text-amber-600",
            valueClass: "text-amber-600",
        },
        {
            label: "Total Customers",
            value: customers,
            description: "Customers across all organizations",
            icon: Users,
            iconClass: "bg-violet-50 text-violet-600",
            valueClass: "text-violet-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statistics.map((item) => {
                const Icon = item.icon;

                return (
                    <div
                        key={item.label}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-15px_rgba(15,23,42,0.22)]"
                    >
                        <div className="p-5">
                            <div className="flex items-start justify-between">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconClass}`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>

                                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                                    Overview
                                </span>
                            </div>

                            <div className="mt-5">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    {item.label}
                                </p>

                                <p
                                    className={`mt-2 text-3xl font-semibold tracking-tight ${item.valueClass}`}
                                >
                                    {item.value}
                                </p>

                                <p className="mt-1.5 text-xs text-slate-400">
                                    {item.description}
                                </p>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 transition-colors group-hover:bg-slate-200" />
                    </div>
                );
            })}
        </div>
    );
}
