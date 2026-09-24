import { Gender, StaffStatus } from "../generated/prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../src/config/database";
import { generateNextStaffNumber } from "../src/utils/userNumber";

export const PERMISSIONS = {
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
} as const;

const defaultPermissions = [
  {
    code: PERMISSIONS.STAFF_READ_ALL,
    name: "Read All Staff",
    category: "STAFF",
    description: "Allows viewing all internal staff members across the system.",
  },
  {
  code: PERMISSIONS.ACCESS_USER_DETAIL,
  name: "Access User Detail",
  category: "USER_MANAGEMENT",
  description:
    "Allows viewing detailed information about staff and customers."
},
  {
    code: PERMISSIONS.CUSTOMER_READ_ALL,
    name: "Read All Customers",
    category: "CUSTOMER",
    description: "Allows viewing all customer/partner user accounts.",
  },
  {
    code: PERMISSIONS.USER_UPDATE_ANY,
    name: "Update Any User",
    category: "USER_MANAGEMENT",
    description: "Allows editing user profile parameters (e.g., email address).",
  },
  {
    code: PERMISSIONS.USER_READ_STATS,
    name: "Read User Statistics",
    category: "USER_MANAGEMENT",
    description: "Allows access to user activity logs and account analytics.",
  },
  {
    code: PERMISSIONS.STAFF_ASSIGN_ROLE,
    name: "Assign Staff Role",
    category: "STAFF",
    description: "Allows placing staff into roles, departments, divisions, or sections.",
  },
  {
    code: PERMISSIONS.PERMISSION_DELEGATE,
    name: "Delegate Permissions",
    category: "AUTHORIZATION",
    description: "Allows granting or revoking individual permissions for other staff.",
  },
  {
    code: PERMISSIONS.RECEIVE_NEW_CASE,
    name: "Receive New Case Broadcast",
    category: "CASE_MANAGEMENT",
    description: "Receives email and in-app broadcasts for newly unassigned support cases.",
  },
  {
    code: PERMISSIONS.CASE_READ_ALL,
    name: "Read All Cases",
    category: "CASE_MANAGEMENT",
    description: "Allows viewing every case system-wide regardless of hierarchy scope.",
  },
  {
    code: PERMISSIONS.CASE_READ_HIERARCHY,
    name: "Read Hierarchy Cases",
    category: "CASE_MANAGEMENT",
    description: "Allows viewing cases within assigned department/division/section hierarchy.",
  },
  {
    code: PERMISSIONS.CASE_ASSIGN,
    name: "Assign Cases",
    category: "CASE_MANAGEMENT",
    description: "Allows assigning or reassigning cases to PS Support personnel.",
  },
  {
    code: PERMISSIONS.CASE_SET_PRIORITY,
    name: "Set Case Priority",
    category: "CASE_MANAGEMENT",
    description: "Allows modifying ticket urgency or priority ratings.",
  },
  {
    code: PERMISSIONS.CASE_READ_ANALYTICS,
    name: "Read Case Analytics",
    category: "ANALYTICS",
    description: "Allows viewing system-wide case volume, resolution, and feedback analytics.",
  },
  {
    code: PERMISSIONS.CASE_READ_OWN_ANALYTICS,
    name: "Read Own Case Analytics",
    category: "ANALYTICS",
    description: "Allows viewing personal or unit-scoped case metrics.",
  },
  {
    code: PERMISSIONS.CASE_CREATE,
    name: "Create Support Case",
    category: "CASE_MANAGEMENT",
    description: "Allows creating support cases on behalf of partner organizations.",
  },
  {
    code: PERMISSIONS.VIEW_ALL_CASES_METRICS,
    name: "View All Case Metrics",
    category: "ANALYTICS",
    description: "Access high-level operational dashboards across all departments.",
  },
  {
    code: PERMISSIONS.VIEW_ALL_CASES_DETAIL,
    name: "View All Case Details",
    category: "CASE_MANAGEMENT",
    description: "Access granular case logs, status histories, and resolution notes.",
  },
  {
    code: PERMISSIONS.STRUCTURE_MANAGE,
    name: "Manage Org Structure",
    category: "ORGANIZATION",
    description: "Allows creating, updating, deactivating departments, divisions, and sections.",
  },
  {
    code: PERMISSIONS.STRUCTURE_READ_ALL,
    name: "Read All Org Structures",
    category: "ORGANIZATION",
    description: "Allows viewing the full organizational breakdown and unit hierarchies.",
  },
  {
    code: PERMISSIONS.STRUCTURE_READ_OWN,
    name: "Read Own Org Structure",
    category: "ORGANIZATION",
    description: "Allows viewing details specifically for assigned department, division, or section.",
  },
  {
    code: PERMISSIONS.SERVICE_MANAGE,
    name: "Manage Service Types",
    category: "SERVICES",
    description: "Allows managing service types, product categories, and custom ticket fields.",
  },
  {
    code: PERMISSIONS.ORGANIZATION_MANAGE,
    name: "Manage Partner Organizations",
    category: "ORGANIZATION",
    description: "Allows adding and managing partner companies and email domain rules.",
  },
];

const SYSTEM_ADMIN_PERMISSIONS = [
  PERMISSIONS.STAFF_READ_ALL,
  PERMISSIONS.CUSTOMER_READ_ALL,
  PERMISSIONS.ACCESS_USER_DETAIL,
  PERMISSIONS.USER_UPDATE_ANY,
  PERMISSIONS.USER_READ_STATS,
  PERMISSIONS.CASE_READ_ALL,
  PERMISSIONS.CASE_READ_HIERARCHY,
  PERMISSIONS.CASE_ASSIGN,
  PERMISSIONS.CASE_SET_PRIORITY,
  PERMISSIONS.CASE_READ_ANALYTICS,
  PERMISSIONS.STRUCTURE_MANAGE,
  PERMISSIONS.STRUCTURE_READ_ALL,
  PERMISSIONS.SERVICE_MANAGE,
  PERMISSIONS.ORGANIZATION_MANAGE,
  PERMISSIONS.PERMISSION_DELEGATE,
  PERMISSIONS.CASE_CREATE,
  PERMISSIONS.VIEW_ALL_CASES_METRICS,
  PERMISSIONS.VIEW_ALL_CASES_DETAIL,
  PERMISSIONS.RECEIVE_NEW_CASE,
];

async function main() {
  console.log("Starting Database Seeding...");

  console.log(`Seeding ${defaultPermissions.length} master permissions...`);
  const seededPermissionsMap = new Map<string, string>(); 

  for (const perm of defaultPermissions) {
    const permission = await prisma.permission.upsert({
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
  const existingAdmin = await prisma.staff.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("System Admin already exists. Skipping admin creation.");
    return;
  }

  const defaultPassword = "Admin@123";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const adminPermissionConnectData = SYSTEM_ADMIN_PERMISSIONS
    .map((code) => seededPermissionsMap.get(code))
    .filter((id): id is string => Boolean(id))
    .map((permissionId) => ({
      permission: {
        connect: { id: permissionId },
      },
    }));

  const admin = await prisma.staff.create({
    data: {
      staffNumber: await generateNextStaffNumber(prisma),
      firstName: "System",
      middleName: "Super",
      lastName: "Admin",
      email: adminEmail,
      passwordHash: passwordHash,
      gender: Gender.FEMALE,
      isSAdmin: true,
      isManager: false,
      isPSsupport: false,
      status: StaffStatus.ACTIVE,

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
    assignedPermissions: admin.staffPermissions.map(
      (sp) => sp.permission.code
    ),
  });
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });