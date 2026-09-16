import { useAuth } from "../../context/useAuth";
import {
    ArrowUpRight,
    Building2,
    ClipboardList,
    ShieldCheck,
    Users,
} from "lucide-react";

import DashboardCards from "../../components/admin/DashboardCards";
import CasesAnalytics from "../../components/admin/CasesAnalytics";

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
                ANALYTICS
            ===================================================== */}
            <CasesAnalytics />

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