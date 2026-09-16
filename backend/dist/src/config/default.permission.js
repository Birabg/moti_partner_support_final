"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEffectivePermissionCodes = exports.getDefaultPermissionCodes = exports.DEFAULT_ROLE_PERMISSIONS = exports.normalizePermissionCode = exports.LEGACY_PERMISSION_ALIASES = exports.PERMISSIONS = void 0;
exports.PERMISSIONS = {
    STAFF_READ_ALL: "STAFF_READ_ALL",
    CUSTOMER_READ_ALL: "CUSTOMER_READ_ALL",
    USER_UPDATE_ANY: "USER_UPDATE_ANY",
    USER_READ_STATS: "USER_READ_STATS",
    STAFF_ASSIGN_ROLE: "STAFF_ASSIGN_ROLE",
    PERMISSION_DELEGATE: "PERMISSION_DELEGATE",
    RECEIVE_NEW_CASE: "RECEIVE_NEW_CASE",
    ACCESS_USER_DETAIL: "ACCESS_USER_DETAIL",
    CASE_READ_ALL: "CASE_READ_ALL",
    CASE_READ_HIERARCHY: "CASE_READ_HIERARCHY",
    CASE_ASSIGN: "CASE_ASSIGN",
    CASE_SET_PRIORITY: "CASE_SET_PRIORITY",
    CASE_READ_ANALYTICS: "CASE_READ_ANALYTICS",
    CASE_READ_OWN_ANALYTICS: "CASE_READ_OWN_ANALYTICS",
    CASE_CREATE: "CASE_CREATE",
    VIEW_ALL_CASES_METRICS: "VIEW_ALL_CASES_METRICS",
    VIEW_ALL_CASES_DETAIL: "VIEW_ALL_CASES_DETAIL",
    STRUCTURE_MANAGE: "STRUCTURE_MANAGE",
    STRUCTURE_READ_ALL: "STRUCTURE_READ_ALL",
    STRUCTURE_READ_OWN: "STRUCTURE_READ_OWN",
    SERVICE_MANAGE: "SERVICE_MANAGE",
    ORGANIZATION_MANAGE: "ORGANIZATION_MANAGE",
    PRODUCT_MANAGE: "PRODUCT_MANAGE",
    PRODUCT_READ_ALL: "PRODUCT_READ_ALL",
};
exports.LEGACY_PERMISSION_ALIASES = {
    CASE_READ_OWN_ANALTICS: exports.PERMISSIONS.CASE_READ_OWN_ANALYTICS,
};
const normalizePermissionCode = (code) => {
    if (!code)
        return "";
    const rawValue = typeof code === "string"
        ? code
        : typeof code === "object" && "code" in code && typeof code.code === "string"
            ? code.code
            : "";
    const raw = rawValue.trim().toUpperCase();
    if (!raw)
        return "";
    return exports.LEGACY_PERMISSION_ALIASES[raw] || raw;
};
exports.normalizePermissionCode = normalizePermissionCode;
exports.DEFAULT_ROLE_PERMISSIONS = {
    SYSTEM_ADMIN: [
        exports.PERMISSIONS.STAFF_READ_ALL,
        exports.PERMISSIONS.CUSTOMER_READ_ALL,
        exports.PERMISSIONS.USER_UPDATE_ANY,
        exports.PERMISSIONS.USER_READ_STATS,
        exports.PERMISSIONS.CASE_READ_ALL,
        exports.PERMISSIONS.CASE_READ_HIERARCHY,
        exports.PERMISSIONS.CASE_ASSIGN,
        exports.PERMISSIONS.CASE_SET_PRIORITY,
        exports.PERMISSIONS.CASE_READ_ANALYTICS,
        exports.PERMISSIONS.STRUCTURE_MANAGE,
        exports.PERMISSIONS.STRUCTURE_READ_ALL,
        exports.PERMISSIONS.SERVICE_MANAGE,
        exports.PERMISSIONS.ORGANIZATION_MANAGE,
        exports.PERMISSIONS.PERMISSION_DELEGATE,
        exports.PERMISSIONS.CASE_CREATE,
        exports.PERMISSIONS.VIEW_ALL_CASES_METRICS,
        exports.PERMISSIONS.VIEW_ALL_CASES_DETAIL,
        exports.PERMISSIONS.RECEIVE_NEW_CASE,
        exports.PERMISSIONS.ACCESS_USER_DETAIL,
    ],
    DIRECTOR: [
        exports.PERMISSIONS.USER_READ_STATS,
        exports.PERMISSIONS.CASE_READ_ALL,
        exports.PERMISSIONS.CASE_READ_ANALYTICS,
        exports.PERMISSIONS.STRUCTURE_READ_ALL,
        exports.PERMISSIONS.ORGANIZATION_MANAGE,
        exports.PERMISSIONS.VIEW_ALL_CASES_METRICS,
        exports.PERMISSIONS.VIEW_ALL_CASES_DETAIL,
    ],
    MANAGER_DEPARTMENT: [
        exports.PERMISSIONS.STRUCTURE_READ_OWN,
        exports.PERMISSIONS.USER_READ_STATS,
        exports.PERMISSIONS.CASE_READ_HIERARCHY,
        exports.PERMISSIONS.CASE_ASSIGN,
        exports.PERMISSIONS.CASE_SET_PRIORITY,
        exports.PERMISSIONS.CASE_READ_OWN_ANALYTICS,
    ],
    MANAGER_DIVISION: [
        exports.PERMISSIONS.STRUCTURE_READ_OWN,
        exports.PERMISSIONS.USER_READ_STATS,
        exports.PERMISSIONS.CASE_READ_HIERARCHY,
        exports.PERMISSIONS.CASE_ASSIGN,
        exports.PERMISSIONS.CASE_SET_PRIORITY,
        exports.PERMISSIONS.CASE_READ_OWN_ANALYTICS,
    ],
    MANAGER_SECTION: [
        exports.PERMISSIONS.STRUCTURE_READ_OWN,
        exports.PERMISSIONS.STAFF_READ_ALL,
        exports.PERMISSIONS.USER_READ_STATS,
        exports.PERMISSIONS.CASE_READ_HIERARCHY,
        exports.PERMISSIONS.CASE_ASSIGN,
        exports.PERMISSIONS.CASE_SET_PRIORITY,
        exports.PERMISSIONS.CASE_READ_OWN_ANALYTICS,
    ],
    PS_SUPPORT: [
        exports.PERMISSIONS.STRUCTURE_READ_OWN,
        exports.PERMISSIONS.CASE_READ_HIERARCHY,
        exports.PERMISSIONS.CASE_READ_OWN_ANALYTICS,
    ],
};
const getDefaultPermissionCodes = (role, managerType) => {
    if (!role)
        return [];
    const normalizedRole = role.trim().toUpperCase();
    const baseCodes = normalizedRole === "MANAGER"
        ? managerType
            ? exports.DEFAULT_ROLE_PERMISSIONS[`MANAGER_${managerType.trim().toUpperCase()}`] ?? []
            : []
        : exports.DEFAULT_ROLE_PERMISSIONS[normalizedRole] ?? [];
    return baseCodes.map((code) => (0, exports.normalizePermissionCode)(code));
};
exports.getDefaultPermissionCodes = getDefaultPermissionCodes;
const getEffectivePermissionCodes = (role, managerType, extraCodes = []) => {
    const defaultCodes = (0, exports.getDefaultPermissionCodes)(role, managerType);
    const normalizedExtra = (extraCodes || [])
        .map((code) => (0, exports.normalizePermissionCode)(code))
        .filter(Boolean);
    return Array.from(new Set([...defaultCodes, ...normalizedExtra]));
};
exports.getEffectivePermissionCodes = getEffectivePermissionCodes;
