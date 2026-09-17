import { Search, X } from "lucide-react";

export default function OrganizationSearch({
    search,
    setSearch,
}) {
    return (
        <div className="relative w-full">
            <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />

            <input
                type="text"
                value={search}
                placeholder="Search organizations..."
                onChange={(e) =>
                    setSearch(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 shadow-[0_4px_16px_-12px_rgba(15,23,42,0.25)] outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />

            {search && (
                <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}
