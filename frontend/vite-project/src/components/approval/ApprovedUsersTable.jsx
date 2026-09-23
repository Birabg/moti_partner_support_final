import { useState, useMemo } from "react";
import {
    Search,
    X,
    Eye,
    KeyRound,
    UserCheck,
    UserX,
    ChevronLeft,
    ChevronRight,
    Inbox,
} from "lucide-react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "../ui/table";

const TYPE_FILTERS = [
    { value: "ALL", label: "All" },
    { value: "CUSTOMER", label: "Customers" },
    { value: "STAFF", label: "Staff" },
];

const STATUS_FILTERS = [
    { value: "ALL", label: "All" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
];

const PAGE_SIZE = 8;

const AVATAR_STYLES = [
    "bg-navy-100 text-navy-700",
    "bg-emerald-100 text-emerald-700",
    "bg-gold-100 text-gold-600",
    "bg-sky-100 text-sky-700",
    "bg-ink-100 text-ink-700",
];

function getFullName(user) {
    return (
        user.fullName ||
        `${user.firstName || ""} ${user.middleName ?? ""} ${user.lastName || ""}`.trim() ||
        ""
    )
        .replace(/\s+/g, " ")
        .trim();
}

function getInitials(name) {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarStyle(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash + name.charCodeAt(i) * (i + 1)) % 997;
    }
    return AVATAR_STYLES[hash % AVATAR_STYLES.length];
}

