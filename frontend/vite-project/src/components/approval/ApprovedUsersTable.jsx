import { useState, useMemo } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";

const TYPE_FILTERS = ["ALL", "CUSTOMER", "STAFF"];

function ActionButton({ onClick, children, variant = "outline" }) {
    const base = "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors";
    const variants = {
        primary: "bg-navy-900 text-white hover:bg-navy-800",
        success: "bg-emerald-600 text-white hover:bg-emerald-700",
        warning: "bg-amber-600 text-white hover:bg-amber-700",
        outline: "border border-navy-200 text-slate-600 hover:bg-navy-50",
    };
    return (
        <button onClick={onClick} className={`${base} ${variants[variant] || variants.outline}`}>
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

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return [...users]
            .filter((user) => {
                const fullName = `${user.fullName || `${user.firstName || ""} ${user.middleName ?? ""} ${user.lastName || ""}`.trim()}`
                    .replace(/\s+/g, " ")
                    .toLowerCase();

                const matchesSearch =
                    !query ||
                    fullName.includes(query) ||
                    user.email?.toLowerCase().includes(query);

                const matchesType =
                    typeFilter === "ALL" || user.type === typeFilter;

                return matchesSearch && matchesType;
            })
            .sort((a, b) => {
                const left = (a.fullName || `${a.firstName || ""} ${a.middleName ?? ""} ${a.lastName || ""}`.trim()).toLowerCase();
                const right = (b.fullName || `${b.firstName || ""} ${b.middleName ?? ""} ${b.lastName || ""}`.trim()).toLowerCase();
                return left.localeCompare(right);
            });
    }, [users, search, typeFilter]);

    return (
        <div className="rounded-lg border border-navy-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Approved Users</h2>

            <div className="mb-4 flex flex-col justify-end gap-3 sm:flex-row">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-48 rounded-md border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                />

                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-md border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                >
                    {TYPE_FILTERS.map((type) => (
                        <option key={type} value={type}>
                            {type === "ALL" ? "All Types" : type}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-hidden rounded-md border border-navy-100">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="min-w-[220px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-6 text-center text-slate-500">
                                    No users match your search/filter.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium text-slate-900">
                                        {user.firstName} {user.middleName} {user.lastName}
                                    </TableCell>

                                    <TableCell>{user.email}</TableCell>

                                    <TableCell>{user.type}</TableCell>

                                    <TableCell>{user.status}</TableCell>

                                    <TableCell>
                                        <div className="flex flex-wrap gap-1.5">
                                            <ActionButton onClick={() => onViewDetails(user)} variant="primary">
                                                View Details
                                            </ActionButton>

                                            {user.type === "STAFF" && (
                                                <ActionButton onClick={() => onAddPermission(user)} variant="success">
                                                    Add Permission
                                                </ActionButton>
                                            )}
                                            {isSystemAdmin &&
                                                (user.status === "ACTIVE" ? (
                                                    <ActionButton onClick={() => onDeactivate(user.id, user.type)} variant="warning">
                                                        Deactivate
                                                    </ActionButton>
                                                ) : (
                                                    <ActionButton onClick={() => onReactivate(user.id, user.type)} variant="primary">
                                                        Reactivate
                                                    </ActionButton>
                                                ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
