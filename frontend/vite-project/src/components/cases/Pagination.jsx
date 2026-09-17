export default function Pagination({ page, totalPages, onPageChange }) {
    const isFirstPage = page === 1;
    const isLastPage = page === totalPages;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(2, page - maxVisible + 2);
        let end = Math.min(totalPages - 1, page + maxVisible - 2);
        if (end - start < maxVisible - 2) {
            if (start - 1 < maxVisible - 2) end = Math.min(totalPages - 1, start + maxVisible - 3);
            if (end + 1 > totalPages - 1) start = Math.max(2, end - maxVisible + 3);
        }
        pages.push(1);
        if (start > 2) pages.push("...");
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push("...");
        if (totalPages > 1) pages.push(totalPages);
        return pages;
    };

    return (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-slate-500">
                Page{" "}
                <span className="font-semibold text-ink-900">{page}</span>{" "}
                of{" "}
                <span className="font-semibold text-ink-900">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={isFirstPage}
                    onClick={() => onPageChange(page - 1)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition-all duration-200 hover:border-ink-400 hover:bg-ink-50 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink-300 disabled:hover:bg-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                    </svg>
                    Previous
                </button>
                {getPageNumbers().map((p, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => typeof p === "number" && onPageChange(p)}
                        disabled={typeof p !== "number"}
                        className={`h-9 w-9 rounded-lg text-sm font-semibold transition-all duration-200 ${typeof p !== "number" ? "cursor-default text-slate-300" : p === page ? "bg-navy-900 text-white shadow-sm" : "border border-ink-300 bg-white text-ink-700 hover:border-ink-400 hover:bg-ink-50 hover:text-ink-900"}`}
                    >
                        {p}
                    </button>
                ))}
                <button
                    type="button"
                    disabled={isLastPage}
                    onClick={() => onPageChange(page + 1)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition-all duration-200 hover:border-ink-400 hover:bg-ink-50 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink-300 disabled:hover:bg-white"
                >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
