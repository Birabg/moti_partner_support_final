import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getPageItems, STATUS_OPTIONS } from "./StructureTableUtils";

export function StatusFilter({ label = "Filter by status", value, onChange }) {
    return (
        <div
            role="radiogroup"
            aria-label={label}
            className="inline-flex items-center gap-0.5 rounded-xl border border-ink-200 bg-ink-50 p-1"
        >
            {STATUS_OPTIONS.map((option) => {
                const active = value === option.value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(option.value)}
                        className={[
                            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40",
                            active
                                ? "bg-white text-navy-800 shadow-sm shadow-ink-200/70"
                                : "text-ink-500 hover:text-ink-700",
                        ].join(" ")}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

export function Toolbar({ total, filtered, status, onStatusChange, hasExtraFilters, onClear, noun }) {
    const plural = noun + (filtered === 1 ? "" : "s");

    return (
        <div className="flex flex-col gap-3 border-b border-ink-100 px-5 py-3.5 lg:flex-row lg:items-center lg:justify-between">
            <StatusFilter value={status} onChange={onStatusChange} />

            <div className="flex items-center gap-3">
                <span className="text-xs text-ink-500">
                    {filtered === total
                        ? `${total} ${plural}`
                        : `${filtered} of ${total} ${plural}`}
                </span>

                {hasExtraFilters && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold text-navy-600 transition-colors hover:bg-navy-50 hover:text-navy-800"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}

export function Pagination({ start, end, total, page, pageCount, onPageChange, noun = "item" }) {
    const plural = noun + (total === 1 ? "" : "s");

    return (
        <div className="flex flex-col gap-3 border-t border-ink-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink-500">
                Showing{" "}
                <span className="font-semibold text-ink-700">
                    {start}–{end}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-ink-700">{total}</span> {plural}
            </p>

            {pageCount > 1 && (
                <nav aria-label="Pagination" className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 0}
                        aria-label="Previous page"
                        className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Prev</span>
                    </button>

                    {getPageItems(page, pageCount).map((item, index) =>
                        item === "..." ? (
                            <span key={`gap-${index}`} className="px-1.5 text-xs text-ink-500">
                                …
                            </span>
                        ) : (
                            <button
                                key={item}
                                type="button"
                                aria-label={`Page ${item + 1}`}
                                aria-current={item === page ? "page" : undefined}
                                onClick={() => onPageChange(item)}
                                className={[
                                    "min-w-8 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors",
                                    item === page
                                        ? "bg-navy-900 text-white shadow-sm"
                                        : "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
                                ].join(" ")}
                            >
                                {item + 1}
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= pageCount - 1}
                        aria-label="Next page"
                        className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </nav>
            )}
        </div>
    );
}