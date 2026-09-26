"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSIONS = void 0;
const client_1 = require("../generated/prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../src/config/database");
const userNumber_1 = require("../src/utils/userNumber");
exports.PERMISSIONS = {
    STAFF_READ_ALL: "STAFF_READ_ALL",
    CUSTOMER_READ_ALL: "CUSTOMER_READ_ALL",
    ACCESS_USER_DETAIL: "ACCESS_USER_DETAIL",
    USER_UPDATE_ANY: "USER_UPDATE_ANY",
    USER_READ_STATS: "USER_READ_STATS",
    STAFF_ASSIGN_ROLE: "STAFF_ASSIGN_ROLE",
    PERMISSION_DELEGATE: "PERMISSION_DELEGATE",
    RECEIVE_NEW_CASE: "RECEIVE_NEW_CASE",
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
};
const defaultPermissions = [
    {
        code: exports.PERMISSIONS.STAFF_READ_ALL,
        name: "Read All Staff",
        category: "STAFF",
        description: "Allows viewing all internal staff members across the system.",
    },
    {
        code: exports.PERMISSIONS.ACCESS_USER_DETAIL,
        name: "Access User Detail",
        category: "USER_MANAGEMENT",
        description: "Allows viewing detailed information about staff and customers."
    },
    {
        code: exports.PERMISSIONS.CUSTOMER_READ_ALL,
        name: "Read All Customers",
        category: "CUSTOMER",
        description: "Allows viewing all customer/partner user accounts.",
    },
    {
        code: exports.PERMISSIONS.USER_UPDATE_ANY,
        name: "Update Any User",
        category: "USER_MANAGEMENT",
        description: "Allows editing user profile parameters (e.g., email address).",
    },
    {
        code: exports.PERMISSIONS.USER_READ_STATS,
        name: "Read User Statistics",
        category: "USER_MANAGEMENT",
        description: "Allows access to user activity logs and account analytics.",
    },
    {
        code: exports.PERMISSIONS.STAFF_ASSIGN_ROLE,
        name: "Assign Staff Role",
        category: "STAFF",
        description: "Allows placing staff into roles, departments, divisions, or sections.",
    },
    {
        code: exports.PERMISSIONS.PERMISSION_DELEGATE,
        name: "Delegate Permissions",
        category: "AUTHORIZATION",
        description: "Allows granting or revoking individual permissions for other staff.",
    },
    {
        code: exports.PERMISSIONS.RECEIVE_NEW_CASE,
        name: "Receive New Case Broadcast",
        category: "CASE_MANAGEMENT",
        description: "Receives email and in-app broadcasts for newly unassigned support cases.",
    },
    {
        code: exports.PERMISSIONS.CASE_READ_ALL,
        name: "Read All Cases",
        category: "CASE_MANAGEMENT",
        description: "Allows viewing every case system-wide regardless of hierarchy scope.",
    },
    {
        code: exports.PERMISSIONS.CASE_READ_HIERARCHY,
        name: "Read Hierarchy Cases",
        category: "CASE_MANAGEMENT",
        description: "Allows viewing cases within assigned department/division/section hierarchy.",
    },
    {
        code: exports.PERMISSIONS.CASE_ASSIGN,
        name: "Assign Cases",
        category: "CASE_MANAGEMENT",
        description: "Allows assigning or reassigning cases to PS Support personnel.",
    },
    {
        code: exports.PERMISSIONS.CASE_SET_PRIORITY,
        name: "Set Case Priority",
        category: "CASE_MANAGEMENT",
        description: "Allows modifying ticket urgency or priority ratings.",
    },
    {
        code: exports.PERMISSIONS.CASE_READ_ANALYTICS,
        name: "Read Case Analytics",
        category: "ANALYTICS",
        description: "Allows viewing system-wide case volume, resolution, and feedback analytics.",
    },
    {
        code: exports.PERMISSIONS.CASE_READ_OWN_ANALYTICS,
        name: "Read Own Case Analytics",
        category: "ANALYTICS",
        description: "Allows viewing personal or unit-scoped case metrics.",
    },
    {
        code: exports.PERMISSIONS.CASE_CREATE,
        name: "Create Support Case",
        category: "CASE_MANAGEMENT",
        description: "Allows creating support cases on behalf of partner organizations.",
    },
    {
        code: exports.PERMISSIONS.VIEW_ALL_CASES_METRICS,
        name: "View All Case Metrics",
        category: "ANALYTICS",
        description: "Access high-level operational dashboards across all departments.",
    },
    {
        code: exports.PERMISSIONS.VIEW_ALL_CASES_DETAIL,
        name: "View All Case Details",
        category: "CASE_MANAGEMENT",
        description: "Access granular case logs, status histories, and resolution notes.",
    },
    {
        code: exports.PERMISSIONS.STRUCTURE_MANAGE,
        name: "Manage Org Structure",
        category: "ORGANIZATION",
        description: "Allows creating, updating, deactivating departments, divisions, and sections.",
    },
    {
        code: exports.PERMISSIONS.STRUCTURE_READ_ALL,
        name: "Read All Org Structures",
        category: "ORGANIZATION",
        description: "Allows viewing the full organizational breakdown and unit hierarchies.",
    },
    {
        code: exports.PERMISSIONS.STRUCTURE_READ_OWN,
        name: "Read Own Org Structure",
        category: "ORGANIZATION",
        description: "Allows viewing details specifically for assigned department, division, or section.",
    },
    {
        code: exports.PERMISSIONS.SERVICE_MANAGE,
        name: "Manage Service Types",
        category: "SERVICES",
        description: "Allows managing service types, product categories, and custom ticket fields.",
    },
    {
        code: exports.PERMISSIONS.ORGANIZATION_MANAGE,
        name: "Manage Partner Organizations",
        category: "ORGANIZATION",
        description: "Allows adding and managing partner companies and email domain rules.",
    },
];
const SYSTEM_ADMIN_PERMISSIONS = [
    exports.PERMISSIONS.STAFF_READ_ALL,
    exports.PERMISSIONS.CUSTOMER_READ_ALL,
    exports.PERMISSIONS.ACCESS_USER_DETAIL,
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
];
async function main() {
    console.log("Starting Database Seeding...");
    console.log(`Seeding ${defaultPermissions.length} master permissions...`);
    const seededPermissionsMap = new Map();
    for (const perm of defaultPermissions) {
        const permission = await database_1.prisma.permission.upsert({
            where: { code: perm.code },
            update: {
                name: perm.name,
                category: perm.category,
                description: perm.description,
            },
            create: {
                code: perm.code,
                name: perm.name,
                category: perm.category,
                description: perm.description,
            },
        });
        seededPermissionsMap.set(permission.code, permission.id);
    }
    console.log("Master permissions seeded successfully!");
    const adminEmail = "nejatebrahim35@gmail.com";
    const existingAdmin = await database_1.prisma.staff.findUnique({
        where: { email: adminEmail },
    });
    if (existingAdmin) {
        console.log("System Admin already exists. Skipping admin creation.");
        return;
    }
    const defaultPassword = "Admin@123";
    const passwordHash = await bcrypt_1.default.hash(defaultPassword, 10);
    const adminPermissionConnectData = SYSTEM_ADMIN_PERMISSIONS
        .map((code) => seededPermissionsMap.get(code))
        .filter((id) => Boolean(id))
        .map((permissionId) => ({
        permission: {
            connect: { id: permissionId },
        },
    }));
    const admin = await database_1.prisma.staff.create({
        data: {
            staffNumber: await (0, userNumber_1.generateNextStaffNumber)(database_1.prisma),
            firstName: "System",
            middleName: "Super",
            lastName: "Admin",
            email: adminEmail,
            passwordHash: passwordHash,
            gender: client_1.Gender.FEMALE,
            isSAdmin: true,
            isManager: false,
            isPSsupport: false,
            status: client_1.StaffStatus.ACTIVE,
            staffPermissions: {
                create: adminPermissionConnectData,
            },
        },
        include: {
            staffPermissions: {
                include: {
                    permission: true,
                },
            },
        },
    });
    console.log("System Admin seeded successfully with default permissions!");
    console.log({
        id: admin.id,
        email: admin.email,
        isSAdmin: admin.isSAdmin,
        totalPermissionsAssigned: admin.staffPermissions.length,
        assignedPermissions: admin.staffPermissions.map((sp) => sp.permission.code),
    });
}
main()
    .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
})
    .finally(async () => {
    await database_1.prisma.$disconnect();
});
