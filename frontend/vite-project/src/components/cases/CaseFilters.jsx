import { Search, SlidersHorizontal, ChevronDown, Flag } from "lucide-react";
import { useState } from "react";

const selectClass = `
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
`;

const iconClass = `
    pointer-events-none
    absolute
    left-3
    top-1/2
    -translate-y-1/2
    text-slate-400
`;

const chevronClass = `
    pointer-events-none
    absolute
    right-3
    top-1/2
    -translate-y-1/2
    text-slate-400
`;

export default function CaseFilters({ onFilter }) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [priority, setPriority] = useState("ALL");

    function emit(overrides) {
        onFilter({
            search,
            status,
            priority,
            ...overrides,
        });
    }

    function updateSearch(e) {
        const value = e.target.value;

        setSearch(value);

        emit({ search: value });
    }

    function updateStatus(e) {
        const value = e.target.value;

        setStatus(value);

        emit({ status: value });
    }

    function updatePriority(e) {
        const value = e.target.value;

        setPriority(value);

        emit({ priority: value });
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
                    className={iconClass}
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
                    className={iconClass}
                />

                <select
                    value={status}
                    onChange={updateStatus}
                    className={selectClass + " sm:w-44"}
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

                    <option value="CLOSED">
                        Closed
                    </option>

                    <option value="RESOLVED">
                        Resolved
                    </option>

                    <option value="CANCELLED">
                        Cancelled
                    </option>

                </select>


                <ChevronDown
                    size={14}
                    strokeWidth={1.8}
                    className={chevronClass}
                />

            </div>


            {/* =====================================================
                PRIORITY
            ===================================================== */}

            <div
                className="
                    relative
                    shrink-0
                "
            >

                <Flag
                    size={14}
                    strokeWidth={1.8}
                    className={iconClass}
                />

                <select
                    value={priority}
                    onChange={updatePriority}
                    className={selectClass + " sm:w-40"}
                >

                    <option value="ALL">
                        All priorities
                    </option>

                    <option value="URGENT">
                        Urgent
                    </option>

                    <option value="HIGH">
                        High
                    </option>

                    <option value="MEDIUM">
                        Medium
                    </option>

                    <option value="LOW">
                        Low
                    </option>

                </select>


                <ChevronDown
                    size={14}
                    strokeWidth={1.8}
                    className={chevronClass}
                />

            </div>

        </div>
    );
}
