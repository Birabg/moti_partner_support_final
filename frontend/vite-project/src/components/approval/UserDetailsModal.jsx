import { useState } from "react";
import {
    BadgeCheck,
    BriefcaseBusiness,
    CalendarDays,
    Eye,
    KeyRound,
    ShieldCheck,
    UserRound,
    X,
} from "lucide-react";
import Button from "../ui/Button";
import { Input } from "../ui/Field";

const getUserName = (user) =>
    user.fullName ||
    `${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""}`.trim() ||
    user.email ||
    "User";

const getUserNumber = (user) =>
    (user.type === "STAFF" ? user.staffNumber : user.memberNumber) ||
    user.staffNumber ||
    user.memberNumber ||
    "";

const formatLabel = (value) =>
    String(value || "")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const getRoles = (user) => {
    const roles = [];
    if (user.isSAdmin || user.role === "SYSTEM_ADMIN") roles.push("System Administrator");
    if (user.isDirector || user.role === "DIRECTOR") roles.push("Director");
    if (user.isManager || user.managerType) roles.push("Manager");
    if (user.isPSsupport || user.role === "PS_SUPPORT") roles.push("Support Staff");
    if (roles.length === 0 && user.role) roles.push(formatLabel(user.role));
    return roles;
};

const getPermissionList = (user) => {
    const candidates = [
        user.permissions,
        user.staffPermissions?.map((entry) => entry.permission || entry),
    ];

    for (const candidate of candidates) {
        if (!Array.isArray(candidate) || candidate.length === 0) continue;

        const mapped = candidate.map((entry) => {
            if (typeof entry === "string") return { name: formatLabel(entry), code: entry };
            if (entry && typeof entry === "object") {
                return {
                    name: entry.name || formatLabel(entry.code || entry.permissionCode || ""),
                    code: entry.code || entry.permissionCode || "",
                };
            }
            return null;
        });

        return mapped.filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
    }

    return [];
};

function MetaItem({ icon: Icon, label, value }) {
    return (
        <div className="rounded-xl border border-ink-100 bg-ink-50/50 px-3.5 py-3">
            <div className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-ink-400" />
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">
                    {label}
                </span>
            </div>
            <p className="mt-1.5 text-xs font-semibold text-ink-900">
                {value || "—"}
            </p>
        </div>
    );
}

function StatusBadge({ status }) {
    const active = status === "ACTIVE";

    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                active
                    ? "border-[#d2eae2] bg-[#edf7f3] text-[#3b8d73]"
                    : "border-slate-200 bg-slate-100 text-slate-600",
            ].join(" ")}
        >
            <span
                className={[
                    "h-1.5 w-1.5 rounded-full",
                    active ? "bg-[#3b8d73]" : "bg-slate-400",
                ].join(" ")}
            />
            {formatLabel(status) || "Unknown"}
        </span>
    );
}

function TypeBadge({ type }) {
    const isStaff = type === "STAFF";

    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                isStaff
                    ? "border-[#f5e6c8] bg-[#fff7e8] text-[#c58a27]"
                    : "border-[#dbe7f8] bg-[#edf4fd] text-[#527eb9]",
            ].join(" ")}
        >
            <span
                className={[
                    "h-1.5 w-1.5 rounded-full",
                    isStaff ? "bg-[#c58a27]" : "bg-[#527eb9]",
                ].join(" ")}
            />
            {isStaff ? "Staff" : "Customer"}
        </span>
    );
}

function NumberBadge({ number }) {
    if (!number) return null;

    return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] font-semibold tracking-wide text-slate-600">
            {number}
        </span>
    );
}

