import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
    ArrowUpRight,
    BarChart3,
    Boxes,
    Building2,
    ClipboardList,
    MessageSquare,
    ShieldCheck,
    TicketCheck,
    UserCheck,
} from "lucide-react";

import DashboardCards from "../../components/admin/DashboardCards";
import CasesAnalytics from "../../components/admin/CasesAnalytics";
import RecentCases from "../../components/admin/RecentCases";

const QUICK_ACTIONS = [
    {
        to: "/admin/cases",
        label: "All Cases",
        description: "Track and manage cases",
        icon: TicketCheck,
        tone: "bg-[#edf4fd] text-[#527eb9]",
    },
    {
        to: "/admin/approval",
        label: "User Approvals",
        description: "Review pending users",
        icon: UserCheck,
        tone: "bg-[#fff7e8] text-[#c58a27]",
    },
    {
        to: "/organizations",
        label: "Organizations",
        description: "Manage customer accounts",
        icon: Building2,
        tone: "bg-[#edf7f3] text-[#3b8d73]",
    },
    {
        to: "/reports",
        label: "Reports",
        description: "Performance analytics",
        icon: BarChart3,
        tone: "bg-[#eef1fb] text-[#4d5fa5]",
    },
    {
        to: "/feedback",
        label: "Feedback",
        description: "Customer satisfaction",
        icon: MessageSquare,
        tone: "bg-[#fdf0f0] text-[#c65b5b]",
    },
    {
        to: "/admin/product-service",
        label: "Products & Services",
        description: "Categories and service types",
        icon: Boxes,
        tone: "bg-[#fbf2eb] text-[#b87842]",
    },
];

export default function AdminDashboard() {
    const { user } = useAuth();

    const firstName = user?.firstName || "Administrator";

    return (
        <div className="min-h-full space-y-7">

            {/* =====================================================
                DASHBOARD HERO
            ===================================================== */}
            <section className="relative overflow-hidden rounded-[24px] border border-[#dce4ee] bg-[#0b1b33] text-white shadow-[0_18px_50px_rgba(11,27,51,0.12)]">

                {/* Background atmosphere */}
                <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-[#416da8]/20 blur-[90px]" />
                <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[360px] w-[360px] rounded-full bg-[#668ec4]/10 blur-[100px]" />

                {/* Engineering grid */}
                <div
                    className="
                        pointer-events-none absolute inset-0 opacity-[0.045]
                        [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
                        [background-size:36px_36px]
                    "
                />

                {/* Decorative frame */}
                <div className="pointer-events-none absolute right-[-90px] top-[-90px] h-[300px] w-[300px] rotate-45 border border-white/[0.06]" />
                <div className="pointer-events-none absolute right-[-35px] top-[-35px] h-[210px] w-[210px] rotate-45 border border-white/[0.05]" />

                <div className="relative z-10 flex flex-col justify-between gap-8 px-6 py-7 sm:px-8 sm:py-9 lg:flex-row lg:items-center">

                    <div className="max-w-2xl">

                        <div className="mb-4 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />

                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                                System Operations
                            </span>
                        </div>

                        <h1 className="font-display text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                            Welcome back,{" "}
                            <span className="text-[#91b3df]">
                                {firstName}
                            </span>
                        </h1>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
                            Monitor your support environment, review case activity,
                            and keep partner operations moving from one centralized
                            workspace.
                        </p>

                    </div>

                    <div className="flex shrink-0 items-center gap-3">

                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2.5 backdrop-blur-md">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />

                            <span className="text-[11px] font-semibold text-white/65">
                                Platform operational
                            </span>
                        </div>

                    </div>
                </div>
            </section>

            {/* =====================================================
                KPI SECTION
            ===================================================== */}
            <div>
                <div className="mb-4 flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#567fbd]">
                            Overview
                        </p>

                        <h2 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[#101a28]">
                            Support activity
                        </h2>
                    </div>

                    <div className="hidden items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:flex">
                        <ShieldCheck size={12} />
                        Live platform data
                    </div>
                </div>

                <DashboardCards />
            </div>

            {/* =====================================================
                QUICK ACCESS
            ===================================================== */}
            <div>
                <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#567fbd]">
                        Shortcuts
                    </p>

                    <h2 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[#101a28]">
                        Quick access
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {QUICK_ACTIONS.map((action) => {
                        const Icon = action.icon;

                        return (
                            <Link
                                key={action.to}
                                to={action.to}
                                aria-label={`Open ${action.label}`}
                                className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03),0_8px_24px_rgba(15,23,42,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#527eb9] focus-visible:ring-offset-2"
                            >
                                <span
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.tone}`}
                                >
                                    <Icon size={18} strokeWidth={2} />
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold text-[#101a28]">
                                        {action.label}
                                    </span>

                                    <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                                        {action.description}
                                    </span>
                                </span>

                                <ArrowUpRight
                                    size={16}
                                    className="shrink-0 text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#527eb9]"
                                />
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* =====================================================
                ANALYTICS
            ===================================================== */}
            <div>
                <div className="mb-4 flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#567fbd]">
                            Insights
                        </p>

                        <h2 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[#101a28]">
                            Case workload
                        </h2>
                    </div>

                    <div className="hidden items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:flex">
                        <ClipboardList size={12} />
                        Distribution by status
                    </div>
                </div>

                <CasesAnalytics />
            </div>

            {/* =====================================================
                RECENT CASES
            ===================================================== */}
            <RecentCases />

            {/* =====================================================
                FOOTER SIGNAL
            ===================================================== */}
            <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={12} className="text-[#567fbd]" />
                    MOTI Partner Support Platform
                </div>

                <div className="flex items-center gap-2">
                    <span>Administrative workspace</span>
                    <ArrowUpRight size={11} />
                </div>
            </div>
        </div>
    );
}
