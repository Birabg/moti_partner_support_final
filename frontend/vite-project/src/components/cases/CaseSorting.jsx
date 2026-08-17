export default function CaseSorting({ sortBy, order, onSortChange }) {
    return (
        <>
            <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value, order)}
                className="rounded-md border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
            >
                <option value="createdAt">Created Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="customer">Customer</option>
            </select>
            <select
                value={order}
                onChange={(e) => onSortChange(sortBy, e.target.value)}
                className="rounded-md border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
            >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
            </select>
        </>
    );
}
