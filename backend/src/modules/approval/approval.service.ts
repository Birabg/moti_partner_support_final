import { prisma } from "../../config/database";
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from "../../utils/error";
import {
  AssignStaffRole,
} from "../roleassignment/roleassignment.service";
import { getDefaultPermissionCodes } from "../../config/default.permission";
import { TargetRoleType } from "../roleassignment/roleassignment.service";
import { sendAccountApprovalEmail } from "../../utils/email";
import { ENV } from "../../config/env";

type UserType = "STAFF" | "CUSTOMER";
type ManagerType = "DEPARTMENT" | "DIVISION" | "SECTION";

export const getPendingUsers = async () => {
  const pendingStaff = await prisma.staff.findMany({
    where: { status: "PENDING_APPROVAL" },
    select: {
      id: true,
      staffNumber: true,
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
      gender: true,
      createdAt: true,
      isSAdmin: true,
      isManager: true,
      isPSsupport: true,
      isDirector: true,
      isSystemSupport: true,
      sectionId: true,
      managedDepartment: { select: { id: true } },
      managedDivision: { select: { id: true } },
      managedSection: { select: { id: true } },
    },
  });

  const pendingCustomers = await prisma.customer.findMany({
    where: { status: "PENDING_APPROVAL" },
    select: {
      id: true,
      memberNumber: true,
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      position: true,
      gender: true,
      createdAt: true,
      organization: {
        select: { name: true },
      },
    },
  });

  const formatFullName = (firstName?: string | null, middleName?: string | null, lastName?: string | null) =>
    [firstName, middleName, lastName].filter(Boolean).join(" ").trim();

  const getRole = (staff: any) => {
    if (staff.isSAdmin) return "SYSTEM_ADMIN";
    if (staff.isDirector) return "DIRECTOR";
    if (staff.isManager) return "MANAGER";
    if (staff.isPSsupport) return "PS_SUPPORT";
    if (staff.isSystemSupport) return "SYSTEM_SUPPORT";
    return "STAFF";
  };

  const getManagerType = (staff: any) => {
    if (!staff.isManager) return null;
    if (staff.managedDepartment) return "DEPARTMENT";
    if (staff.managedDivision) return "DIVISION";
    if (staff.managedSection) return "SECTION";
    return null;
  };

  const getDepartmentId = (staff: any) => staff.managedDepartment?.id || null;
  const getDivisionId = (staff: any) => staff.managedDivision?.id || null;
  const getSectionId = (staff: any) => staff.managedSection?.id || staff.sectionId || null;

  return {
    staff: pendingStaff.map((staff) => ({
      ...staff,
      fullName: formatFullName(staff.firstName, staff.middleName, staff.lastName),
      role: getRole(staff),
      managerType: getManagerType(staff),
      departmentId: getDepartmentId(staff),
      divisionId: getDivisionId(staff),
      sectionId: getSectionId(staff),
    })),
    customers: pendingCustomers.map((customer) => ({
      ...customer,
      fullName: formatFullName(customer.firstName, customer.middleName, customer.lastName),
    })),
  };
};

interface ApproveUserInput {
  userId: string;
  userType?: "STAFF" | "CUSTOMER";
role:
| "SYSTEM_ADMIN"
| "MANAGER"
| "PS_SUPPORT"
| "DIRECTOR";
  managerType?: "DEPARTMENT" | "DIVISION" | "SECTION";
  departmentId?: string;
  divisionId?: string;
  sectionId?: string;
  approvedById: string;
}

