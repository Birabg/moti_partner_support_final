import {
    Plus,
    GitBranch,
    MoreHorizontal,
    Power,
    RefreshCw,
    Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
    getSubcategories,
    toggleSubcategoryStatus,
} from "../../api/productServiceApi";

import SubcategoryModal from "./SubcategoryModal";

export default function SubcategoryTable() {
    const [subcategories, setSubcategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null);

    const load = async () => {
        try {
            setLoading(true);

            const res = await getSubcategories();
            setSubcategories(res.data?.data || []);
        } catch (err) {
            console.log("Load subcategories error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const toggleStatus = async (item) => {
        try {
            setTogglingId(item.id);

            await toggleSubcategoryStatus(item.id, !item.isActive);
            await load();
        } catch (err) {
            console.log(err);
        } finally {
            setTogglingId(null);
        }
    };

    const filteredSubcategories = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return subcategories;

        return subcategories.filter((item) => {
            return (
                item.name?.toLowerCase().includes(query) ||
                item.productCategory?.name
                    ?.toLowerCase()
                    .includes(query)
            );
        });
    }, [subcategories, search]);

    const activeCount = subcategories.filter(
        (item) => item.isActive
    ).length;

    const inactiveCount =
        subcategories.length - activeCount;

    const categoryCount = new Set(
        subcategories
            .map((item) => item.productCategory?.name)
            .filter(Boolean)
    ).size;

    return (
        <div className="space-y-5">
            {/* =====================================================
                HEADER
            ====================================================== */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                        <GitBranch className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                            Product Subcategories
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                            Create and manage detailed product groupings.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" />
                    Add Subcategory
                </button>
            </div>

            {/* =====================================================
                SUMMARY
            ====================================================== */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_3px_18px_-14px_rgba(15,23,42,0.2)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Total Subcategories
                    </p>

                    <p className="mt-1 text-xl font-semibold text-slate-900">
                        {subcategories.length}
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

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_3px_18px_-14px_rgba(15,23,42,0.2)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Categories Used
                    </p>

                    <p className="mt-1 text-xl font-semibold text-slate-900">
                        {categoryCount}
                    </p>
                </div>
            </div>

            {/* =====================================================
                TABLE
            ====================================================== */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_-16px_rgba(15,23,42,0.18)]">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">
                            All Subcategories
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                            {filteredSubcategories.length}{" "}
                            {filteredSubcategories.length === 1
                                ? "subcategory"
                                : "subcategories"}{" "}
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
                                placeholder="Search subcategories..."
                                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white sm:w-60"
                            />
                        </div>

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
                    <table className="w-full min-w-[720px]">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                                    Subcategory
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                                    Parent Category
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
                                                <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
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
                            ) : filteredSubcategories.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-5 py-16 text-center"
                                    >
                                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                            <GitBranch className="h-5 w-5" />
                                        </div>

                                        <p className="mt-3 text-sm font-semibold text-slate-700">
                                            {search
                                                ? "No subcategories found"
                                                : "No subcategories yet"}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {search
                                                ? "Try adjusting your search."
                                                : "Create your first subcategory to get started."}
                                        </p>

                                        {!search && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOpen(true)
                                                }
                                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add Subcategory
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredSubcategories.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="group border-b border-slate-100 transition hover:bg-slate-50/60 last:border-0"
                                    >
                                        {/* Subcategory */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-slate-900 group-hover:text-white">
                                                    <GitBranch className="h-4 w-4" />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {item.name}
                                                    </p>

                                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                                        Product subcategory
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Parent Category */}
                                        <td className="px-5 py-4">
                                            {item.productCategory?.name ? (
                                                <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                    {
                                                        item
                                                            .productCategory
                                                            .name
                                                    }
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-400">
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                    item.isActive
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-500"
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        item.isActive
                                                            ? "bg-emerald-500"
                                                            : "bg-slate-400"
                                                    }`}
                                                />

                                                {item.isActive
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
                                                        toggleStatus(item)
                                                    }
                                                    disabled={
                                                        togglingId ===
                                                        item.id
                                                    }
                                                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                        item.isActive
                                                            ? "border-red-100 bg-white text-red-600 hover:bg-red-50"
                                                            : "border-emerald-100 bg-white text-emerald-600 hover:bg-emerald-50"
                                                    }`}
                                                >
                                                    <Power
                                                        className={`h-3.5 w-3.5 ${
                                                            togglingId ===
                                                            item.id
                                                                ? "animate-pulse"
                                                                : ""
                                                        }`}
                                                    />

                                                    {togglingId === item.id
                                                        ? "Updating..."
                                                        : item.isActive
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
                {!loading && filteredSubcategories.length > 0 && (
                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-5 py-3">
                        <p className="text-[11px] text-slate-400">
                            Showing{" "}
                            <span className="font-semibold text-slate-600">
                                {filteredSubcategories.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-600">
                                {subcategories.length}
                            </span>{" "}
                            subcategories
                        </p>

                        <div className="hidden items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:flex">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active subcategories are available for use
                        </div>
                    </div>
                )}
            </div>

            {/* =====================================================
                MODAL
            ====================================================== */}
            {open && (
                <SubcategoryModal
                    close={() => setOpen(false)}
                    refresh={load}
                />
            )}
        </div>
    );
}
