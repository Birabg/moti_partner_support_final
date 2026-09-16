import { NavLink } from "react-router-dom";
import {
    ChevronsLeft,
    ChevronsRight,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

export default function SidebarShell({
    items,
    collapsed,
    onToggle,
}) {
    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-50
                flex flex-col
                overflow-hidden
                border-r border-white/[0.08]
                bg-[#08162b]
                text-white
                shadow-[14px_0_40px_rgba(8,22,43,0.08)]
                transition-[width] duration-300 ease-out
                ${collapsed ? "w-16" : "w-64"}
            `}
        >
            {/* =====================================================
                BACKGROUND ATMOSPHERE
            ===================================================== */}
            <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-[#416da8]/15 blur-[80px]" />

            <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#315f9f]/10 blur-[100px]" />

            {/* Engineering grid */}
            <div
                className="
                    pointer-events-none absolute inset-0 opacity-[0.035]
                    [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
                    [background-size:32px_32px]
                "
            />

            {/* =====================================================
                BRAND
            ===================================================== */}
            <div
                className={`
                    relative z-10
                    flex h-[76px] shrink-0
                    items-center
                    border-b border-white/[0.07]
                    ${collapsed ? "justify-center px-0" : "px-4"}
                `}
            >
                <div className="flex items-center gap-3">

                    <div
                        className="
                            flex h-10 w-10 shrink-0
                            items-center justify-center
                            rounded-xl
                            border border-white/10
                            bg-white/[0.08]
                            shadow-[0_10px_30px_rgba(0,0,0,0.16)]
                        "
                    >
                        <span className="font-display text-lg font-extrabold tracking-tight">
                            M
                        </span>
                    </div>

                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="truncate font-display text-[13px] font-bold tracking-tight text-white">
                                MOTI Engineering
                            </p>

                            <div className="mt-0.5 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

                                <p className="truncate text-[9px] font-semibold uppercase tracking-[0.15em] text-white/35">
                                    Partner Support
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* =====================================================
                NAVIGATION
            ===================================================== */}
            <div className="relative z-10 flex min-h-0 flex-1 flex-col">

                {!collapsed && (
                    <div className="px-4 pb-2 pt-6">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">
                            Workspace
                        </p>
                    </div>
                )}

                <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-2.5 pb-4 pt-2">

                    {items.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={
                                to === "/dashboard" ||
                                to === "/customer/dashboard" ||
                                to === "/support" ||
                                to === "/manager/dashboard" ||
                                to === "/director/dashboard"
                            }
                            title={collapsed ? label : undefined}
                            className={({ isActive }) =>
                                `
                                    group relative flex items-center gap-3
                                    rounded-xl
                                    px-3 py-2.5
                                    text-[11px] font-semibold
                                    transition-all duration-200
                                    ${
                                        collapsed
                                            ? "justify-center px-0"
                                            : ""
                                    }
                                    ${
                                        isActive
                                            ? "bg-white/[0.10] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                                            : "text-white/45 hover:bg-white/[0.055] hover:text-white/80"
                                    }
                                `
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Active indicator */}
                                    {isActive && (
                                        <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#8eafd8] shadow-[0_0_10px_rgba(142,175,216,0.5)]" />
                                    )}

                                    <span
                                        className={`
                                            flex h-8 w-8 shrink-0
                                            items-center justify-center
                                            rounded-lg
                                            transition-all duration-200
                                            ${
                                                isActive
                                                    ? "bg-[#8eafd8]/10 text-[#a9c4e6]"
                                                    : "text-white/35 group-hover:bg-white/[0.06] group-hover:text-white/70"
                                            }
                                        `}
                                    >
                                        <Icon className="h-[14px] w-[14px]" />
                                    </span>

                                    {!collapsed && (
                                        <span className="truncate">
                                            {label}
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}

                </nav>

                {/* =================================================
                    SECURITY STATUS
                ================================================= */}
                {!collapsed && (
                    <div className="mx-3 mb-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3.5">

                        <div className="flex items-start gap-3">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-[#8eafd8]">
                                <ShieldCheck size={14} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold text-white/65">
                                    Secure workspace
                                </p>

                                <p className="mt-0.5 text-[9px] leading-4 text-white/30">
                                    Your portal session is protected.
                                </p>
                            </div>

                        </div>
                    </div>
                )}

            </div>

            {/* =====================================================
                COLLAPSE CONTROL
            ===================================================== */}
            <div className="relative z-10 border-t border-white/[0.07] p-2">

                <button
                    type="button"
                    onClick={onToggle}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="
                        flex h-10 w-full
                        items-center justify-center gap-2
                        rounded-xl
                        text-[10px] font-semibold
                        text-white/30
                        transition-all duration-200
                        hover:bg-white/[0.055]
                        hover:text-white/65
                    "
                >
                    {collapsed ? (
                        <ChevronsRight className="h-4 w-4" />
                    ) : (
                        <>
                            <ChevronsLeft className="h-4 w-4" />
                            Collapse navigation
                        </>
                    )}
                </button>

            </div>
        </aside>
    );
}