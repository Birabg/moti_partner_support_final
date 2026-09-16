import {
    FaClipboardList,
    FaFolderOpen,
    FaSpinner,
    FaClock,
    FaExclamationTriangle,
    FaCheckCircle,
    FaUserClock,
    FaLock,
} from "react-icons/fa";

const STAT_CONFIG = [
    {
        key: "total",
        title: "Total Cases",
        status: null,
        icon: FaClipboardList,
        iconBg: "bg-slate-100",
        iconText: "text-slate-700",
        accent: "bg-slate-900",
    },
    {
        key: "open",
        title: "Open",
        status: "OPEN",
        icon: FaFolderOpen,
        iconBg: "bg-blue-50",
        iconText: "text-blue-600",
        accent: "bg-blue-500",
    },
    {
        key: "inProgress",
        title: "In Progress",
        status: "IN_PROGRESS",
        icon: FaSpinner,
        iconBg: "bg-indigo-50",
        iconText: "text-indigo-600",
        accent: "bg-indigo-500",
    },
    {
        key: "pending",
        title: "Pending",
        status: "PENDING",
        icon: FaClock,
        iconBg: "bg-amber-50",
        iconText: "text-amber-600",
        accent: "bg-amber-500",
    },
    {
        key: "escalated",
        title: "Escalated",
        status: "ESCALATED",
        icon: FaExclamationTriangle,
        iconBg: "bg-red-50",
        iconText: "text-red-600",
        accent: "bg-red-500",
    },
    {
        key: "resolved",
        title: "Resolved",
        status: "RESOLVED",
        icon: FaCheckCircle,
        iconBg: "bg-emerald-50",
        iconText: "text-emerald-600",
        accent: "bg-emerald-500",
    },
    {
        key: "customerConfirmation",
        title: "Awaiting Customer",
        status: "CUSTOMER_CONFIRMATION",
        icon: FaUserClock,
        iconBg: "bg-violet-50",
        iconText: "text-violet-600",
        accent: "bg-violet-500",
    },
    {
        key: "closed",
        title: "Closed",
        status: "CLOSED",
        icon: FaLock,
        iconBg: "bg-slate-100",
        iconText: "text-slate-600",
        accent: "bg-slate-500",
    },
];

export default function CaseStats({
    cases = [],
    onStatusClick,
}) {
    const countBy = (status) =>
        cases.filter((item) => item.status === status).length;

    const stats = {
        total: cases.length,
        open: countBy("OPEN"),
        inProgress: countBy("IN_PROGRESS"),
        pending: countBy("PENDING"),
        escalated: countBy("ESCALATED"),
        resolved: countBy("RESOLVED"),
        customerConfirmation: countBy("CUSTOMER_CONFIRMATION"),
        closed: countBy("CLOSED"),
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CONFIG.map((item) => (
                <StatCard
                    key={item.key}
                    title={item.title}
                    value={stats[item.key]}
                    icon={item.icon}
                    accent={item.accent}
                    iconBg={item.iconBg}
                    iconText={item.iconText}
                    onClick={() => onStatusClick?.(item.status)}
                />
            ))}
        </div>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
    accent,
    iconBg,
    iconText,
    onClick,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
            {/* Accent */}
            <div
                className={`absolute left-0 top-0 h-1 w-full ${accent}`}
            />

            <div className="flex items-start justify-between gap-3">

                {/* Text */}
                <div className="min-w-0">

                    <p className="text-xs font-medium text-slate-500 truncate">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>

                </div>

                {/* Icon */}
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconText} transition-transform duration-200 group-hover:scale-105`}
                >
                    <Icon className="text-sm" />
                </div>

            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">

                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                    View cases
                </span>

                <span className="text-sm text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all duration-200">
                    →
                </span>

            </div>

        </button>
    );
}