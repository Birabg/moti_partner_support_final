import {
    Plus,
    Layers3,
    MoreHorizontal,
    Power,
    RefreshCw,
    Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
    getCategories,
    toggleCategoryStatus,
} from "../../api/productServiceApi";

import CategoryModal from "./CategoryModal";

export default function CategoryTable() {
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null);

    const load = async () => {
        try {
            setLoading(true);

            const res = await getCategories();
            setCategories(res.data?.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const toggle = async (item) => {
        try {
            setTogglingId(item.id);

            await toggleCategoryStatus(item.id, !item.isActive);
            await load();
        } catch (err) {
            console.log(err);
        } finally {
            setTogglingId(null);
        }
    };

    const filteredCategories = useMemo(() => {
        const query = search.trim().toLowerCase();

        return categories.filter((category) => {
            const matchesQuery =
                !query ||
                category.name?.toLowerCase().includes(query) ||
                category.brandName?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "active" && category.isActive) ||
                (statusFilter === "inactive" && !category.isActive);

            return matchesQuery && matchesStatus;
        });
    }, [categories, search, statusFilter]);

    const hasActiveFilters =
        Boolean(search.trim()) || statusFilter !== "ALL";

    const activeCount = categories.filter((c) => c.isActive).length;
    const inactiveCount = categories.length - activeCount;

    return (
        <div className="space-y-5">
            {/* =====================================================
                HEADER
            ====================================================== */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                        <Layers3 className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                            Product Categories
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                            Organize and manage your product classification.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" />
                    Add Category
                </button>
            </div>

            {/* =====================================================
                SUMMARY
            ====================================================== */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_3px_18px_-14px_rgba(15,23,42,0.2)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Total Categories
                    </p>

                    <p className="mt-1 text-xl font-semibold text-slate-900">
                        {categories.length}
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
                            All Categories
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                            {filteredCategories.length}{" "}
                            {filteredCategories.length === 1
                                ? "category"
                                : "categories"}{" "}
                            displayed
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search categories..."
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

                        {/* Refresh */}
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

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px]">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                                    Category
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                                    Brand
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
                                Array.from({ length: 4 }).map((_, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-slate-100 last:border-0"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="ml-auto h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-5 py-16 text-center"
                                    >
                                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                            <Layers3 className="h-5 w-5" />
                                        </div>

                                        <p className="mt-3 text-sm font-semibold text-slate-700">
                                            {hasActiveFilters
                                                ? "No categories found"
                                                : "No categories yet"}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {hasActiveFilters
                                                ? "Try adjusting your search or filters."
                                                : "Create your first product category to get started."}
                                        </p>

                                        {!hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={() => setOpen(true)}
                                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add Category
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="group border-b border-slate-100 transition hover:bg-slate-50/60 last:border-0"
                                    >
                                        {/* Category */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-slate-900 group-hover:text-white">
                                                    <Layers3 className="h-4 w-4" />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {category.name}
                                                    </p>

                                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                                        Product category
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Brand */}
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-slate-600">
                                                {category.brandName || "—"}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                    category.isActive
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-500"
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        category.isActive
                                                            ? "bg-emerald-500"
                                                            : "bg-slate-400"
                                                    }`}
                                                />

                                                {category.isActive
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
                                                        toggle(category)
                                                    }
                                                    disabled={
                                                        togglingId ===
                                                        category.id
                                                    }
                                                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                        category.isActive
                                                            ? "border-red-100 bg-white text-red-600 hover:bg-red-50"
                                                            : "border-emerald-100 bg-white text-emerald-600 hover:bg-emerald-50"
                                                    }`}
                                                >
                                                    <Power
                                                        className={`h-3.5 w-3.5 ${
                                                            togglingId ===
                                                            category.id
                                                                ? "animate-pulse"
                                                                : ""
                                                        }`}
                                                    />

                                                    {togglingId ===
                                                    category.id
                                                        ? "Updating..."
                                                        : category.isActive
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
                {!loading && filteredCategories.length > 0 && (
                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-5 py-3">
                        <p className="text-[11px] text-slate-400">
                            Showing{" "}
                            <span className="font-semibold text-slate-600">
                                {filteredCategories.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-600">
                                {categories.length}
                            </span>{" "}
                            categories
                        </p>

                        <div className="hidden items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:flex">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active categories are available for use
                        </div>
                    </div>
                )}
            </div>

            {/* =====================================================
                MODAL
            ====================================================== */}
            {open && (
                <CategoryModal
                    close={() => setOpen(false)}
                    refresh={load}
                />
            )}
        </div>
    );
}
