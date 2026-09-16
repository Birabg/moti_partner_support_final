export default function Pagination({
    page,
    totalPages,
    onPageChange,
}) {
    const isFirstPage = page === 1;
    const isLastPage = page === totalPages;

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Page information */}
            <p className="text-sm text-slate-500">
                Page{" "}
                <span className="font-semibold text-slate-800">
                    {page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-800">
                    {totalPages}
                </span>
            </p>

            {/* Navigation */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={isFirstPage}
                    onClick={() => onPageChange(page - 1)}
                    className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-slate-600
                        shadow-sm
                        transition-all
                        duration-200
                        hover:border-slate-300
                        hover:bg-slate-50
                        hover:text-slate-900
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                        disabled:hover:border-slate-200
                        disabled:hover:bg-white
                    "
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m15 18-6-6 6-6"
                        />
                    </svg>

                    Previous
                </button>

                <button
                    type="button"
                    disabled={isLastPage}
                    onClick={() => onPageChange(page + 1)}
                    className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-slate-900
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        shadow-sm
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:bg-slate-800
                        hover:shadow-md
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                        disabled:hover:translate-y-0
                        disabled:hover:bg-slate-900
                    "
                >
                    Next

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m9 18 6-6-6-6"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}