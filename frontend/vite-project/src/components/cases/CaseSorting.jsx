export default function CaseSorting({ sortBy, order, onSortChange }) {
    return (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative">
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value, order)}
                    className="w-full appearance-none rounded-xl border border-ink-300 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-ink-700 transition-all duration-200 hover:border-ink-400 hover:bg-ink-50 focus:border-navy-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-500/10 sm:w-44"
                >
                    <option value="createdAt">Created Date</option>
                    <option value="priority">Priority</option>
                    <option value="status">Status</option>
                    <option value="customer">Customer</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
            </div>
            <div className="relative">
                <select
                    value={order}
                    onChange={(e) => onSortChange(sortBy, e.target.value)}
                    className="w-full appearance-none rounded-xl border border-ink-300 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-ink-700 transition-all duration-200 hover:border-ink-400 hover:bg-ink-50 focus:border-navy-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-500/10 sm:w-44"
                >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
            </div>
        </div>
    );
}
