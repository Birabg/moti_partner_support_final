// Client-side mirror of the backend permission catalog (see
// backend src/config/default.permission.ts). Used to display a
// staff member's effective permission set readably.

export const PERMISSION_LABELS = {
    STAFF_READ_ALL: "View all staff",
    CUSTOMER_READ_ALL: "View all customers",
    USER_UPDATE_ANY: "Update any user",
    USER_READ_STATS: "Read user statistics",
    STAFF_ASSIGN_ROLE: "Assign staff roles",
    PERMISSION_DELEGATE: "Manage permissions",
    RECEIVE_NEW_CASE: "Receive new cases",
    ACCESS_USER_DETAIL: "Access user details",

    CASE_READ_ALL: "View all cases",
    CASE_READ_HIERARCHY: "View cases in hierarchy",
    CASE_ASSIGN: "Assign cases",
    CASE_SET_PRIORITY: "Set case priority",
    CASE_READ_ANALYTICS: "View case analytics",
    CASE_READ_OWN_ANALYTICS: "View own case analytics",
    CASE_CREATE: "Create cases",
    VIEW_ALL_CASES_METRICS: "View all case metrics",
    VIEW_ALL_CASES_DETAIL: "View all case details",

    STRUCTURE_MANAGE: "Manage organization structure",
    STRUCTURE_READ_ALL: "View all structure",
    STRUCTURE_READ_OWN: "View own structure",

    SERVICE_MANAGE: "Manage services",
    ORGANIZATION_MANAGE: "Manage organization",
    PRODUCT_MANAGE: "Manage products",
    PRODUCT_READ_ALL: "View all products",
};

const DEFAULT_ROLE_PERMISSIONS = {
    SYSTEM_ADMIN: [
        "STAFF_READ_ALL", "CUSTOMER_READ_ALL", "USER_UPDATE_ANY",
        "USER_READ_STATS", "CASE_READ_ALL", "CASE_READ_HIERARCHY",
        "CASE_ASSIGN", "CASE_SET_PRIORITY", "CASE_READ_ANALYTICS",
        "STRUCTURE_MANAGE", "STRUCTURE_READ_ALL", "SERVICE_MANAGE",
        "ORGANIZATION_MANAGE", "PERMISSION_DELEGATE", "CASE_CREATE",
        "VIEW_ALL_CASES_METRICS", "VIEW_ALL_CASES_DETAIL",
        "RECEIVE_NEW_CASE", "ACCESS_USER_DETAIL",
    ],
    DIRECTOR: [
        "USER_READ_STATS", "CASE_READ_ALL", "CASE_READ_ANALYTICS",
        "STRUCTURE_READ_ALL", "ORGANIZATION_MANAGE",
        "VIEW_ALL_CASES_METRICS", "VIEW_ALL_CASES_DETAIL",
    ],
    MANAGER_DEPARTMENT: [
        "STRUCTURE_READ_OWN", "USER_READ_STATS", "CASE_READ_HIERARCHY",
        "CASE_ASSIGN", "CASE_SET_PRIORITY", "CASE_READ_OWN_ANALYTICS",
    ],
    MANAGER_DIVISION: [
        "STRUCTURE_READ_OWN", "USER_READ_STATS", "CASE_READ_HIERARCHY",
        "CASE_ASSIGN", "CASE_SET_PRIORITY", "CASE_READ_OWN_ANALYTICS",
    ],
    MANAGER_SECTION: [
        "STRUCTURE_READ_OWN", "STAFF_READ_ALL", "USER_READ_STATS",
        "CASE_READ_HIERARCHY", "CASE_ASSIGN", "CASE_SET_PRIORITY",
        "CASE_READ_OWN_ANALYTICS",
    ],
    PS_SUPPORT: [
        "STRUCTURE_READ_OWN", "CASE_READ_HIERARCHY", "CASE_READ_OWN_ANALYTICS",
    ],
};

const normalizeCode = (code) =>
    String(code || "").trim().toUpperCase();

export const formatPermissionLabel = (code) =>
    PERMISSION_LABELS[normalizeCode(code)] ||
    normalizeCode(code)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const getDefaultPermissionCodes = (role, managerType) => {
    if (!role) return [];

    const normalizedRole = role.trim().toUpperCase();

    const baseCodes =
        normalizedRole === "MANAGER"
            ? managerType
                ? DEFAULT_ROLE_PERMISSIONS[`MANAGER_${managerType.trim().toUpperCase()}`] ?? []
                : []
            : DEFAULT_ROLE_PERMISSIONS[normalizedRole] ?? [];

    return baseCodes.map(normalizeCode);
};

export const splitEffectivePermissions = (permissions, role, managerType) => {
    const allCodes = Array.isArray(permissions)
        ? [...new Set(permissions.map(normalizeCode).filter(Boolean))]
        : [];

    const defaultSet = new Set(getDefaultPermissionCodes(role, managerType));

    return {
        defaults: allCodes.filter((code) => defaultSet.has(code)).sort(),
        extras: allCodes.filter((code) => !defaultSet.has(code)).sort(),
    };
};