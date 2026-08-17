import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

export default function SidebarShell({ items, collapsed, onToggle }) {
    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-navy-100 bg-white transition-all duration-200 ${
                collapsed ? "w-16" : "w-64"
            }`}
        >
            <div className={`flex h-16 items-center gap-3 border-b border-navy-100 px-4 ${collapsed ? "justify-center px-0" : ""}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy-900 text-sm font-bold text-white">
                    M
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">MOTI Partner</p>
                        <p className="truncate text-xs text-slate-400">Support Portal</p>
                    </div>
                )}
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
                {items.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === "/dashboard" || to === "/customer/dashboard" || to === "/support"}
                        title={collapsed ? label : undefined}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                collapsed ? "justify-center px-0" : ""
                            } ${
                                isActive
                                    ? "bg-navy-900 text-white"
                                    : "text-slate-600 hover:bg-navy-50 hover:text-navy-900"
                            }`
                        }
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            <button
                type="button"
                onClick={onToggle}
                className="flex h-11 items-center justify-center gap-2 border-t border-navy-100 text-xs font-medium text-slate-400 hover:bg-navy-50 hover:text-navy-700 transition"
            >
                {collapsed ? <ChevronsRight className="h-4 w-4" /> : (
                    <>
                        <ChevronsLeft className="h-4 w-4" />
                        Collapse
                    </>
                )}
            </button>
        </aside>
    );
}
