import { useEffect, useState } from "react";
import {
    BadgeCheck,
    BriefcaseBusiness,
    CalendarDays,
    Eye,
    KeyRound,
    ShieldCheck,
    UserRound,
    X,
    PlusCircle,
    Trash2,
    Building2,
    Layers,
    Users,
    Crown,
    HelpCircle,
} from "lucide-react";
import Button from "../ui/Button";
import { Input, Select } from "../ui/Field";
import { RoleApi } from "../../api/roleApi";
import { directorApi } from "../../api/directorApi";

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
    if (user.isSAdmin || user.role === "SYSTEM_ADMIN") roles.push({ key: "SYSTEM_ADMIN", label: "System Administrator" });
    if (user.isDirector || user.role === "DIRECTOR") roles.push({ key: "DIRECTOR", label: "Director" });
    if (user.isManager || user.managerType) roles.push({ key: "MANAGER", label: "Manager", managerType: user.managerType });
    if (user.isPSsupport || user.role === "PS_SUPPORT") roles.push({ key: "PS_SUPPORT", label: "Support Staff" });
    if (roles.length === 0 && user.role) roles.push({ key: user.role, label: formatLabel(user.role) });
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

const ROLE_OPTIONS = [
    { value: "MANAGER", label: "Manager", description: "Manages a department, division, or section", icon: Users },
    { value: "PS_SUPPORT", label: "Support Staff", description: "Handles support cases in a specific section", icon: HelpCircle },
    { value: "SYSTEM_ADMIN", label: "System Administrator", description: "Full system access and user management", icon: Crown },
    { value: "DIRECTOR", label: "Director", description: "Executive oversight across the organization", icon: Building2 },
];

const MANAGER_TYPES = [
    { value: "DEPARTMENT", label: "Department Manager", description: "Manages an entire department" },
    { value: "DIVISION", label: "Division Manager", description: "Manages a division within a department" },
    { value: "SECTION", label: "Section Manager", description: "Manages a specific section" },
];

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