export default function UserDetailsModal({
    user,
    onClose,
    onSave,
}) {
    const [form, setForm] = useState({
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        position: user.position || "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]:
                e.target.value,
        });
    };

    const handleSave = () => {
        const payload = {
            firstName: form.firstName,
            middleName: form.middleName,
            lastName: form.lastName,
            phoneNumber: form.phoneNumber,
        };

        if (user.type === "CUSTOMER") {
            payload.position = form.position;
        }

        onSave(user.id, payload);
    };

    const roles = getRoles(user);
    const permissions = getPermissionList(user);
    const name = getUserName(user);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1b33]/60 px-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl transform overflow-y-auto rounded-2xl bg-white shadow-[0_20px_60px_rgba(11,27,51,0.2)]">
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-2xl border-b border-ink-100 bg-white px-6 py-5">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dbe7f8] bg-[#edf4fd]">
                            <Eye className="h-5 w-5 text-[#527eb9]" />
                        </span>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-bold tracking-tight text-ink-900">
                                    User Details
                                </h2>
                                <NumberBadge number={getUserNumber(user)} />
                                <TypeBadge type={user.type} />
                                <StatusBadge status={user.status} />
                            </div>
                            <p className="mt-0.5 truncate text-sm text-ink-500">
                                {name} · {user.email || "no email"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5">
                    <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.18em] text-ink-400">
                        Account summary
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <MetaItem
                            icon={UserRound}
                            label="Account type"
                            value={user.type === "STAFF" ? "Staff member" : "Customer"}
                        />

                        <MetaItem
                            icon={CalendarDays}
                            label="Member since"
                            value={formatDate(user.createdAt)}
                        />

                        {user.type === "STAFF" && (
                            <MetaItem
                                icon={BriefcaseBusiness}
                                label="Role / Access level"
                                value={roles.join(", ") || "Staff"}
                            />
                        )}

                        <MetaItem
                            icon={ShieldCheck}
                            label={user.type === "STAFF" ? "Staff number" : "Member number"}
                            value={getUserNumber(user) || "—"}
                        />
                    </div>

                    <p className="mb-3 mt-6 text-[9px] font-bold uppercase tracking-[0.18em] text-ink-400">
                        Personal information
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Input
                                label="Email"
                                value={user.email || ""}
                                disabled
                                placeholder="Email address"
                            />
                        </div>

                        <Input
                            name="firstName"
                            label="First name"
                            value={form.firstName}
                            onChange={handleChange}
                            placeholder="First name"
                        />

                        <Input
                            name="middleName"
                            label="Middle name"
                            value={form.middleName}
                            onChange={handleChange}
                            placeholder="Middle name"
                        />

                        <Input
                            name="lastName"
                            label="Last name"
                            value={form.lastName}
                            onChange={handleChange}
                            placeholder="Last name"
                        />

                        <Input
                            name="phoneNumber"
                            label="Phone number"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            placeholder="Phone number"
                        />

                        {user.type === "CUSTOMER" ? (
                            <Input
                                name="position"
                                label="Position / Job title"
                                value={form.position}
                                onChange={handleChange}
                                placeholder="Position / job title"
                            />
                        ) : (
                            <Input
                                label="Department"
                                value={user.departmentName || user.section?.department?.name || ""}
                                disabled
                                placeholder="—"
                            />
                        )}
                    </div>

                    {user.type === "STAFF" && (
                        <>
                            <p className="mb-3 mt-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-ink-400">
                                <KeyRound className="h-3 w-3 text-ink-400" />
                                Granted permissions ({permissions.length})
                            </p>

                            {permissions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {permissions.map((permission) => (
                                        <span
                                            key={permission.code || permission.name}
                                            title={permission.code}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-[#d2eae2] bg-[#edf7f3] px-3 py-1.5 text-xs font-semibold text-[#3b8d73]"
                                        >
                                            <BadgeCheck className="h-3 w-3 shrink-0 text-[#3b8d73]" />
                                            {permission.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-ink-100 bg-ink-50/70 px-4 py-3 text-xs text-ink-500">
                                    No extra permissions granted yet.
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="sticky bottom-0 flex justify-end gap-3 rounded-b-2xl border-t border-ink-100 bg-white px-6 py-4">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSave}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}