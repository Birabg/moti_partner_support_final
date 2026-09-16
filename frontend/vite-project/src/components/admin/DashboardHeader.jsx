import {
    Activity,
    CalendarDays,
    LayoutDashboard,
} from "lucide-react";

export default function DashboardHeader() {
    return (
        <header className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">
            {/* Subtle decorative glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-500/[0.045] blur-3xl"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-indigo-500/[0.035] blur-3xl"
            />

            <div className="relative flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                {/* Left side */}
                <div className="flex min-w-0 items-start gap-4">
                    {/* Icon */}
                    <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm sm:flex">
                        <LayoutDashboard
                            className="h-5 w-5"
                            strokeWidth={2}
                        />
                    </div>

                    <div className="min-w-0">
                        {/* Eyebrow */}
                        <div className="mb-2 flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                                Support Portal
                            </span>

                            <span className="h-1 w-1 rounded-full bg-slate-300" />

                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </span>

                                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Online
                                </span>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-[28px]">
                            Dashboard
                        </h1>

                        {/* Subtitle */}
                        <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
                            Monitor support activity, cases, organizations, and
                            user approvals from one place.
                        </p>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex shrink-0 items-center gap-3">
                    {/* System status */}
                    <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                            <Activity
                                className="h-4 w-4"
                                strokeWidth={2}
                            />
                        </div>

                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                System
                            </p>

                            <p className="mt-0.5 text-xs font-semibold text-slate-700">
                                Operational
                            </p>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                            <CalendarDays
                                className="h-4 w-4"
                                strokeWidth={2}
                            />
                        </div>

                        <div className="hidden xs:block sm:block">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                Today
                            </p>

                            <p className="mt-0.5 text-xs font-semibold text-slate-700">
                                {new Date().toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom accent */}
            <div
                aria-hidden="true"
                className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"
            />
        </header>
    );
}