const validateAdminActor = async (adminId: string) => {
  if (!adminId) {
    throw new BadRequestError("Administrator actor context ID is missing.");
  }

  const admin = await prisma.staff.findUnique({
    where: { id: adminId },
    select: { id: true, isSAdmin: true, status: true },
  });

  if (!admin || admin.status !== "ACTIVE") {
    throw new UnauthorizedError("Administrator account is invalid or inactive.");
  }

  if (!admin.isSAdmin) {
    throw new ForbiddenError("Forbidden: Only system administrators can perform this action.");
  }
};export const approveUserAccount = async (input: {
  userId: string;
  userType: "STAFF" | "CUSTOMER";
  role?: string;
  managerType?: string;
  departmentId?: string;
  divisionId?: string;
  sectionId?: string;
  permissionCodes?: string[];
  approvedById: string;
}) => {
  const {
    userId,
    userType = "STAFF",
    role,
    managerType,
    departmentId,
    divisionId,
    sectionId,
    permissionCodes,
    approvedById,
  } = input;
 
  let approvedUser: any = null;
  let emailLogId: string | null = null;

  if (userType === "STAFF") {
    console.log("[approveUserAccount] entering STAFF branch");
    const txResult = await prisma.$transaction(async (tx) => {
      await AssignStaffRole({
        staffId: userId,
        role: role!,
        managerType,
        departmentId,
        divisionId,
        sectionId,
        permissionCodes,
        updatedById: approvedById,
        prismaClient: tx,
      });

      await tx.staff.update({
        where: { id: userId },
        data: {
          status: "ACTIVE",
          approvedBy: { connect: { id: approvedById } },
        },
      });

      const staffRecord = await tx.staff.findUnique({
  where: { id: userId },
  include: {
    staffPermissions: {
      include: {
        permission: true,
      },
    },

    section: true,

    managedDepartment: true,
    managedDivision: true,
    managedSection: true,
  },
});

      if (!staffRecord) throw new NotFoundError("Staff record not found.");

      const loggedEmail = await tx.emailLog.create({
        data: {
          recipientId: staffRecord.id,
          recipientEmail: staffRecord.email,
          emailType: "ACCOUNT_APPROVED",
          status: "PENDING",
        },
      });

      return { user: staffRecord, logId: loggedEmail.id };
    });

    approvedUser = txResult.user;
    emailLogId = txResult.logId;
  }

  if (userType === "CUSTOMER") {
    console.log("[approveUserAccount] entering CUSTOMER branch");

    try {
      const txResult = await prisma.$transaction(async (tx) => {
        const customer = await tx.customer.findUnique({ where: { id: userId } });
        if (!customer) throw new NotFoundError("Customer record not found.");

        const updatedCustomer = await tx.customer.update({
          where: { id: userId },
          data: {
            status: "ACTIVE",
            approvedById: approvedById,
          },
        });

        console.log("[approveUserAccount] customer updated to ACTIVE:", updatedCustomer.id, updatedCustomer.email);

        const loggedEmail = await tx.emailLog.create({
          data: {
            recipientId: updatedCustomer.id,
            recipientEmail: updatedCustomer.email,
            emailType: "ACCOUNT_APPROVED",
            status: "PENDING",
          },
        });

        return { user: updatedCustomer, logId: loggedEmail.id };
      });

      approvedUser = txResult.user;
      emailLogId = txResult.logId;
    } catch (customerTxError) {
    
      console.error("[approveUserAccount] CUSTOMER transaction failed:", customerTxError);
      throw customerTxError;
    }
  }

  console.log("[approveUserAccount] post-transaction state:", {
    hasApprovedUser: !!approvedUser,
    approvedUserEmail: approvedUser?.email,
    emailLogId,
  });

  if (approvedUser && emailLogId) {
    const fullName = `${approvedUser.firstName || ""} ${approvedUser.middleName || ""} ${approvedUser.lastName || ""}`.trim();

    console.log(`[approveUserAccount] attempting to send approval email to ${approvedUser.email} (fullName="${fullName}")`);

    try {
      const deliverySuccess = await sendAccountApprovalEmail(
        approvedUser.email,
        fullName,
        ENV.FRONTEND_URL ?? "",
        userType
      );

      console.log(`[approveUserAccount] sendAccountApprovalEmail returned: ${deliverySuccess}`);

      await prisma.emailLog.update({
        where: { id: emailLogId },
        data: {
          status: deliverySuccess ? "SENT" : "FAILED",
          sentAt: deliverySuccess ? new Date() : null,
          retryCount: deliverySuccess ? 0 : 1,
        },
      });
    } catch (emailError) {
      console.error(`[approveUserAccount] Failed to send approval email to ${userType}:`, emailError);
      await prisma.emailLog.update({
        where: { id: emailLogId },
        data: { status: "FAILED", retryCount: 1 },
      });
    }
  } else {
  
    console.warn("[approveUserAccount] Skipped email — approvedUser or emailLogId was falsy. userType received:", userType);
  }

  return approvedUser;
};