function formatStatus(status) {
    if (!status) return "Unknown";
    return status
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getPageItems(page, pageCount) {
    if (pageCount <= 7) {
        return Array.from({ length: pageCount }, (_, i) => i);
    }

    const items = [0];
    if (page > 2) items.push("...");

    const start = Math.max(1, page - 1);
    const end = Math.min(pageCount - 2, page + 1);
    for (let i = start; i <= end; i++) items.push(i);

    if (page < pageCount - 3) items.push("...");
    items.push(pageCount - 1);

    return items;
}

function SegmentedFilter({ label, options, value, onChange }) {
    return (
        <div
            role="radiogroup"
            aria-label={label}
            className="inline-flex items-center gap-0.5 rounded-xl border border-ink-200 bg-ink-50 p-1"
        >
            {options.map((option) => {
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

function TypeBadge({ type }) {
    if (type === "STAFF") {
        return (
            <span className="inline-flex items-center rounded-full bg-gold-100 px-2.5 py-1 text-[11px] font-bold tracking-wide text-gold-600">
                Staff
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full bg-navy-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-navy-700">
            Customer
        </span>
    );
}

function StatusBadge({ status }) {
    const active = status === "ACTIVE";

    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide",
                active ? "bg-success-100 text-success-600" : "bg-danger-100 text-danger-600",
            ].join(" ")}
        >
            <span
                className={[
                    "h-1.5 w-1.5 rounded-full",
                    active ? "bg-success-500" : "bg-danger-500",
                ].join(" ")}
            />
            {formatStatus(status)}
        </span>
    );
}

function ActionButton({ onClick, icon: Icon, children, variant = "outline", title }) {
    const base =
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40";

    const variants = {
        outline:
            "border border-ink-200 bg-white text-ink-700 hover:border-navy-300 hover:bg-navy-50 hover:text-navy-700",
        permission:
            "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        deactivate:
            "border border-danger-100 bg-white text-danger-600 hover:bg-danger-100",
        reactivate:
            "border border-navy-200 bg-navy-50 text-navy-700 hover:bg-navy-100",
    };

    return (
        <button
            type="button"
            title={title}
            onClick={(event) => {
                event.stopPropagation();
                onClick(event);
            }}
            className={`${base} ${variants[variant] || variants.outline}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {children}
        </button>
    );
}

export default function ApprovedUsersTable({
    users,
    onViewDetails,
    onAddPermission,
    onDeactivate,
    onReactivate,
    isSystemAdmin,
}) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(0);

    const list = useMemo(() => users ?? [], [users]);
    const hasActiveFilters =
        search.trim() !== "" || typeFilter !== "ALL" || statusFilter !== "ALL";

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return [...list]
            .filter((user) => {
                const fullName = getFullName(user).toLowerCase();

                const matchesSearch =
                    !query ||
                    fullName.includes(query) ||
                    user.email?.toLowerCase().includes(query);

                const matchesType =
                    typeFilter === "ALL" || user.type === typeFilter;

                const isActive = user.status === "ACTIVE";
                const matchesStatus =
                    statusFilter === "ALL" ||
                    (statusFilter === "ACTIVE" && isActive) ||
                    (statusFilter === "INACTIVE" && !isActive);

                return matchesSearch && matchesType && matchesStatus;
            })
            .sort((a, b) => {
                const byName = getFullName(a)
                    .toLowerCase()
                    .localeCompare(getFullName(b).toLowerCase());
                if (byName !== 0) return byName;
                return (a.email || "").localeCompare(b.email || "");
            });
    }, [list, search, typeFilter, statusFilter]);

    const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount - 1);
    const startIndex = currentPage * PAGE_SIZE;
    const pageUsers = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
    const rangeStart = filteredUsers.length === 0 ? 0 : startIndex + 1;
    const rangeEnd = Math.min(startIndex + PAGE_SIZE, filteredUsers.length);

    const clearFilters = () => {
        setSearch("");
        setTypeFilter("ALL");
        setStatusFilter("ALL");
        setPage(0);
    };

    const searchUsers = (value) => {
        setSearch(value);
        setPage(0);
    };

    const changeTypeFilter = (value) => {
        setTypeFilter(value);
        setPage(0);
    };

    const changeStatusFilter = (value) => {
        setStatusFilter(value);
        setPage(0);
    };

    return (
        <div className="flex flex-col bg-white">
            {/* =====================================================
                TOOLBAR
            ====================================================== */}
            <div className="flex flex-col gap-3 border-b border-ink-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:w-80">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => searchUsers(e.target.value)}
                        placeholder="Search by name or email..."
                        aria-label="Search approved users"
                        className="
                            w-full rounded-xl border border-ink-200 bg-white
                            py-2.5 pl-9 pr-9 text-sm text-ink-900
                            placeholder:text-ink-300
                            transition-all
                            hover:border-ink-300
                            focus:border-navy-400 focus:outline-none focus:ring-4 focus:ring-navy-500/10
                        "
                    />
                    {search && (
                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => {
                                searchUsers("");
                            }}
                            className="
                                absolute right-2.5 top-1/2 -translate-y-1/2
                                rounded-md p-1 text-ink-300
                                transition-colors hover:bg-ink-100 hover:text-ink-700
                            "
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="hidden text-xs font-medium text-ink-500 sm:inline">
                        {filteredUsers.length === list.length
                            ? `${list.length} users`
                            : `${filteredUsers.length} of ${list.length} users`}
                    </span>

                    <SegmentedFilter
                        label="Filter by status"
                        options={STATUS_FILTERS}
                        value={statusFilter}
                        onChange={changeStatusFilter}
                    />

                    <SegmentedFilter
                        label="Filter by type"
                        options={TYPE_FILTERS}
                        value={typeFilter}
                        onChange={changeTypeFilter}
                    />

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="
                                inline-flex items-center gap-1 rounded-lg px-2.5 py-2
                                text-xs font-semibold text-navy-600
                                transition-colors hover:bg-navy-50 hover:text-navy-800
                            "
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* =====================================================
                TABLE
            ====================================================== */}
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-5">User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="min-w-[240px] pr-5 text-right">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {pageUsers.length === 0 ? (
                        <TableRow className="hover:bg-transparent">
                            <TableCell
                                colSpan={4}
                                className="px-5 py-14 text-center"
                            >
                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                    <div
                                        className="
                                            mb-3 flex h-12 w-12 items-center justify-center
                                            rounded-2xl border border-ink-200 bg-ink-50
                                        "
                                    >
                                        <Inbox className="h-5 w-5 text-ink-500" />
                                    </div>
                                    <p className="text-sm font-semibold text-ink-700">
                                        No users found
                                    </p>
                                    <p className="mt-1 text-xs text-ink-500">
                                        {list.length === 0
                                            ? "There are no approved users yet."
                                            : "Try adjusting your search or filters."}
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="
                                                mt-4 inline-flex items-center gap-1.5 rounded-lg
                                                border border-ink-200 bg-white px-3 py-2
                                                text-xs font-semibold text-ink-700
                                                transition-colors hover:border-navy-300 hover:bg-navy-50 hover:text-navy-700
                                            "
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        pageUsers.map((user) => {
                            const fullName = getFullName(user) || "Unknown user";

                            return (
                                <TableRow
                                    key={user.id}
                                    className="cursor-pointer"
                                    onClick={() => onViewDetails(user)}
                                >
                                    <TableCell className="pl-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <span
                                                aria-hidden="true"
                                                className={[
                                                    "flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full text-xs font-bold",
                                                    getAvatarStyle(fullName),
                                                ].join(" ")}
                                            >
                                                {getInitials(fullName)}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-semibold text-ink-900">
                                                    {fullName}
                                                </span>
                                                <span className="block truncate text-xs text-ink-500 max-w-[180px] md:max-w-[280px]">
                                                    {user.email || "—"}
                                                </span>
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <TypeBadge type={user.type} />
                                    </TableCell>

                                    <TableCell>
                                        <StatusBadge status={user.status} />
                                    </TableCell>

                                    <TableCell className="pr-5">
                                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                                            <ActionButton
                                                onClick={() => onViewDetails(user)}
                                                icon={Eye}
                                                variant="outline"
                                                title="View user details"
                                            >
                                                View
                                            </ActionButton>

                                            {user.type === "STAFF" && (
                                                <ActionButton
                                                    onClick={() => onAddPermission(user)}
                                                    icon={KeyRound}
                                                    variant="permission"
                                                    title="Grant a permission"
                                                >
                                                    Permission
                                                </ActionButton>
                                            )}

                                            {isSystemAdmin &&
                                                (user.status === "ACTIVE" ? (
                                                    <ActionButton
                                                        onClick={() =>
                                                            onDeactivate(user.id, user.type)
                                                        }
                                                        icon={UserX}
                                                        variant="deactivate"
                                                        title="Deactivate this account"
                                                    >
                                                        Deactivate
                                                    </ActionButton>
                                                ) : (
                                                    <ActionButton
                                                        onClick={() =>
                                                            onReactivate(user.id, user.type)
                                                        }
                                                        icon={UserCheck}
                                                        variant="reactivate"
                                                        title="Reactivate this account"
                                                    >
                                                        Reactivate
                                                    </ActionButton>
                                                ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            {/* =====================================================
                FOOTER / PAGINATION
            ====================================================== */}
            {filteredUsers.length > 0 && (
                <div
                    className="
                        flex flex-col gap-3 border-t border-ink-100
                        px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between
                    "
                >
                    <p className="text-xs text-ink-500">
                        Showing{" "}
                        <span className="font-semibold text-ink-700">
                            {rangeStart}–{rangeEnd}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-ink-700">
                            {filteredUsers.length}
                        </span>{" "}
                        {filteredUsers.length === 1 ? "user" : "users"}
                    </p>

                    {pageCount > 1 && (
                        <nav
                            aria-label="Approved users pagination"
                            className="flex items-center gap-1"
                        >
                            <button
                                type="button"
                                onClick={() => setPage(currentPage - 1)}
                                disabled={currentPage === 0}
                                aria-label="Previous page"
                                className="
                                    inline-flex items-center gap-1 rounded-lg border border-ink-200
                                    bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700
                                    transition-colors hover:bg-ink-50
                                    disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white
                                "
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Prev</span>
                            </button>

                            {getPageItems(currentPage, pageCount).map((item, index) =>
                                item === "..." ? (
                                    <span
                                        key={`gap-${index}`}
                                        className="px-1.5 text-xs text-ink-500"
                                    >
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={item}
                                        type="button"
                                        aria-label={`Page ${item + 1}`}
                                        aria-current={
                                            item === currentPage ? "page" : undefined
                                        }
                                        onClick={() => setPage(item)}
                                        className={[
                                            "min-w-8 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors",
                                            item === currentPage
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
                                onClick={() => setPage(currentPage + 1)}
                                disabled={currentPage >= pageCount - 1}
                                aria-label="Next page"
                                className="
                                    inline-flex items-center gap-1 rounded-lg border border-ink-200
                                    bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700
                                    transition-colors hover:bg-ink-50
                                    disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white
                                "
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </nav>
                    )}
                </div>
            )}
        </div>
    );
}
