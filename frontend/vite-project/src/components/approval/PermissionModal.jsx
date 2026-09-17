import { useEffect, useMemo, useState } from "react";
import { PermissionApi } from "../../api/permissionApi";

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

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="bg-white p-5 rounded-xl w-[700px]">
                <h1 className="font-bold text-2xl mb-4">Add Permissions</h1>

                <div className="mb-3 text-sm text-slate-600">
                    Default role permissions are checked and locked. Add only extra permissions below.
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                    {permissions.map((permission) => {
                        const code = normalizeCode(permission.code);
                        const isDefault = defaultPermissionSet.has(code);
                        const isChecked = isDefault || selected.includes(code);

                        return (
                            <label
                                key={permission.id}
                                className={`flex items-center gap-2 rounded border px-2 py-2 ${isDefault ? "bg-slate-100 text-slate-500" : "bg-white"}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={isDefault}
                                    onChange={() => toggle(permission.code)}
                                />
                                <span>{permission.name}</span>
                            </label>
                        );
                    })}
                </div>

                <div className="mt-5 flex gap-3">
                    <button
                        className="px-4 py-2 bg-green-600 text-white rounded"
                        onClick={() => onSave(user.id, selected)}
                    >
                        Save
                    </button>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
