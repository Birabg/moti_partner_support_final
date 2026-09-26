"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactivateUserAccount = exports.deactivateUserAccount = exports.rejectUserAccount = exports.approveUserAccount = exports.getPendingUsers = void 0;
const database_1 = require("../../config/database");
const error_1 = require("../../utils/error");
const roleassignment_service_1 = require("../roleassignment/roleassignment.service");
const email_1 = require("../../utils/email");
const env_1 = require("../../config/env");
const getPendingUsers = async () => {
    const pendingStaff = await database_1.prisma.staff.findMany({
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
    const pendingCustomers = await database_1.prisma.customer.findMany({
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
    const formatFullName = (firstName, middleName, lastName) => [firstName, middleName, lastName].filter(Boolean).join(" ").trim();
    const getRole = (staff) => {
        if (staff.isSAdmin)
            return "SYSTEM_ADMIN";
        if (staff.isDirector)
            return "DIRECTOR";
        if (staff.isManager)
            return "MANAGER";
        if (staff.isPSsupport)
            return "PS_SUPPORT";
        if (staff.isSystemSupport)
            return "SYSTEM_SUPPORT";
        return "STAFF";
    };
    const getManagerType = (staff) => {
        if (!staff.isManager)
            return null;
        if (staff.managedDepartment)
            return "DEPARTMENT";
        if (staff.managedDivision)
            return "DIVISION";
        if (staff.managedSection)
            return "SECTION";
        return null;
    };
    const getDepartmentId = (staff) => staff.managedDepartment?.id || null;
    const getDivisionId = (staff) => staff.managedDivision?.id || null;
    const getSectionId = (staff) => staff.managedSection?.id || staff.sectionId || null;
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
exports.getPendingUsers = getPendingUsers;
const validateAdminActor = async (adminId) => {
    if (!adminId) {
        throw new error_1.BadRequestError("Administrator actor context ID is missing.");
    }
    const admin = await database_1.prisma.staff.findUnique({
        where: { id: adminId },
        select: { id: true, isSAdmin: true, status: true },
    });
    if (!admin || admin.status !== "ACTIVE") {
        throw new error_1.UnauthorizedError("Administrator account is invalid or inactive.");
    }
    if (!admin.isSAdmin) {
        throw new error_1.ForbiddenError("Forbidden: Only system administrators can perform this action.");
    }
};
const approveUserAccount = async (input) => {
    const { userId, userType = "STAFF", role, managerType, departmentId, divisionId, sectionId, permissionCodes, approvedById, } = input;
    let approvedUser = null;
    let emailLogId = null;
    if (userType === "STAFF") {
        console.log("[approveUserAccount] entering STAFF branch");
        const txResult = await database_1.prisma.$transaction(async (tx) => {
            await (0, roleassignment_service_1.AssignStaffRole)({
                staffId: userId,
                role: role,
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
            if (!staffRecord)
                throw new error_1.NotFoundError("Staff record not found.");
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
            const txResult = await database_1.prisma.$transaction(async (tx) => {
                const customer = await tx.customer.findUnique({ where: { id: userId } });
                if (!customer)
                    throw new error_1.NotFoundError("Customer record not found.");
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
        }
        catch (customerTxError) {
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
            const deliverySuccess = await (0, email_1.sendAccountApprovalEmail)(approvedUser.email, fullName, env_1.ENV.FRONTEND_URL ?? "", userType);
            console.log(`[approveUserAccount] sendAccountApprovalEmail returned: ${deliverySuccess}`);
            await database_1.prisma.emailLog.update({
                where: { id: emailLogId },
                data: {
                    status: deliverySuccess ? "SENT" : "FAILED",
                    sentAt: deliverySuccess ? new Date() : null,
                    retryCount: deliverySuccess ? 0 : 1,
                },
            });
        }
        catch (emailError) {
            console.error(`[approveUserAccount] Failed to send approval email to ${userType}:`, emailError);
            await database_1.prisma.emailLog.update({
                where: { id: emailLogId },
                data: { status: "FAILED", retryCount: 1 },
            });
        }
    }
    else {
        console.warn("[approveUserAccount] Skipped email — approvedUser or emailLogId was falsy. userType received:", userType);
    }
    return approvedUser;
};
exports.approveUserAccount = approveUserAccount;
const rejectUserAccount = async (userId, targetType, adminId) => {
    await validateAdminActor(adminId);
    if (targetType === "STAFF") {
        if (userId === adminId) {
            throw new error_1.BadRequestError("You cannot reject your own account.");
        }
        const staff = await database_1.prisma.staff.findUnique({ where: { id: userId } });
        if (!staff)
            throw new error_1.NotFoundError("Staff record not found.");
        if (staff.status !== "PENDING_APPROVAL") {
            throw new error_1.BadRequestError("Can only reject users who are currently pending approval.");
        }
        return database_1.prisma.staff.delete({
            where: { id: userId },
            select: { id: true, firstName: true, email: true },
        });
    }
    if (targetType === "CUSTOMER") {
        const customer = await database_1.prisma.customer.findUnique({
            where: { id: userId },
        });
        if (!customer)
            throw new error_1.NotFoundError("Customer record not found.");
        if (customer.status !== "PENDING_APPROVAL") {
            throw new error_1.BadRequestError("Can only reject users who are currently pending approval.");
        }
        return database_1.prisma.customer.delete({
            where: { id: userId },
            select: { id: true, firstName: true, email: true },
        });
    }
    throw new error_1.BadRequestError("Invalid user type classification supplied.");
};
exports.rejectUserAccount = rejectUserAccount;
const deactivateUserAccount = async (userId, targetType, adminId) => {
    await validateAdminActor(adminId);
    if (targetType === "STAFF") {
        // Prevent self-deactivation
        if (userId === adminId) {
            throw new error_1.BadRequestError("You cannot deactivate your own admin account.");
        }
        const staff = await database_1.prisma.staff.findUnique({ where: { id: userId } });
        if (!staff)
            throw new error_1.NotFoundError("Staff account not found.");
        if (staff.status === "DEACTIVATED") {
            throw new error_1.BadRequestError("Staff account is already deactivated.");
        }
        return database_1.prisma.staff.update({
            where: { id: userId },
            data: { status: "DEACTIVATED", updatedById: adminId },
            select: { id: true, firstName: true, email: true, status: true },
        });
    }
    if (targetType === "CUSTOMER") {
        const customer = await database_1.prisma.customer.findUnique({
            where: { id: userId },
        });
        if (!customer)
            throw new error_1.NotFoundError("Customer account not found.");
        if (customer.status === "DEACTIVATED") {
            throw new error_1.BadRequestError("Customer account is already deactivated.");
        }
        return database_1.prisma.customer.update({
            where: { id: userId },
            data: { status: "DEACTIVATED" },
            select: { id: true, firstName: true, email: true, status: true },
        });
    }
    throw new error_1.BadRequestError("Invalid user type classification supplied.");
};
exports.deactivateUserAccount = deactivateUserAccount;
const reactivateUserAccount = async (userId, targetType, adminId) => {
    await validateAdminActor(adminId);
    if (targetType === "STAFF") {
        const staff = await database_1.prisma.staff.findUnique({ where: { id: userId } });
        if (!staff)
            throw new error_1.NotFoundError("Staff account not found.");
        if (staff.status === "ACTIVE") {
            throw new error_1.BadRequestError("Account is already active.");
        }
        return database_1.prisma.staff.update({
            where: { id: userId },
            data: { status: "ACTIVE", updatedById: adminId },
            select: { id: true, firstName: true, email: true, status: true },
        });
    }
    if (targetType === "CUSTOMER") {
        const customer = await database_1.prisma.customer.findUnique({
            where: { id: userId },
        });
        if (!customer)
            throw new error_1.NotFoundError("Customer account not found.");
        if (customer.status === "ACTIVE") {
            throw new error_1.BadRequestError("Account is already active.");
        }
        return database_1.prisma.customer.update({
            where: { id: userId },
            data: { status: "ACTIVE" },
            select: { id: true, firstName: true, email: true, status: true },
        });
    }
    throw new error_1.BadRequestError("Invalid user type classification supplied.");
};
exports.reactivateUserAccount = reactivateUserAccount;
