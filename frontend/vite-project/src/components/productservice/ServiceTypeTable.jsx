import {
    Plus,
    Wrench,
    MoreHorizontal,
    Power,
    RefreshCw,
    Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
    getServiceTypes,
    toggleServiceTypeStatus,
} from "../../api/productServiceApi";

import ServiceTypeModal from "./ServiceTypeModal";

export default function ServiceTypeTable() {
    const [services, setServices] = useState([]);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null);

    const load = async () => {
        try {
            setLoading(true);

            const res = await getServiceTypes();
            setServices(res.data?.data || []);
        } catch (err) {
            console.log("Load service types error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const toggle = async (service) => {
        try {
            setTogglingId(service.id);

            await toggleServiceTypeStatus(
                service.id,
                !service.isActive
            );

            await load();
        } catch (err) {
            console.log(err);
        } finally {
            setTogglingId(null);
        }
    };

    const filteredServices = useMemo(() => {
        const query = search.trim().toLowerCase();

        return services.filter((service) => {
            const matchesQuery =
                !query ||
                service.name?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "active" && service.isActive) ||
                (statusFilter === "inactive" && !service.isActive);

            return matchesQuery && matchesStatus;
        });
    }, [services, search, statusFilter]);

    const hasActiveFilters =
        Boolean(search.trim()) || statusFilter !== "ALL";

    const activeCount = services.filter(
        (service) => service.isActive
    ).length;

    const inactiveCount = services.length - activeCount;

    return (
        <div className="space-y-5">
            {/* =====================================================
                HEADER
            ====================================================== */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                        <Wrench className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                            Service Types
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                            Manage the types of services available to your partners.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" />
                    Add Service Type
                </button>
            </div>

            {/* =====================================================
                SUMMARY
            ====================================================== */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_3px_18px_-14px_rgba(15,23,42,0.2)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Total Services
                    </p>

                    <p className="mt-1 text-xl font-semibold text-slate-900">
                        {services.length}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_3px_18px_-14px_rgba(15,23,42,0.2)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Active
                    </p>

                    <p className="mt-1 text-xl font-semibold text-emerald-600">
                        {activeCount}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_3px_18px_-14px_rgba(15,23,42,0.2)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Inactive
                    </p>

                    <p className="mt-1 text-xl font-semibold text-slate-500">
                        {inactiveCount}
                    </p>
                </div>
            </div>

            {/* =====================================================
                TABLE CONTAINER
            ====================================================== */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_-16px_rgba(15,23,42,0.18)]">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">
                            All Service Types
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                            {filteredServices.length}{" "}
                            {filteredServices.length === 1
                                ? "service type"
                                : "service types"}{" "}
                            displayed
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search services..."
                                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white sm:w-56"
                            />
                        </div>

                        {/* Status filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-600 outline-none transition focus:border-slate-400 focus:bg-white"
                        >
                            <option value="ALL">All statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        {/* Clear filters */}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("ALL");
                                }}
                                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                                title="Clear filters"
                            >
                                Clear
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={load}
                            disabled={loading}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    loading ? "animate-spin" : ""
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* =================================================
                    TABLE
                ================================================== */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px]">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                                    Service Type
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                Array.from({ length: 4 }).map(
                                    (_, index) => (
                                        <tr
                                            key={index}
                                            className="border-b border-slate-100 last:border-0"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="ml-auto h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-5 py-16 text-center"
                                    >
                                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                            <Wrench className="h-5 w-5" />
                                        </div>

                                        <p className="mt-3 text-sm font-semibold text-slate-700">
                                            {hasActiveFilters
                                                ? "No service types found"
                                                : "No service types yet"}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {hasActiveFilters
                                                ? "Try adjusting your search or filters."
                                                : "Create your first service type to get started."}
                                        </p>

                                        {!hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOpen(true)
                                                }
                                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add Service Type
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map((service) => (
                                    <tr
                                        key={service.id}
                                        className="group border-b border-slate-100 transition hover:bg-slate-50/60 last:border-0"
                                    >
                                        {/* Service */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-slate-900 group-hover:text-white">
                                                    <Wrench className="h-4 w-4" />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {service.name}
                                                    </p>

                                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                                        Available service
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                    service.isActive
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-500"
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        service.isActive
                                                            ? "bg-emerald-500"
                                                            : "bg-slate-400"
                                                    }`}
                                                />

                                                {service.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        {/* Action */}
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggle(service)
                                                    }
                                                    disabled={
                                                        togglingId ===
                                                        service.id
                                                    }
                                                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                        service.isActive
                                                            ? "border-red-100 bg-white text-red-600 hover:bg-red-50"
                                                            : "border-emerald-100 bg-white text-emerald-600 hover:bg-emerald-50"
                                                    }`}
                                                >
                                                    <Power
                                                        className={`h-3.5 w-3.5 ${
                                                            togglingId ===
                                                            service.id
                                                                ? "animate-pulse"
                                                                : ""
                                                        }`}
                                                    />

                                                    {togglingId ===
                                                    service.id
                                                        ? "Updating..."
                                                        : service.isActive
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 sm:flex"
                                                    title="More options"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {!loading && filteredServices.length > 0 && (
                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-5 py-3">
                        <p className="text-[11px] text-slate-400">
                            Showing{" "}
                            <span className="font-semibold text-slate-600">
                                {filteredServices.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-600">
                                {services.length}
                            </span>{" "}
                            service types
                        </p>

                        <div className="hidden items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:flex">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active services are available for use
                        </div>
                    </div>
                )}
            </div>

            {/* =====================================================
                MODAL
            ====================================================== */}
            {open && (
                <ServiceTypeModal
                    close={() => setOpen(false)}
                    refresh={load}
                />
            )}
        </div>
    );
}