export const rejectUserAccount = async (
  userId: string,
  targetType: UserType,
  adminId: string
) => {
  await validateAdminActor(adminId);

  if (targetType === "STAFF") {
    if (userId === adminId) {
      throw new BadRequestError("You cannot reject your own account.");
    }

    const staff = await prisma.staff.findUnique({ where: { id: userId } });
    if (!staff) throw new NotFoundError("Staff record not found.");
    if (staff.status !== "PENDING_APPROVAL") {
      throw new BadRequestError(
        "Can only reject users who are currently pending approval."
      );
    }

    return prisma.staff.delete({
      where: { id: userId },
      select: { id: true, firstName: true, email: true },
    });
  }

  if (targetType === "CUSTOMER") {
    const customer = await prisma.customer.findUnique({
      where: { id: userId },
    });
    if (!customer) throw new NotFoundError("Customer record not found.");
    if (customer.status !== "PENDING_APPROVAL") {
      throw new BadRequestError(
        "Can only reject users who are currently pending approval."
      );
    }

    return prisma.customer.delete({
      where: { id: userId },
      select: { id: true, firstName: true, email: true },
    });
  }

  throw new BadRequestError("Invalid user type classification supplied.");
};

export const deactivateUserAccount = async (
  userId: string,
  targetType: UserType,
  adminId: string
) => {
  await validateAdminActor(adminId);

  if (targetType === "STAFF") {
    // Prevent self-deactivation
    if (userId === adminId) {
      throw new BadRequestError("You cannot deactivate your own admin account.");
    }

    const staff = await prisma.staff.findUnique({ where: { id: userId } });
    if (!staff) throw new NotFoundError("Staff account not found.");

    if (staff.status === "DEACTIVATED") {
      throw new BadRequestError("Staff account is already deactivated.");
    }

    return prisma.staff.update({
      where: { id: userId },
      data: { status: "DEACTIVATED", updatedById: adminId },
      select: { id: true, firstName: true, email: true, status: true },
    });
  }

  if (targetType === "CUSTOMER") {
    const customer = await prisma.customer.findUnique({
      where: { id: userId },
    });
    if (!customer) throw new NotFoundError("Customer account not found.");

    if (customer.status === "DEACTIVATED") {
      throw new BadRequestError("Customer account is already deactivated.");
    }

    return prisma.customer.update({
      where: { id: userId },
      data: { status: "DEACTIVATED" },
      select: { id: true, firstName: true, email: true, status: true },
    });
  }

  throw new BadRequestError("Invalid user type classification supplied.");
};

export const reactivateUserAccount = async (
  userId: string,
  targetType: UserType,
  adminId: string
) => {
  await validateAdminActor(adminId);

  if (targetType === "STAFF") {
    const staff = await prisma.staff.findUnique({ where: { id: userId } });
    if (!staff) throw new NotFoundError("Staff account not found.");
    if (staff.status === "ACTIVE") {
      throw new BadRequestError("Account is already active.");
    }

    return prisma.staff.update({
      where: { id: userId },
      data: { status: "ACTIVE", updatedById: adminId },
      select: { id: true, firstName: true, email: true, status: true },
    });
  }

  if (targetType === "CUSTOMER") {
    const customer = await prisma.customer.findUnique({
      where: { id: userId },
    });
    if (!customer) throw new NotFoundError("Customer account not found.");
    if (customer.status === "ACTIVE") {
      throw new BadRequestError("Account is already active.");
    }

    return prisma.customer.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
      select: { id: true, firstName: true, email: true, status: true },
    });
  }

  throw new BadRequestError("Invalid user type classification supplied.");
};