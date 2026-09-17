import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function CaseFilters({ onFilter }) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");

    function updateSearch(e) {
        const value = e.target.value;

        setSearch(value);

        onFilter({
            search: value,
            status,
        });
    }

    function updateStatus(e) {
        const value = e.target.value;

        setStatus(value);

        onFilter({
            search,
            status: value,
        });
    }

    return (
        <div
            className="
                flex
                w-full
                flex-col
                gap-2
                sm:flex-row
                sm:items-center
            "
        >

            {/* =====================================================
                SEARCH
            ===================================================== */}

            <div
                className="
                    relative
                    min-w-0
                    flex-1
                "
            >

                <Search
                    size={15}
                    strokeWidth={1.8}
                    className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                    "
                />

                <input
                    type="text"
                    value={search}
                    onChange={updateSearch}
                    placeholder="Search cases..."
                    className="
                        h-9
                        w-full
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        py-2
                        pl-9
                        pr-3
                        text-xs
                        font-medium
                        text-slate-700
                        placeholder:text-slate-400
                        transition-all
                        duration-200
                        hover:border-slate-300
                        focus:border-blue-300
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-50
                    "
                />

            </div>


            {/* =====================================================
                STATUS
            ===================================================== */}

            <div
                className="
                    relative
                    shrink-0
                "
            >

                <SlidersHorizontal
                    size={14}
                    strokeWidth={1.8}
                    className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                    "
                />

                <select
                    value={status}
                    onChange={updateStatus}
                    className="
                        h-9
                        w-full
                        appearance-none
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        py-2
                        pl-9
                        pr-9
                        text-xs
                        font-semibold
                        text-slate-700
                        transition-all
                        duration-200
                        hover:border-slate-300
                        focus:border-blue-300
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-50
                        sm:w-52
                    "
                >

                    <option value="ALL">
                        All statuses
                    </option>

                    <option value="OPEN">
                        Open
                    </option>

                    <option value="IN_PROGRESS">
                        In Progress
                    </option>

                    <option value="ESCALATED">
                        Escalated
                    </option>

                    <option value="PENDING">
                        Pending
                    </option>

                    <option value="AWAITING_CUSTOMER_RESPONSE">
                        Awaiting Customer Response
                    </option>

                    <option value="WAITING_CUSTOMER_FEEDBACK">
                        Awaiting Customer Response
                    </option>

                    <option value="CLOSED">
                        Closed
                    </option>

                    <option value="RESOLVED">
                        Resolved
                    </option>

                </select>


                <ChevronDown
                    size={14}
                    strokeWidth={1.8}
                    className="
                        pointer-events-none
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                    "
                />

            </div>

        </div>
    );
}