function RoleBadge({ role, managerType, onRemove, disabled }) {
    const config = {
        SYSTEM_ADMIN: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", icon: Crown },
        DIRECTOR: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", icon: Building2 },
        MANAGER: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", icon: Users },
        PS_SUPPORT: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", icon: HelpCircle },
    };

    const current = config[role] || config.PS_SUPPORT;
    const Icon = current.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${current.bg} ${current.text} ${current.border}`}>
            <Icon className="h-3 w-3 shrink-0" />
            {role === "MANAGER" && managerType ? `${role} (${managerType})` : role}
            {!disabled && onRemove && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="ml-1 p-0.5 rounded hover:bg-black/10 transition"
                    aria-label={`Remove ${role} role`}
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            )}
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

    const [roles, setRoles] = useState(getRoles(user));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [departments, setDepartments] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [sections, setSections] = useState([]);

    const [assignRoleForm, setAssignRoleForm] = useState({
        role: "",
        managerType: "",
        departmentId: "",
        divisionId: "",
        sectionId: "",
    });

    const [showAssignRole, setShowAssignRole] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleAssignRoleChange = (e) => {
        const { name, value } = e.target;
        setAssignRoleForm((prev) => ({ ...prev, [name]: value }));

        if (name === "role") {
            setAssignRoleForm((prev) => ({
                ...prev,
                managerType: "",
                departmentId: "",
                divisionId: "",
                sectionId: "",
            }));
        }
        if (name === "managerType") {
            setAssignRoleForm((prev) => ({
                ...prev,
                departmentId: "",
                divisionId: "",
                sectionId: "",
            }));
        }
        if (name === "departmentId") {
            setAssignRoleForm((prev) => ({
                ...prev,
                divisionId: "",
                sectionId: "",
            }));
            loadDivisions(value);
        }
        if (name === "divisionId") {
            setAssignRoleForm((prev) => ({
                ...prev,
                sectionId: "",
            }));
            loadSections(value);
        }
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

    const loadOrgStructure = async () => {
        try {
            const [deptRes, divRes, secRes] = await directorApi.getOrganizationStructure();

            setDepartments(deptRes.data?.data || deptRes.data?.departments || []);
            setDivisions(divRes.data?.data || divRes.data?.divisions || []);
            setSections(secRes.data?.data || secRes.data?.sections || []);
        } catch (err) {
            console.error("Failed to load org structure:", err);
        }
    };

    const loadDivisions = async (departmentId) => {
        if (!departmentId) return;
        try {
            const res = await directorApi.getOrganizationStructure().then(r => r[1]).catch(() => ({ data: { data: [] } }));
            const allDivisions = res.data?.data || res.data?.divisions || [];
            setDivisions(allDivisions.filter(d => d.departmentId === departmentId));
        } catch (err) {
            console.error("Failed to load divisions:", err);
        }
    };

    const loadSections = async (divisionId) => {
        if (!divisionId) return;
        try {
            const res = await directorApi.getOrganizationStructure().then(r => r[2]).catch(() => ({ data: { data: [] } }));
            const allSections = res.data?.data || res.data?.sections || [];
            setSections(allSections.filter(s => s.divisionId === divisionId));
        } catch (err) {
            console.error("Failed to load sections:", err);
        }
    };

    useEffect(() => {
        if (user.type === "STAFF") {
            loadOrgStructure();
        }
    }, [user.id]);

    const handleAssignRole = async () => {
        const { role, managerType, departmentId, divisionId, sectionId } = assignRoleForm;

        if (!role) {
            setError("Please select a role");
            return;
        }

        if (role === "MANAGER" && !managerType) {
            setError("Please select a manager type");
            return;
        }

        if (role === "MANAGER" && managerType === "DEPARTMENT" && !departmentId) {
            setError("Please select a department");
            return;
        }

        if (role === "MANAGER" && managerType === "DIVISION" && !divisionId) {
            setError("Please select a division");
            return;
        }

        if ((role === "MANAGER" && managerType === "SECTION") || role === "PS_SUPPORT") {
            if (!sectionId) {
                setError("Please select a section");
                return;
            }
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const payload = {
                staffId: user.id,
                role,
                managerType,
                departmentId,
                divisionId,
                sectionId,
            };

            await RoleApi.assignRole(payload);

            setSuccess(`Role ${role} assigned successfully`);
            setRoles(getRoles({ ...user, [role.toLowerCase() === "system_admin" ? "isSAdmin" : role.toLowerCase() === "director" ? "isDirector" : role.toLowerCase() === "manager" ? "isManager" : "isPSsupport"]: true, managerType, role }));
            setAssignRoleForm({ role: "", managerType: "", departmentId: "", divisionId: "", sectionId: "" });
            setShowAssignRole(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to assign role");
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeRole = async (roleToRemove, targetStructureId) => {
        if (!confirm(`Are you sure you want to remove the ${roleToRemove} role?`)) return;

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await RoleApi.revokeRole({
                staffId: user.id,
                roleToRemove,
                targetStructureId,
            });

            setSuccess(`Role ${roleToRemove} removed successfully`);
            setRoles(roles.filter(r => r.key !== roleToRemove));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to remove role");
        } finally {
            setLoading(false);
        }
    };

    const permissions = getPermissionList(user);
    const name = getUserName(user);
    const isStaff = user.type === "STAFF";

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
                    {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4 shrink-0" />
                            {success}
                        </div>
                    )}

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

                        {isStaff && (
                            <MetaItem
                                icon={BriefcaseBusiness}
                                label="Role / Access level"
                                value={roles.length > 0 ? roles.map(r => r.label).join(", ") : "No roles assigned"}
                            />
                        )}

                        <MetaItem
                            icon={ShieldCheck}
                            label={isStaff ? "Staff number" : "Member number"}
                            value={getUserNumber(user) || "—"}
                        />
                    </div>

                    {isStaff && (
                        <>
                            <p className="mb-3 mt-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-ink-400">
                                <KeyRound className="h-3 w-3 text-ink-400" />
                                Role Assignments
                            </p>

                            {roles.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {roles.map((role, index) => (
                                        <RoleBadge
                                            key={`${role.key}-${index}`}
                                            role={role.key}
                                            managerType={role.managerType}
                                            onRemove={() => handleRevokeRole(role.key, role.managerType === "DEPARTMENT" ? (user.managedDepartmentId || user.departmentId) : role.managerType === "DIVISION" ? (user.managedDivisionId || user.divisionId) : role.managerType === "SECTION" ? (user.managedSectionId || user.sectionId) : undefined)}
                                            disabled={roles.length <= 1}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-ink-100 bg-ink-50/70 px-4 py-3 text-xs text-ink-500 mb-4">
                                    No roles assigned yet.
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => { setShowAssignRole(true); setError(""); setSuccess(""); }}
                                className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-[#dbe7f8] bg-[#edf4fd] px-3 py-2 text-xs font-semibold text-[#527eb9] transition hover:bg-[#dbe7f8]"
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                Assign Role
                            </button>

                            {showAssignRole && (
                                <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-4 space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <Select
                                            label="Role"
                                            name="role"
                                            value={assignRoleForm.role}
                                            onChange={handleAssignRoleChange}
                                            required
                                        >
                                            <option value="">Select a role</option>
                                            {ROLE_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Select>

                                        {assignRoleForm.role === "MANAGER" && (
                                            <Select
                                                label="Manager Type"
                                                name="managerType"
                                                value={assignRoleForm.managerType}
                                                onChange={handleAssignRoleChange}
                                                required
                                            >
                                                <option value="">Select manager type</option>
                                                {MANAGER_TYPES.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </Select>
                                        )}

                                        {(assignRoleForm.role === "MANAGER" && assignRoleForm.managerType === "DEPARTMENT") && (
                                            <Select
                                                label="Department"
                                                name="departmentId"
                                                value={assignRoleForm.departmentId}
                                                onChange={handleAssignRoleChange}
                                                required
                                            >
                                                <option value="">Select department</option>
                                                {departments.map((d) => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </Select>
                                        )}

                                        {(assignRoleForm.role === "MANAGER" && assignRoleForm.managerType === "DIVISION") && (
                                            <Select
                                                label="Division"
                                                name="divisionId"
                                                value={assignRoleForm.divisionId}
                                                onChange={handleAssignRoleChange}
                                                required
                                            >
                                                <option value="">Select division</option>
                                                {divisions.map((d) => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </Select>
                                        )}

                                        {((assignRoleForm.role === "MANAGER" && assignRoleForm.managerType === "SECTION") || assignRoleForm.role === "PS_SUPPORT") && (
                                            <Select
                                                label="Section"
                                                name="sectionId"
                                                value={assignRoleForm.sectionId}
                                                onChange={handleAssignRoleChange}
                                                required
                                            >
                                                <option value="">Select section</option>
                                                {sections.map((s) => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </Select>
                                        )}

                                        {assignRoleForm.role === "SYSTEM_ADMIN" && (
                                            <div className="sm:col-span-2 rounded-lg bg-purple-50 border border-purple-200 p-3 text-xs text-purple-700">
                                                <p className="font-semibold">System Administrator</p>
                                                <p className="mt-1">Grants full system access including user management and role assignment.</p>
                                            </div>
                                        )}

                                        {assignRoleForm.role === "DIRECTOR" && (
                                            <div className="sm:col-span-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
                                                <p className="font-semibold">Director</p>
                                                <p className="mt-1">Grants executive oversight across the organization.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2 border-t border-ink-100">
                                        <Button variant="outline" size="sm" onClick={() => setShowAssignRole(false)}>
                                            Cancel
                                        </Button>
                                        <Button variant="primary" size="sm" onClick={handleAssignRole} loading={loading}>
                                            Assign Role
                                        </Button>
                                    </div>
                                </div>
                            )}

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