"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCasePriority = exports.assignCaseSupport = void 0;
const database_1 = require("../../config/database");
const error_1 = require("../../utils/error");
const client_1 = require("../../../generated/prisma/client");
const case_notification_1 = require("../cases/case.notification");
const case_event_1 = require("../cases/case.event");
const email_1 = require("../../utils/email");
const statusHistory_service_1 = require("../cases/statusHistory.service");
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
const assignCaseSupport = async (caseId, assignedSupportId, operatorId, requireCurrentlyUnassigned = false) => {
    const targetCase = await database_1.prisma.caseReport.findUnique({ where: { id: caseId } });
    if (!targetCase)
        throw new error_1.NotFoundError("Case file not found.");
    await database_1.prisma.$transaction(async (tx) => {
        const updateResult = await tx.caseReport.updateMany({
            where: {
                id: caseId,
                ...(requireCurrentlyUnassigned ? { assignedSupportId: null } : {}),
            },
            data: {
                assignedSupportId,
                status: client_1.CaseStatus.IN_PROGRESS,
                updatedById: operatorId,
            },
        });
        if (updateResult.count === 0) {
            throw new error_1.ConflictError("This case was just assigned by someone else. Please refresh your queue and pick another case.");
        }
        await (0, statusHistory_service_1.createStatusHistory)(tx, {
            caseReportId: caseId,
            changedById: operatorId,
            actorType: "STAFF",
            actorId: operatorId,
            fromStatus: targetCase.status,
            toStatus: client_1.CaseStatus.IN_PROGRESS,
            oldPriority: targetCase.priority,
            newPriority: targetCase.priority,
            oldAgentId: targetCase.assignedSupportId,
            newAgentId: assignedSupportId,
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
            operatorId,
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
const updateCasePriority = async (caseId, priority, operatorId) => {
    const targetCase = await database_1.prisma.caseReport.findUnique({
        where: { id: caseId },
    });
    if (!targetCase)
        throw new error_1.NotFoundError("Case file not found.");
    if (targetCase.status === client_1.CaseStatus.CLOSED || targetCase.status === client_1.CaseStatus.CUSTOMER_CONFIRMATION) {
        throw new error_1.BadRequestError("Operational Refusal: Cannot modify priority for a closed or pending-feedback case.");
    }
    const result = await database_1.prisma.$transaction(async (tx) => {
        const updatedCase = await tx.caseReport.update({
            where: { id: caseId },
            data: {
                priority,
                updatedById: operatorId,
            },
            include: { updatedBy: true },
        });
        await tx.caseStatusHistory.create({
            data: {
                caseReportId: caseId,
                changedById: operatorId,
                actorType: "STAFF",
                actorId: operatorId,
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
        actorName: result.updatedBy ? `${result.updatedBy.firstName} ${result.updatedBy.lastName}` : "Staff Member",
        assignedAgentId: result.assignedSupportId,
        sectionId: result.sectionId,
    });
    return result;
};
exports.updateCasePriority = updateCasePriority;
