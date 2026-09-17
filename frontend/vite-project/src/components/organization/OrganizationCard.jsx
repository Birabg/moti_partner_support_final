import { Link } from "react-router-dom";
import {
    Building2,
    Users,
    ArrowUpRight,
    Power,
} from "lucide-react";

export default function OrganizationCard({
    organization,
    onDeactivate,
    onReactivate,
}) {
    const customerCount =
        organization._count?.customers || 0;

    const isActive = organization.isActive;

    return (
        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_-18px_rgba(15,23,42,0.28)]">

            {/* =================================================
                TOP
            ================================================== */}
            <div className="p-5">

                <div className="flex items-start justify-between gap-4">

                    {/* Organization identity */}
                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-slate-900 group-hover:text-white">
                            <Building2 className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <h3 className="truncate text-[15px] font-semibold text-slate-900">
                                {organization.name}
                            </h3>

                            <p className="mt-0.5 text-xs text-slate-400">
                                Customer Organization
                            </p>
                        </div>
                    </div>

                    {/* Status */}
                    <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                            isActive
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-600"
                        }`}
                    >
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                isActive
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                            }`}
                        />

                        {isActive
                            ? "Active"
                            : "Inactive"}
                    </span>
                </div>

                {/* =================================================
                    STAT
                ================================================== */}
                <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">

                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                            <Users className="h-4 w-4" />
                        </div>

                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                Customers
                            </p>

                            <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                {customerCount}
                            </p>
                        </div>
                    </div>

                    <span className="text-xs text-slate-300">
                        Registered
                    </span>
                </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================== */}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">

                <Link
                    to={`/organizations/${organization.id}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                    View Details

                    <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>

                {isActive ? (
                    <button
                        type="button"
                        onClick={() =>
                            onDeactivate(
                                organization.id
                            )
                        }
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                        <Power className="h-3.5 w-3.5" />
                        Deactivate
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() =>
                            onReactivate(
                                organization.id
                            )
                        }
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
                    >
                        <Power className="h-3.5 w-3.5" />
                        Reactivate
                    </button>
                )}
            </div>

            {/* Bottom accent */}
            <div
                className={`h-[2px] ${
                    isActive
                        ? "bg-emerald-100"
                        : "bg-red-100"
                }`}
            />
        </div>
    );
}
