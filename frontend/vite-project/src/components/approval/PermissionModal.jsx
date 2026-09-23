import { useEffect, useMemo, useState } from "react";
import { Lock, ShieldCheck, X } from "lucide-react";
import { PermissionApi } from "../../api/permissionApi";
import Button from "../ui/Button";

const normalizeCode = (code) => (typeof code === "string" ? code.trim().toUpperCase() : "");

const deriveRole = (staff) => {
    if (!staff) return "";
    if (staff.isSAdmin) return "SYSTEM_ADMIN";
    if (staff.isDirector) return "DIRECTOR";
    if (staff.isManager) return "MANAGER";
    if (staff.isPSsupport) return "PS_SUPPORT";
    return staff.role || "";
};

const deriveManagerType = (staff) => {
    if (!staff) return undefined;
    if (staff.managerType) return staff.managerType;
    if (staff.managedDepartment) return "DEPARTMENT";
    if (staff.managedDivision) return "DIVISION";
    if (staff.managedSection) return "SECTION";
    return undefined;
};

const getUserName = (user) =>
    user.fullName ||
    `${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""}`.trim() ||
    user.email ||
    "User";

export default function PermissionModal({
    user,
    onClose,
    onSave,
}) {
    const [permissions, setPermissions] = useState([]);
    const [defaultPermissions, setDefaultPermissions] = useState([]);
    const [selected, setSelected] = useState([]);

    const defaultPermissionSet = useMemo(
        () => new Set(defaultPermissions.map((code) => normalizeCode(code))),
        [defaultPermissions]
    );

    useEffect(() => {
        if (!user) return;

        const role = deriveRole(user);
        const managerType = deriveManagerType(user);

        Promise.all([
            PermissionApi.getAll(),
            role
                ? PermissionApi.getDefaultPermissionsForRole(role, managerType)
                : Promise.resolve({ data: { data: { defaultPermissions: [] } } }),
        ])
            .then(([allRes, defaultRes]) => {
                const allPermissions = allRes.data?.data || [];
                const defaultCodes = defaultRes?.data?.data?.defaultPermissions || [];
                const normalizedDefaults = defaultCodes.map((code) => normalizeCode(code));

                setPermissions(allPermissions);
                setDefaultPermissions(normalizedDefaults);

                const permissionCandidates = Array.isArray(user.permissions)
                    ? user.permissions
                    : Array.isArray(user.staffPermissions)
                        ? user.staffPermissions.map((entry) => entry.permission || entry)
                        : Array.isArray(user.permissionCodes)
                            ? user.permissionCodes
                            : [];

                const allCurrentPermissions = permissionCandidates.map((entry) => {
                    if (typeof entry === "string") return entry;
                    if (entry && typeof entry === "object") {
                        return entry.code || entry.permissionCode || entry.permission?.code || "";
                    }
                    return "";
                });

                const existingExtraPermissions = allCurrentPermissions
                    .map((code) => normalizeCode(code))
                    .filter((code) => code && !normalizedDefaults.includes(code));

                setSelected(existingExtraPermissions);
            })
            .catch((error) => {
                console.error("Failed to load permissions", error);
                setPermissions([]);
                setDefaultPermissions([]);
                setSelected([]);
            });
    }, [user]);

    const toggle = (code) => {
        if (defaultPermissionSet.has(normalizeCode(code))) return;

        const normalized = normalizeCode(code);
        setSelected((prev) =>
            prev.includes(normalized)
                ? prev.filter((entry) => entry !== normalized)
                : [...prev, normalized]
        );
    };

    const checkedCount = selected.length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1b33]/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl transform rounded-2xl bg-white shadow-[0_20px_60px_rgba(11,27,51,0.2)]">
                <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50">
                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        </span>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold tracking-tight text-ink-900">
                                Add Permissions
                            </h2>
                            <p className="mt-0.5 truncate text-sm text-ink-500">
                                {getUserName(user)}
                                {user.email ? ` · ${user.email}` : ""}
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
                    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-navy-100 bg-navy-50 px-4 py-3">
                        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-navy-500" />
                        <p className="text-xs leading-relaxed text-navy-700">
                            Default role permissions are already granted and locked. Select only the
                            extra permissions to add below.
                        </p>
                    </div>

                    {permissions.length === 0 ? (
                        <div className="flex items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50 py-12 text-sm text-ink-500">
                            No permissions available to configure.
                        </div>
                    ) : (
                        <div className="scrollbar-thin grid max-h-[400px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                            {permissions.map((permission) => {
                                const code = normalizeCode(permission.code);
                                const isDefault = defaultPermissionSet.has(code);
                                const isChecked = isDefault || selected.includes(code);

                                return (
                                    <label
                                        key={permission.id}
                                        className={[
                                            "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all",
                                            isDefault
                                                ? "cursor-not-allowed border-ink-100 bg-ink-50"
                                                : isChecked
                                                    ? "border-navy-300 bg-navy-50"
                                                    : "border-ink-200 bg-white hover:border-navy-200 hover:bg-ink-50",
                                        ].join(" ")}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            disabled={isDefault}
                                            onChange={() => toggle(permission.code)}
                                            className="h-4 w-4 shrink-0 accent-navy-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <span
                                            className={[
                                                "min-w-0 flex-1 text-sm",
                                                isDefault
                                                    ? "font-semibold text-ink-500"
                                                    : "font-medium text-ink-700",
                                            ].join(" ")}
                                        >
                                            {permission.name}
                                        </span>
                                        {isDefault && (
                                            <Lock className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-6 py-4">
                    <p className="text-xs text-ink-500">
                        <span className="font-semibold text-ink-700">{checkedCount}</span> extra{" "}
                        {checkedCount === 1 ? "permission" : "permissions"} selected
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onSave(user.id, selected)}
                            disabled={selected.length === 0}
                        >
                            Save Permissions
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}