"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reopenCase = exports.closeCaseWithFeedback = exports.resolveCase = exports.givePriority = exports.validateHierarchyScopeforpriority = exports.getCaseWithStructuralScope = exports.getCaseBasedonPriority = exports.reassignOpenCase = exports.closeCaseReport = exports.assignCaseSupport = exports.createCase = exports.getPrivilegedBroadcastStaff = exports.getCase = exports.getAllCases = void 0;
exports.hasStructuralAuthorization = hasStructuralAuthorization;
exports.processPriorityChangeNotifications = processPriorityChangeNotifications;
const database_1 = require("../../config/database");
const error_1 = require("../../utils/error");
const client_1 = require("../../../generated/prisma/client");
const email_1 = require("../../utils/email");
const notification_service_1 = require("../notifications/notification.service");
const email_2 = require("../../utils/email");
const case_event_1 = require("./case.event");
const case_notification_1 = require("./case.notification");
const validation_1 = require("./validation");
const default_permission_1 = require("../../config/default.permission");
const email_3 = require("../../utils/email");
const env_1 = require("../../config/env");
const email_4 = require("../../utils/email");
const getAllCases = async (page = 1, limit = 10, sortBy = "createdAt", order = "desc") => {
    const skip = (page - 1) * limit;
    const orderBy = {};
    switch (sortBy) {
        case "priority":
            orderBy.priority = order;
            break;
        case "status":
            orderBy.status = order;
            break;
        case "customer":
            orderBy.customer = {
                firstName: order
            };
            break;
        default:
            orderBy.createdAt = order;
    }
    const [cases, total] = await Promise.all([
        database_1.prisma.caseReport.findMany({
            skip,
            take: limit,
            orderBy,
            include: {
                customer: {
                    include: {
                        organization: true
                    }
                },
                assignedSupport: true
            }
        }),
        database_1.prisma.caseReport.count()
    ]);
    return {
        cases,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};
exports.getAllCases = getAllCases;
const getCase = async (id) => {
    try {
        return await database_1.prisma.caseReport.findUnique({
            where: { id },
            include: {
                customer: { include: { organization: true } },
                assignedSupport: true,
                attachments: true,
                productCategory: { select: { id: true, name: true } },
                productSubcategory: { select: { id: true, name: true } },
                serviceType: { select: { id: true, name: true } },
                statusHistory: {
                    include: { changedBy: { select: { firstName: true, lastName: true } } },
                    orderBy: { createdAt: "asc" },
                },
            },
        });
    }
    catch (err) {
        if (err?.code === 'P2022') {
            // fallback: return case without statusHistory to avoid crashing when DB schema is out-of-sync
            const result = await database_1.prisma.caseReport.findUnique({
                where: { id },
                include: {
                    customer: { include: { organization: true } },
                    assignedSupport: true,
                    attachments: true,
                    productCategory: { select: { id: true, name: true } },
                    productSubcategory: { select: { id: true, name: true } },
                    serviceType: { select: { id: true, name: true } },
                    // omit statusHistory in fallback
                },
            });
            if (result && !result.statusHistory)
                result.statusHistory = [];
            return result;
        }
        throw err;
    }
};
exports.getCase = getCase;
function hasStructuralAuthorization(actor, targetCase) {
    const staff = actor.staffProfile || actor;
    if (!staff)
        return false;
    const caseSectionId = targetCase.productCategory?.sectionId;
    const caseDivisionId = targetCase.productCategory?.section?.divisionId;
    const caseDepartmentId = targetCase.productCategory?.section?.division?.departmentId;
    if (staff.managedSectionId && staff.managedSectionId === caseSectionId) {
        return true;
    }
    if (staff.managedDivisionId && staff.managedDivisionId === caseDivisionId) {
        return true;
    }
    if (staff.managedDepartmentId && staff.managedDepartmentId === caseDepartmentId) {
        return true;
    }
    return false;
}
const getUpwardManagementRecipients = async (assignedStaffId) => {
    const recipientIds = new Set();
    const staff = await database_1.prisma.staff.findUnique({
        where: { id: assignedStaffId },
        include: {
            section: {
                include: {
                    division: {
                        include: {
                            department: true,
                        },
                    },
                },
            },
        },
    });
    if (!staff)
        return [];
    const getManagerOfUnit = async (unitType, unitId) => {
        if (!unitId)
            return null;
        const manager = await database_1.prisma.staff.findFirst({
            where: {
                [`managed${unitType.charAt(0).toUpperCase() + unitType.slice(1)}Id`]: unitId,
            },
            select: { id: true },
        });
        return manager?.id || null;
    };
    if (staff.section) {
        const sectionId = staff.sectionId;
        const divisionId = staff.section.divisionId;
        const departmentId = staff.section.division?.departmentId;
        const sectionManagerId = await getManagerOfUnit("section", sectionId);
        if (sectionManagerId && sectionManagerId !== assignedStaffId) {
            recipientIds.add(sectionManagerId);
        }
        const divManagerId = await getManagerOfUnit("division", divisionId);
        if (divManagerId && divManagerId !== assignedStaffId) {
            recipientIds.add(divManagerId);
        }
        const deptManagerId = await getManagerOfUnit("department", departmentId);
        if (deptManagerId && deptManagerId !== assignedStaffId) {
            recipientIds.add(deptManagerId);
        }
    }
    const systemAdmins = await database_1.prisma.staff.findMany({
        where: { isSAdmin: true },
        select: { id: true },
    });
    systemAdmins.forEach((admin) => {
        if (admin.id !== assignedStaffId) {
            recipientIds.add(admin.id);
        }
    });
    return Array.from(recipientIds);
};
const triggerStatusNotification = async (caseDetails, newStatus) => {
    if (!caseDetails?.customer?.email)
        return;
    await (0, email_1.sendStatusUpdateEmail)({
        customerEmail: caseDetails.customer.email,
        customerName: caseDetails.customer.fullName,
        caseNumber: caseDetails.caseNumber,
        subjectLine: caseDetails.subject,
        newStatus: newStatus,
    });
};
const getPrivilegedBroadcastStaff = async () => {
    return await database_1.prisma.staff.findMany({
        where: {
            status: "ACTIVE",
            OR: [
                { isSAdmin: true },
                {
                    staffPermissions: {
                        some: {
                            permission: {
                                code: default_permission_1.PERMISSIONS.RECEIVE_NEW_CASE,
                            },
                        },
                    },
                },
            ],
        },
        select: { id: true, email: true },
    });
};
exports.getPrivilegedBroadcastStaff = getPrivilegedBroadcastStaff;
const createCase = async (input) => {
    const { creationReason, staffActorId, attachments = [], ...caseData } = input;
    const isStaff = Boolean(staffActorId);
    const uploaderType = isStaff ? "STAFF" : "CUSTOMER";
    if (isStaff && !creationReason) {
        throw new Error("Creation reason is required when staff creates a case on behalf of a customer.");
    }
    const newCase = await database_1.prisma.$transaction(async (tx) => {
        const createdCase = await tx.caseReport.create({
            data: {
                ...caseData,
                creationReason: creationReason || null,
                status: client_1.CaseStatus.OPEN,
                updatedById: staffActorId || null,
                attachments: attachments.length > 0
                    ? {
                        create: attachments.map((file) => ({
                            fileName: file.fileName,
                            storagePath: file.storagePath,
                            fileSizeBytes: BigInt(file.fileSizeBytes),
                            mimeType: file.mimeType,
                            uploaderType: uploaderType,
                            uploadedByCustomerId: isStaff ? null : caseData.customerId,
                            uploadedByStaffId: isStaff ? staffActorId : null,
                        })),
                    }
                    : undefined,
            },
            include: {
                attachments: true,
            },
        });
        await tx.caseStatusHistory.create({
            data: {
                caseReport: {
                    connect: { id: createdCase.id },
                },
                changedBy: staffActorId ? { connect: { id: staffActorId } } : undefined,
                fromStatus: client_1.CaseStatus.OPEN,
                toStatus: client_1.CaseStatus.OPEN,
                oldPriority: null,
                newPriority: null,
                oldAgentId: null,
                newAgentId: null,
            },
        });
        return createdCase;
    });
    const completeCaseDetails = await database_1.prisma.caseReport.findUnique({
        where: { id: newCase.id },
        include: {
            customer: true,
            updatedBy: true,
            attachments: true,
        },
    });
    if (completeCaseDetails) {
        const customerFullName = `${completeCaseDetails.customer?.firstName || ""} ${completeCaseDetails.customer?.lastName || ""}`.trim() || "Customer";
        const staffFullName = completeCaseDetails.updatedBy
            ? `${completeCaseDetails.updatedBy.firstName || ""} ${completeCaseDetails.updatedBy.lastName || ""}`.trim()
            : "Staff";
        const creatorName = isStaff ? staffFullName : customerFullName;
        try {
            const broadcastStaff = await (0, exports.getPrivilegedBroadcastStaff)();
            if (broadcastStaff.length > 0) {
                const notifMessage = isStaff
                    ? `A new support case (#${completeCaseDetails.caseNumber}) was logged by ${staffFullName} on behalf of ${customerFullName}.`
                    : `New case #${completeCaseDetails.caseNumber} arrived from ${customerFullName}.`;
                await database_1.prisma.notification.createMany({
                    data: broadcastStaff.map((staff) => ({
                        recipientId: staff.id,
                        recipientType: "STAFF",
                        type: "NEW_CASE_ARRIVED",
                        caseReportId: completeCaseDetails.id,
                        message: notifMessage,
                    })),
                });
                const privilegedEmails = broadcastStaff
                    .map((s) => s.email)
                    .filter(Boolean);
                if (privilegedEmails.length > 0) {
                    const transporter = (0, email_3.getTransporter)();
                    await transporter.sendMail({
                        from: env_1.ENV.SMTP_FROM,
                        to: env_1.ENV.SHARED_SUPPORT_INBOX,
                        bcc: privilegedEmails,
                        subject: `[ACTION REQUIRED] New Ticket Available: #${completeCaseDetails.caseNumber}`,
                        html: `
              <div style="font-family: sans-serif; color: #334155; padding: 20px;">
                <p style="font-size: 14px;">${notifMessage}</p>
                <p style="font-size: 14px;"><b>Subject:</b> ${completeCaseDetails.subject}</p>
                <p style="font-size: 14px;">Please log in to your staff portal to assign this case.</p>
              </div>
            `,
                    });
                }
            }
        }
        catch (notifError) {
            console.error("[Case Creation] Failed to broadcast staff notifications:", notifError);
        }
        try {
            if (completeCaseDetails.customer?.email) {
                await (0, email_4.sendCaseCreationCustomerEmail)({
                    customerEmail: completeCaseDetails.customer.email,
                    customerName: customerFullName,
                    caseNumber: completeCaseDetails.caseNumber,
                    subjectLine: completeCaseDetails.subject,
                    description: completeCaseDetails.description,
                    isCreatedByStaff: isStaff,
                    creationReason: creationReason || null,
                });
            }
        }
        catch (emailError) {
            console.error("[Case Creation] Failed to send customer confirmation email:", emailError);
        }
        try {
            await (0, email_4.sendSharedSupportInboxAlert)({
                caseNumber: completeCaseDetails.caseNumber,
                subjectLine: completeCaseDetails.subject,
                description: completeCaseDetails.description,
                customerName: customerFullName,
                customerEmail: completeCaseDetails.customer?.email || "",
                branchName: completeCaseDetails.branchName,
                creatorName,
                creationReason: creationReason || null,
            });
        }
        catch (inboxError) {
            console.error("[Case Creation] Failed to send shared support inbox alert:", inboxError);
        }
    }
    const actorName = isStaff && completeCaseDetails?.updatedBy
        ? `${completeCaseDetails.updatedBy.firstName} ${completeCaseDetails.updatedBy.lastName}`
        : completeCaseDetails?.customer
            ? `${completeCaseDetails.customer.firstName} ${completeCaseDetails.customer.lastName}`
            : "Customer";
    case_event_1.CaseEventBroker.emit(case_event_1.CASE_EVENTS.CREATED, {
        caseId: newCase.id,
        caseNumber: newCase.caseNumber,
        subject: newCase.subject,
        currentStatus: newCase.status,
        priority: newCase.priority,
        actorName,
        assignedAgentId: newCase.assignedSupportId,
        sectionId: newCase.sectionId,
        attachmentCount: newCase.attachments?.length || 0,
    });
    return newCase;
};
exports.createCase = createCase;
const assignCaseSupport = async (caseId, assignedSupportId, operator) => {
    const targetCase = await database_1.prisma.caseReport.findUnique({
        where: { id: caseId },
        select: {
            id: true,
            caseNumber: true,
            customerId: true,
            subject: true,
            status: true,
            priority: true,
            assignedSupportId: true,
            assignedSupport: {
                select: {
                    id: true,
                    sectionId: true,
                    section: {
                        select: {
                            id: true,
                            divisionId: true,
                            division: {
                                select: {
                                    id: true,
                                    departmentId: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!targetCase) {
        throw new error_1.NotFoundError("Case report not found.");
    }
    const caseScope = {
        sectionId: targetCase.assignedSupport?.sectionId ?? null,
        divisionId: targetCase.assignedSupport?.section?.divisionId ?? null,
        departmentId: targetCase.assignedSupport?.section?.division?.departmentId ?? null,
    };
    await (0, validation_1.validateHierarchyScope)(operator, caseScope, assignedSupportId);
    await database_1.prisma.$transaction(async (tx) => {
        await tx.caseReport.update({
            where: { id: caseId },
            data: {
                assignedSupportId,
                status: client_1.CaseStatus.IN_PROGRESS,
                updatedById: operator.id,
            },
        });
        await tx.caseStatusHistory.create({
            data: {
                caseReportId: caseId,
                changedById: operator.id,
                fromStatus: targetCase.status,
                toStatus: client_1.CaseStatus.IN_PROGRESS,
                oldPriority: targetCase.priority,
                newPriority: targetCase.priority,
                oldAgentId: targetCase.assignedSupportId,
                newAgentId: assignedSupportId,
            },
        });
    });
    const completeCaseDetails = await database_1.prisma.caseReport.findUnique({
        where: { id: caseId },
        include: {
            customer: true,
            updatedBy: true,
            assignedSupport: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });
    if (!completeCaseDetails) {
        throw new error_1.NotFoundError("Updated case details could not be found.");
    }
    case_event_1.CaseEventBroker.emit(case_event_1.CASE_EVENTS.ASSIGNED, {
        caseId: completeCaseDetails.id,
        caseNumber: completeCaseDetails.caseNumber,
        subject: completeCaseDetails.subject,
        currentStatus: completeCaseDetails.status,
        priority: completeCaseDetails.priority,
        actorName: completeCaseDetails.updatedBy
            ? `${completeCaseDetails.updatedBy.firstName} ${completeCaseDetails.updatedBy.lastName}`
            : "Manager",
        assignedAgentId: completeCaseDetails.assignedSupportId,
        sectionId: completeCaseDetails.sectionId,
    });
    try {
        await (0, case_notification_1.processCaseNotifications)({
            caseId,
            caseNumber: completeCaseDetails.caseNumber,
            customerId: targetCase.customerId,
            assignedSupportId,
            previousSupportId: targetCase.assignedSupportId || null,
            operatorId: operator.id,
            isReassignment: false,
        });
    }
    catch (notificationError) {
        console.error("[Case Assignment] Notification error:", notificationError);
    }
    try {
        await triggerStatusNotification(completeCaseDetails, client_1.CaseStatus.IN_PROGRESS);
    }
    catch (emailError) {
        console.error("Asynchronous email tracking notice warning:", emailError);
    }
    return completeCaseDetails;
};
exports.assignCaseSupport = assignCaseSupport;
const closeCaseReport = async (caseId, resolutionSummary, operatorId) => {
    const targetCase = await database_1.prisma.caseReport.findUnique({
        where: { id: caseId },
    });
    if (!targetCase)
        throw new error_1.NotFoundError("Case file not found.");
    if (targetCase.status === client_1.CaseStatus.CLOSED)
        throw new error_1.BadRequestError("This case is already closed.");
    const result = await database_1.prisma.$transaction(async (tx) => {
        const updatedCase = await tx.caseReport.update({
            where: { id: caseId },
            data: {
                status: client_1.CaseStatus.CLOSED,
                resolutionSummary,
                closedById: operatorId,
                closedAt: new Date(),
                resolvedAt: new Date(),
                updatedById: operatorId,
            },
            include: { updatedBy: true, customer: true }
        });
        await tx.caseStatusHistory.create({
            data: {
                caseReportId: caseId,
                changedById: operatorId,
                fromStatus: targetCase.status,
                toStatus: client_1.CaseStatus.CLOSED,
                oldPriority: targetCase.priority,
                newPriority: targetCase.priority,
                oldAgentId: targetCase.assignedSupportId,
                newAgentId: targetCase.assignedSupportId,
            },
        });
        return updatedCase;
    });
    await triggerStatusNotification(result, client_1.CaseStatus.CLOSED);
    case_event_1.CaseEventBroker.emit(case_event_1.CASE_EVENTS.CLOSED, {
        caseId: result.id,
        caseNumber: result.caseNumber,
        subject: result.subject,
        currentStatus: result.status,
        priority: result.priority,
        actorName: result.updatedBy ? `${result.updatedBy.firstName} ${result.updatedBy.lastName}` : "System Admin",
        assignedAgentId: result.assignedSupportId,
        sectionId: result.sectionId,
    });
    return result;
};
exports.closeCaseReport = closeCaseReport;
const reassignOpenCase = async (caseId, newSupportId, operator) => {
    const targetCase = await database_1.prisma.caseReport.findUnique({
        where: { id: caseId },
    });
    if (!targetCase)
        throw new error_1.NotFoundError("Case record not found.");
    if (targetCase.status === client_1.CaseStatus.CLOSED ||
        targetCase.status === client_1.CaseStatus.CUSTOMER_CONFIRMATION) {
        throw new error_1.BadRequestError(`Cannot reassign this case. It is already marked as ${targetCase.status}.`);
    }
    await (0, validation_1.validateHierarchyScope)(operator, targetCase, newSupportId);
    const result = await database_1.prisma.$transaction(async (tx) => {
        const updatedCase = await tx.caseReport.update({
            where: { id: caseId },
            data: {
                assignedSupportId: newSupportId,
                status: client_1.CaseStatus.IN_PROGRESS,
                updatedById: operator.id,
            },
            include: { updatedBy: true },
        });
        await tx.caseStatusHistory.create({
            data: {
                caseReportId: caseId,
                changedById: operator.id,
                fromStatus: targetCase.status,
                toStatus: client_1.CaseStatus.IN_PROGRESS,
                oldPriority: targetCase.priority,
                newPriority: targetCase.priority,
                oldAgentId: targetCase.assignedSupportId,
                newAgentId: newSupportId,
            },
        });
        return updatedCase;
    });
    case_event_1.CaseEventBroker.emit(case_event_1.CASE_EVENTS.ASSIGNED, {
        caseId: result.id,
        caseNumber: result.caseNumber,
        subject: result.subject,
        currentStatus: result.status,
        priority: result.priority,
        actorName: result.updatedBy
            ? `${result.updatedBy.firstName} ${result.updatedBy.lastName}`
            : "Supervisor",
        assignedAgentId: result.assignedSupportId,
        sectionId: result.sectionId,
    });
    try {
        await (0, case_notification_1.processCaseNotifications)({
            caseId,
            caseNumber: result.caseNumber,
            customerId: targetCase.customerId,
            assignedSupportId: newSupportId,
            previousSupportId: targetCase.assignedSupportId || null,
            operatorId: operator.id,
            isReassignment: true,
        });
    }
    catch (notificationError) {
        console.error("[Open Case Reassignment] Notification error:", notificationError);
    }
    return result;
};
exports.reassignOpenCase = reassignOpenCase;
const getCaseBasedonPriority = async (priority) => {
    return await database_1.prisma.caseReport.findMany({
        where: { priority: priority },
        include: {
            assignedSupport: {
                select: {
                    id: true,
                    departmentId: true,
                    divisionId: true,
                    sectionId: true,
                },
            },
        },
    });
};
exports.getCaseBasedonPriority = getCaseBasedonPriority;
const getCaseWithStructuralScope = async (caseId) => {
    return await database_1.prisma.caseReport.findUnique({
        where: { id: caseId },
        include: {
            assignedSupport: {
                select: {
                    id: true,
                    sectionId: true,
                },
            },
        },
    });
};
exports.getCaseWithStructuralScope = getCaseWithStructuralScope;
const validateHierarchyScopeforpriority = async (operator, caseReport, assignedSupportId) => {
    if (operator.isSAdmin || operator.managerType === "DIRECTOR") {
        return;
    }
    // FIX: System Support bypass, matching assertCanSetPriority's design —
    // unrestricted, but ONLY for cases still unassigned.
    if (operator.isSystemSupport) {
        const isUnassigned = !caseReport.sectionId && !caseReport.divisionId && !caseReport.departmentId;
        if (!isUnassigned) {
            throw new error_1.ForbiddenError("System Support can only set priority on unassigned cases.");
        }
        return;
    }
    // FIX: removed `!operator.isManager ||` — managerType being set is
    // already proof of manager status; the separate isManager boolean can
    // go stale independently of the real managedDepartment/Division/Section
    // relation, which is exactly what broke Division Manager assignment earlier.
    if (!operator.managerType) {
        throw new error_1.ForbiddenError("You do not have permission to modify this case.");
    }
    let isCaseInScope = false;
    if (operator.managerType === "DEPARTMENT") {
        isCaseInScope = Boolean(operator.departmentId && caseReport.departmentId === operator.departmentId);
    }
    else if (operator.managerType === "DIVISION") {
        isCaseInScope = Boolean(operator.divisionId && caseReport.divisionId === operator.divisionId);
    }
    else if (operator.managerType === "SECTION") {
        isCaseInScope = Boolean(operator.sectionId && caseReport.sectionId === operator.sectionId);
    }
    if (!isCaseInScope) {
        throw new error_1.ForbiddenError(`Access Denied: This case belongs outside your ${operator.managerType.toLowerCase()} hierarchy.`);
    }
    if (assignedSupportId) {
        const targetStaff = await database_1.prisma.staff.findUnique({
            where: { id: assignedSupportId },
            select: {
                id: true,
                sectionId: true,
                section: {
                    select: {
                        id: true,
                        divisionId: true,
                        division: { select: { id: true, departmentId: true } },
                    },
                },
            },
        });
        if (!targetStaff) {
            throw new error_1.NotFoundError("Target support agent not found.");
        }
        const staffDepartmentId = targetStaff.section?.division?.departmentId ?? null;
        const staffDivisionId = targetStaff.section?.divisionId ?? null;
        const staffSectionId = targetStaff.sectionId ?? null;
        let isStaffInScope = false;
        if (operator.managerType === "DEPARTMENT") {
            isStaffInScope = staffDepartmentId === operator.departmentId;
        }
        else if (operator.managerType === "DIVISION") {
            isStaffInScope = staffDivisionId === operator.divisionId;
        }
        else if (operator.managerType === "SECTION") {
            isStaffInScope = staffSectionId === operator.sectionId;
        }
        if (!isStaffInScope) {
            throw new error_1.ForbiddenError(`Access Denied: The assigned agent belongs outside your ${operator.managerType.toLowerCase()}.`);
        }
    }
};
exports.validateHierarchyScopeforpriority = validateHierarchyScopeforpriority;
async function processPriorityChangeNotifications(params) {
    const { caseId, caseNumber, oldPriority, newPriority, assignedAgentId, operatorId } = params;
    const targetUserIds = new Set();
    const systemAdmins = await database_1.prisma.staff.findMany({
        where: { isSAdmin: true },
        select: { id: true },
    });
    systemAdmins.forEach((admin) => targetUserIds.add(admin.id));
    if (assignedAgentId) {
        targetUserIds.add(assignedAgentId);
    }
    const caseData = await database_1.prisma.caseReport.findUnique({
        where: { id: caseId },
        include: {
            assignedSupport: {
                include: {
                    section: {
                        include: {
                            division: {
                                include: {
                                    department: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    const secMgr = caseData?.assignedSupport?.section?.managerId;
    const divMgr = caseData?.assignedSupport?.section?.division?.managerId;
    const deptMgr = caseData?.assignedSupport?.section?.division?.department?.managerId;
    if (secMgr)
        targetUserIds.add(secMgr);
    if (divMgr)
        targetUserIds.add(divMgr);
    if (deptMgr)
        targetUserIds.add(deptMgr);
    targetUserIds.delete(operatorId);
    if (targetUserIds.size === 0)
        return;
    const notificationsData = Array.from(targetUserIds).map((recipientId) => ({
        recipientId,
        recipientType: client_1.PartyType.STAFF,
        message: `Priority for Case #${caseNumber} was changed from ${oldPriority || "UNASSIGNED"} to ${newPriority}.`,
        type: client_1.NotificationType.CASE_PRIORITY_CHANGED,
        caseReportId: caseId,
    }));
    await database_1.prisma.notification.createMany({
        data: notificationsData,
    });
}
const givePriority = async (caseId, priority, operator) => {
    const targetCase = await database_1.prisma.caseReport.findUnique({
        where: { id: caseId },
        include: {
            assignedSupport: {
                select: {
                    id: true,
                    sectionId: true,
                    section: {
                        select: {
                            id: true,
                            divisionId: true,
                            division: {
                                select: {
                                    id: true,
                                    departmentId: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!targetCase)
        throw new error_1.NotFoundError("Case file not found.");
    if (targetCase.status === client_1.CaseStatus.CLOSED ||
        targetCase.status === client_1.CaseStatus.CUSTOMER_CONFIRMATION) {
        throw new error_1.BadRequestError("Operational Refusal: Cannot modify priority for a closed or pending-feedback case.");
    }
    const caseScope = {
        sectionId: targetCase.assignedSupport?.sectionId ?? null,
        divisionId: targetCase.assignedSupport?.section?.divisionId ?? null,
        departmentId: targetCase.assignedSupport?.section?.division?.departmentId ?? null,
    };
    await (0, exports.validateHierarchyScopeforpriority)(operator, caseScope, targetCase.assignedSupportId || undefined);
    const oldPriority = targetCase.priority;
    const result = await database_1.prisma.$transaction(async (tx) => {
        const updatedCase = await tx.caseReport.update({
            where: { id: caseId },
            data: {
                priority,
                updatedById: operator.id,
            },
            include: { updatedBy: true },
        });
        await tx.caseStatusHistory.create({
            data: {
                caseReportId: caseId,
                changedById: operator.id,
                fromStatus: targetCase.status,
                toStatus: targetCase.status,
                oldPriority: targetCase.priority,
                newPriority: priority,
                oldAgentId: targetCase.assignedSupportId,
                newAgentId: targetCase.assignedSupportId,
            },
        });
        return updatedCase;
    });
    case_event_1.CaseEventBroker.emit(case_event_1.CASE_EVENTS.PRIORITY_CHANGED, {
        caseId: result.id,
        caseNumber: result.caseNumber,
        subject: result.subject,
        currentStatus: result.status,
        priority: result.priority,
        actorName: result.updatedBy
            ? `${result.updatedBy.firstName} ${result.updatedBy.lastName}`
            : "Staff Member",
        assignedAgentId: result.assignedSupportId,
        sectionId: result.sectionId ?? null,
    });
    try {
        await processPriorityChangeNotifications({
            caseId: result.id,
            caseNumber: result.caseNumber,
            oldPriority: String(oldPriority),
            newPriority: String(priority),
            assignedAgentId: result.assignedSupportId,
            operatorId: operator.id,
        });
    }
    catch (notificationError) {
        console.error("[Priority Update] Notification dispatch error:", notificationError);
    }
    return result;
};
exports.givePriority = givePriority;
const resolveCase = async (caseId, resolutionSummary, agentId) => {
    if (!resolutionSummary || resolutionSummary.trim().length < 10) {
        throw new error_1.BadRequestError("Please provide a thorough resolution summary (at least 10 characters).");
    }
    const targetCase = await database_1.prisma.caseReport.findUnique({
        where: { id: caseId },
    });
    if (!targetCase)
        throw new error_1.NotFoundError("Case file not found.");
    if (targetCase.status === client_1.CaseStatus.CLOSED) {
        throw new error_1.BadRequestError("Cannot resolve a case that is already closed.");
    }
    const updatedCase = await database_1.prisma.$transaction(async (tx) => {
        const updated = await tx.caseReport.update({
            where: { id: caseId },
            data: {
                status: client_1.CaseStatus.CUSTOMER_CONFIRMATION,
                resolutionSummary: resolutionSummary.trim(),
                resolvedAt: new Date(),
                updatedById: agentId,
            },
            include: { customer: true, updatedBy: true },
        });
        await tx.caseStatusHistory.create({
            data: {
                caseReportId: caseId,
                changedById: agentId,
                fromStatus: targetCase.status,
                toStatus: client_1.CaseStatus.CUSTOMER_CONFIRMATION,
                oldPriority: targetCase.priority,
                newPriority: targetCase.priority,
                oldAgentId: targetCase.assignedSupportId,
                newAgentId: targetCase.assignedSupportId,
            },
        });
        return updated;
    });
    try {
        await (0, email_2.triggerResolutionEmail)(updatedCase);
    }
    catch (emailError) {
        console.error("De-coupled resolution email notification error: ", emailError);
    }
    case_event_1.CaseEventBroker.emit(case_event_1.CASE_EVENTS.RESOLVED, {
        caseId: updatedCase.id,
        caseNumber: updatedCase.caseNumber,
        subject: updatedCase.subject,
        currentStatus: updatedCase.status,
        priority: updatedCase.priority,
        actorName: updatedCase.updatedBy ? `${updatedCase.updatedBy.firstName} ${updatedCase.updatedBy.lastName}` : "Agent",
        assignedAgentId: updatedCase.assignedSupportId,
        sectionId: updatedCase.sectionId,
    });
    return updatedCase;
};
exports.resolveCase = resolveCase;
const closeCaseWithFeedback = async (caseId, rating, comment, customerId) => {
    if (rating < 1 || rating > 5) {
        throw new error_1.BadRequestError("Rating scale value must range between 1 and 5 stars.");
    }
    const targetCase = await database_1.prisma.caseReport.findUnique({
        where: { id: caseId },
    });
    if (!targetCase)
        throw new error_1.NotFoundError("Case file not found.");
    if (targetCase.customerId !== customerId) {
        throw new error_1.BadRequestError("Unauthorized: You do not own this case file.");
    }
    const closedCase = await database_1.prisma.$transaction(async (tx) => {
        await tx.feedback.create({
            data: {
                caseReportId: caseId,
                rating,
                comment: comment?.trim() || null,
            },
        });
        const updated = await tx.caseReport.update({
            where: { id: caseId },
            data: { status: client_1.CaseStatus.CLOSED },
        });
        await tx.caseStatusHistory.create({
            data: {
                caseReportId: caseId,
                changedById: targetCase.customerId,
                fromStatus: targetCase.status,
                toStatus: client_1.CaseStatus.CLOSED,
                oldPriority: targetCase.priority,
                newPriority: targetCase.priority,
                oldAgentId: targetCase.assignedSupportId,
                newAgentId: targetCase.assignedSupportId,
            },
        });
        return updated;
    });
    try {
        const internalRecipients = new Set();
        if (targetCase.assignedSupportId) {
            internalRecipients.add(targetCase.assignedSupportId);
            const managers = await getUpwardManagementRecipients(targetCase.assignedSupportId);
            managers.forEach(id => internalRecipients.add(id));
        }
        if (internalRecipients.size > 0) {
            await notification_service_1.NotificationService.createSystemNotification({
                recipientIds: Array.from(internalRecipients),
                recipientType: client_1.PartyType.STAFF,
                type: client_1.NotificationType.CASE_CLOSED,
                message: `Case Closed: Case #${closedCase.caseNumber} has been successfully closed by the customer with a rating of ${rating}/5.`,
                caseReportId: closedCase.id,
            });
        }
    }
    catch (notifErr) {
        console.error("Warning: Internal closing confirmation alerts failed to post:", notifErr);
    }
    return closedCase;
};
exports.closeCaseWithFeedback = closeCaseWithFeedback;
const reopenCase = async (caseId, customerId) => {
    const targetCase = await database_1.prisma.caseReport.findUnique({
        where: { id: caseId },
    });
    if (!targetCase)
        throw new error_1.NotFoundError("Case file not found.");
    if (targetCase.customerId !== customerId) {
        throw new error_1.BadRequestError("Unauthorized: You do not own this case file.");
    }
    if (targetCase.status !== client_1.CaseStatus.CUSTOMER_CONFIRMATION) {
        throw new error_1.BadRequestError("Validation Failure: Only cases marked as CUSTOMER_CONFIRMATION can be rejected and reopened.");
    }
    const reopenedCase = await database_1.prisma.$transaction(async (tx) => {
        const updated = await tx.caseReport.update({
            where: { id: caseId },
            data: {
                status: client_1.CaseStatus.IN_PROGRESS,
                resolvedAt: null,
                resolutionSummary: null,
            },
            include: { customer: true },
        });
        await tx.caseStatusHistory.create({
            data: {
                caseReportId: caseId,
                changedById: targetCase.customerId,
                fromStatus: client_1.CaseStatus.CUSTOMER_CONFIRMATION,
                toStatus: client_1.CaseStatus.IN_PROGRESS,
                oldPriority: targetCase.priority,
                newPriority: targetCase.priority,
                oldAgentId: targetCase.assignedSupportId,
                newAgentId: targetCase.assignedSupportId,
            },
        });
        return updated;
    });
    case_event_1.CaseEventBroker.emit(case_event_1.CASE_EVENTS.REOPENED, {
        caseId: reopenedCase.id,
        caseNumber: reopenedCase.caseNumber,
        subject: reopenedCase.subject,
        currentStatus: reopenedCase.status,
        priority: reopenedCase.priority,
        actorName: reopenedCase.customer ? `${reopenedCase.customer.firstName} ${reopenedCase.customer.lastName}` : "Customer",
        assignedAgentId: reopenedCase.assignedSupportId,
        sectionId: reopenedCase.sectionId,
    });
    return reopenedCase;
};
exports.reopenCase = reopenCase;
