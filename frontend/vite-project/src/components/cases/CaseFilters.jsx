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
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            
            {/* Search */}
            <div className="relative min-w-0 flex-1">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="
                        pointer-events-none
                        absolute
                        left-3.5
                        top-1/2
                        h-4.5
                        w-4.5
                        -translate-y-1/2
                        text-slate-400
                    "
                >
                    <circle cx="11" cy="11" r="7" />
                    <path
                        strokeLinecap="round"
                        d="m20 20-4-4"
                    />
                </svg>

                <input
                    type="text"
                    className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        py-2.5
                        pl-10
                        pr-4
                        text-sm
                        font-medium
                        text-slate-800
                        placeholder:text-slate-400
                        transition-all
                        duration-200
                        hover:border-slate-300
                        hover:bg-white
                        focus:border-slate-400
                        focus:bg-white
                        focus:outline-none
                        focus:ring-2
                        focus:ring-slate-200
                    "
                    placeholder="Search by case number, subject, or customer..."
                    value={search}
                    onChange={updateSearch}
                />
            </div>

            {/* Status filter */}
            <div className="relative shrink-0">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="
                        pointer-events-none
                        absolute
                        left-3.5
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        text-slate-400
                    "
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5h18M6 12h12M10 19h4"
                    />
                </svg>

                <select
                    className="
                        w-full
                        appearance-none
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        py-2.5
                        pl-10
                        pr-10
                        text-sm
                        font-semibold
                        text-slate-700
                        transition-all
                        duration-200
                        hover:border-slate-300
                        hover:bg-white
                        focus:border-slate-400
                        focus:bg-white
                        focus:outline-none
                        focus:ring-2
                        focus:ring-slate-200
                        sm:w-48
                    "
                    value={status}
                    onChange={updateStatus}
                >
                    <option value="ALL">All Status</option>
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="WAITING_CUSTOMER_FEEDBACK">
                        WAITING CUSTOMER
                    </option>
                    <option value="CLOSED">CLOSED</option>
                </select>

                {/* Dropdown arrow */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="
                        pointer-events-none
                        absolute
                        right-3.5
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        text-slate-400
                    "
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m6 9 6 6 6-6"
                    />
                </svg>
            </div>
        </div>
    );
}