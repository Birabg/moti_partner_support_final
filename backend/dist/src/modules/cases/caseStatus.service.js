"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = updateStatus;
const database_1 = require("../../config/database");
const client_1 = require("../../../generated/prisma/client");
const caseStatus_validation_1 = __importDefault(require("./caseStatus.validation"));
const case_event_1 = require("./case.event");
const email_1 = require("../../utils/email");
const statusHistory_service_1 = require("./statusHistory.service");
const env_1 = require("../../config/env");
const getCaseUpdateStaffRecipients = async (caseId, excludeStaffId) => {
    const targetCase = await database_1.prisma.caseReport.findUnique({
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
    if (!targetCase)
        return [];
    const recipientIds = new Set();
    if (targetCase.assignedSupportId && targetCase.assignedSupportId !== excludeStaffId) {
        recipientIds.add(targetCase.assignedSupportId);
    }
    if (targetCase.assignedSupport?.section) {
        const staff = targetCase.assignedSupport;
        const sectionId = staff.sectionId;
        const divisionId = staff.section?.divisionId;
        const departmentId = staff.section?.division?.departmentId;
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
        const sectionManagerId = await getManagerOfUnit("section", sectionId);
        if (sectionManagerId && sectionManagerId !== excludeStaffId) {
            recipientIds.add(sectionManagerId);
        }
        const divManagerId = await getManagerOfUnit("division", divisionId);
        if (divManagerId && divManagerId !== excludeStaffId) {
            recipientIds.add(divManagerId);
        }
        const deptManagerId = await getManagerOfUnit("department", departmentId);
        if (deptManagerId && deptManagerId !== excludeStaffId) {
            recipientIds.add(deptManagerId);
        }
    }
    const systemAdmins = await database_1.prisma.staff.findMany({
        where: { isSAdmin: true },
        select: { id: true },
    });
    systemAdmins.forEach((admin) => {
        if (admin.id !== excludeStaffId) {
            recipientIds.add(admin.id);
        }
    });
    if (recipientIds.size === 0)
        return [];
    const staffDetails = await database_1.prisma.staff.findMany({
        where: { id: { in: Array.from(recipientIds) } },
        select: { id: true, email: true, firstName: true, lastName: true },
    });
    return staffDetails.filter(s => s.email);
};
async function updateStatus(caseId, newStatus, actor, opts) {
    const targetCase = await database_1.prisma.caseReport.findUnique({ where: { id: caseId }, include: { customer: true, assignedSupport: true } });
    if (!targetCase)
        throw new Error("Case not found.");
    const actorId = actor?.id || actor?.userId || null;
    // Enrich actor flags from DB when possible
    if (actorId) {
        const staff = await database_1.prisma.staff.findUnique({ where: { id: actorId }, select: { id: true, isSAdmin: true, isPSsupport: true, isManager: true, isDirector: true } });
        if (staff) {
            actor.isSAdmin = !!staff.isSAdmin;
            actor.isPSsupport = !!staff.isPSsupport;
            actor.isManager = !!staff.isManager;
            actor.isDirector = !!staff.isDirector;
        }
        else {
            const cust = await database_1.prisma.customer.findUnique({ where: { id: actorId }, select: { id: true } });
            if (cust)
                actor.isCustomer = true;
        }
    }
    const validation = (0, caseStatus_validation_1.default)(targetCase.status, newStatus, actor);
    if (!validation.allowed) {
        throw new Error(validation.reason || "Transition not allowed.");
    }
    // Enforce Cancelled only by system admin (double-check at service layer)
    if (newStatus === client_1.CaseStatus.CANCELLED && !actor.isSAdmin) {
        throw new Error("Only System Administrators may cancel cases.");
    }
    // PENDING: require reason and restrict actors to customer (case owner), assigned agent, manager/director, or system admin
    if (newStatus === client_1.CaseStatus.PENDING) {
        if (!opts?.reason || typeof opts.reason !== 'string' || opts.reason.trim().length < 5) {
            throw new Error("Pending description is required (min 5 chars).");
        }
        const actorIsOwnerCustomer = !!(actor.isCustomer && actorId && targetCase.customerId && actorId === targetCase.customerId);
        const actorIsAssignedAgent = !!(actorId && targetCase.assignedSupportId && actorId === targetCase.assignedSupportId);
        const actorIsPrivilegedStaff = !!(actor.isManager || actor.isDirector || actor.isSAdmin);
        if (!actorIsOwnerCustomer && !actorIsAssignedAgent && !actorIsPrivilegedStaff) {
            throw new Error("Only the case owner (customer), the assigned agent, manager/director, or system admin may place a case on PENDING.");
        }
    }
    // ESCALATED: require reason
    if (newStatus === client_1.CaseStatus.ESCALATED) {
        if (!opts?.reason || typeof opts.reason !== 'string' || opts.reason.trim().length < 5) {
            throw new Error("Escalation reason is required (min 5 chars).");
        }
    }
    // Enforce resolutionSummary when marking RESOLVED
    if (newStatus === client_1.CaseStatus.RESOLVED && (!opts?.resolutionSummary || opts.resolutionSummary.trim().length < 10)) {
        throw new Error("A detailed resolutionSummary (min 10 chars) is required when resolving a case.");
    }
    const updateData = { status: newStatus, updatedById: actorId };
    if (newStatus === client_1.CaseStatus.RESOLVED) {
        updateData.resolutionSummary = opts?.resolutionSummary?.trim() ?? null;
        updateData.resolvedAt = new Date();
    }
    if (newStatus === client_1.CaseStatus.CLOSED) {
        updateData.closedAt = new Date();
        updateData.closedById = actorId;
    }
    // Role-based enforcement: system admins bypass, other actors restricted
    if (!actor.isSAdmin) {
        // If attempting to CLOSE from CUSTOMER_CONFIRMATION, require customer or privileged staff
        if (newStatus === client_1.CaseStatus.CLOSED && targetCase.status === client_1.CaseStatus.CUSTOMER_CONFIRMATION) {
            if (!(actor.isCustomer && actorId === targetCase.customerId) && !actor.isManager && !actor.isDirector) {
                throw new Error("Only the case owner (customer) or privileged staff can confirm closure.");
            }
        }
        // Only assigned agent or manager/director may set IN_PROGRESS, RESOLVED, or ESCALATED
        if ([client_1.CaseStatus.IN_PROGRESS, client_1.CaseStatus.RESOLVED, client_1.CaseStatus.ESCALATED].some(s => s === newStatus)) {
            const isAssignedAgent = actorId && targetCase.assignedSupportId && actorId === targetCase.assignedSupportId;
            if (!isAssignedAgent && !actor.isManager && !actor.isDirector) {
                throw new Error("Only the assigned agent or a manager/director can perform this transition.");
            }
        }
    }
    const updated = await database_1.prisma.$transaction(async (tx) => {
        const updatedCase = await tx.caseReport.update({ where: { id: caseId }, data: updateData, include: { customer: true, updatedBy: true } });
        await (0, statusHistory_service_1.createStatusHistory)(tx, {
            caseReportId: caseId,
            // Only set changedById when the actor is a Staff (the relation points to Staff). If actor is a customer, leave null.
            changedById: actor?.isCustomer ? null : actorId,
            actorType: actor?.isCustomer ? "CUSTOMER" : "STAFF",
            actorId: actorId || null,
            fromStatus: targetCase.status,
            toStatus: newStatus,
            reason: opts?.reason || null,
            note: opts?.note || null,
            oldPriority: targetCase.priority,
            newPriority: targetCase.priority,
            oldAgentId: targetCase.assignedSupportId,
            newAgentId: targetCase.assignedSupportId,
        });
        return updatedCase;
    });
    // Emit events for key transitions
    if (newStatus === client_1.CaseStatus.RESOLVED) {
        case_event_1.CaseEventBroker.emit(case_event_1.CASE_EVENTS.RESOLVED, {
            caseId: updated.id,
            caseNumber: updated.caseNumber,
            subject: updated.subject,
            currentStatus: updated.status,
            priority: updated.priority,
            actorName: updated.updatedBy ? `${updated.updatedBy.firstName} ${updated.updatedBy.lastName}` : "Agent",
            assignedAgentId: updated.assignedSupportId,
            sectionId: updated.sectionId,
        });
        try {
            await (0, email_1.triggerResolutionEmail)(updated);
        }
        catch (e) {
            console.error("Resolution email error:", e);
        }
    }
    if (newStatus === client_1.CaseStatus.CLOSED) {
        case_event_1.CaseEventBroker.emit(case_event_1.CASE_EVENTS.CLOSED, {
            caseId: updated.id,
            caseNumber: updated.caseNumber,
            subject: updated.subject,
            currentStatus: updated.status,
            priority: updated.priority,
            actorName: updated.updatedBy ? `${updated.updatedBy.firstName} ${updated.updatedBy.lastName}` : "Operator",
            assignedAgentId: updated.assignedSupportId,
            sectionId: updated.sectionId,
        });
        // notify customer of closure
        try {
            if (updated.customer?.email) {
                await (0, email_1.sendStatusUpdateEmail)({
                    customerEmail: updated.customer.email,
                    customerName: `${updated.customer.firstName} ${updated.customer.lastName || ''}`.trim(),
                    caseNumber: updated.caseNumber,
                    caseId: updated.id,
                    subjectLine: updated.subject,
                    newStatus: newStatus,
                });
            }
        }
        catch (e) {
            console.error("Status email error:", e);
        }
    }
    // Send general status update emails for notable status changes
    try {
        if (updated.customer?.email && [client_1.CaseStatus.ASSIGNED, client_1.CaseStatus.IN_PROGRESS, client_1.CaseStatus.PENDING, client_1.CaseStatus.ESCALATED, client_1.CaseStatus.RESOLVED, client_1.CaseStatus.CLOSED, client_1.CaseStatus.CANCELLED].some(s => s === newStatus)) {
            await (0, email_1.sendStatusUpdateEmail)({
                customerEmail: updated.customer.email,
                customerName: `${updated.customer.firstName} ${updated.customer.lastName || ''}`.trim(),
                caseNumber: updated.caseNumber,
                caseId: updated.id,
                subjectLine: updated.subject,
                newStatus: newStatus,
            });
        }
    }
    catch (e) {
        console.error("Status notification error:", e);
    }
    // Send staff email notifications for case updates
    try {
        const staffRecipients = await getCaseUpdateStaffRecipients(caseId, actorId || undefined);
        const actorName = updated.updatedBy
            ? `${updated.updatedBy.firstName} ${updated.updatedBy.lastName}`
            : actor.isCustomer
                ? (targetCase.customer ? `${targetCase.customer.firstName} ${targetCase.customer.lastName || ""}`.trim() : "Customer")
                : "Staff";
        const caseUrl = `${env_1.ENV.FRONTEND_URL || "http://localhost:3000"}/cases/${caseId}`;
        let updateType = "status_change";
        if (newStatus === client_1.CaseStatus.RESOLVED)
            updateType = "resolution";
        else if (newStatus === client_1.CaseStatus.CLOSED)
            updateType = "closure";
        else if (newStatus === client_1.CaseStatus.ESCALATED)
            updateType = "escalation";
        const updateDetails = opts?.reason || opts?.note || opts?.resolutionSummary || undefined;
        for (const staff of staffRecipients) {
            await (0, email_1.sendStaffCaseUpdateEmail)({
                staffEmail: staff.email,
                staffName: `${staff.firstName} ${staff.lastName || ""}`.trim(),
                caseNumber: updated.caseNumber,
                caseId: updated.id,
                subjectLine: updated.subject,
                updateType,
                newStatus,
                previousStatus: targetCase.status,
                updatedBy: actorName,
                updateDetails,
                caseUrl,
            });
        }
    }
    catch (staffEmailError) {
        console.error("[Status Update] Staff email notification error:", staffEmailError);
    }
    return updated;
}
exports.default = { updateStatus };
