import { useState } from "react";

export default function CaseFilters({ onFilter }) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");

    function updateSearch(e) {
        const value = e.target.value;
        setSearch(value);
        onFilter({ search: value, status });
    }

    function updateStatus(e) {
        const value = e.target.value;
        setStatus(value);
        onFilter({ search, status: value });
    }

    return (
        <>
            <input
                className="min-w-[220px] flex-1 rounded-md border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                placeholder="Search cases..."
                value={search}
                onChange={updateSearch}
            />

            <select
                className="rounded-md border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                value={status}
                onChange={updateStatus}
            >
                <option value="ALL">All Status</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="WAITING_CUSTOMER_FEEDBACK">WAITING CUSTOMER</option>
                <option value="CLOSED">CLOSED</option>
            </select>
        </>
    );
}
