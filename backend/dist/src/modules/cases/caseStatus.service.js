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
        await tx.caseStatusHistory.create({
            data: {
                caseReportId: caseId,
                changedById: actorId,
                fromStatus: targetCase.status,
                toStatus: newStatus,
                reason: opts?.reason || null,
                note: opts?.note || null,
                oldPriority: targetCase.priority,
                newPriority: targetCase.priority,
                oldAgentId: targetCase.assignedSupportId,
                newAgentId: targetCase.assignedSupportId,
            },
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
        // send dedicated resolution email with summary
        try {
            await (0, email_1.triggerResolutionEmail)(updated);
        }
        catch (e) {
            console.error("Resolution email error:", e);
        }
        // Automatically mark case as waiting for customer confirmation
        try {
            const SYSTEM_BOT_ID = "00000000-0000-0000-0000-000000000000";
            await database_1.prisma.$transaction(async (tx) => {
                await tx.caseReport.update({ where: { id: updated.id }, data: { status: client_1.CaseStatus.CUSTOMER_CONFIRMATION, updatedById: SYSTEM_BOT_ID } });
                await tx.caseStatusHistory.create({
                    data: {
                        caseReportId: updated.id,
                        changedById: SYSTEM_BOT_ID,
                        fromStatus: client_1.CaseStatus.RESOLVED,
                        toStatus: client_1.CaseStatus.CUSTOMER_CONFIRMATION,
                        oldPriority: updated.priority,
                        newPriority: updated.priority,
                        oldAgentId: updated.assignedSupportId,
                        newAgentId: updated.assignedSupportId,
                    },
                });
            });
            // notify customer that confirmation is required
            try {
                if (updated.customer?.email) {
                    await (0, email_1.sendStatusUpdateEmail)({
                        customerEmail: updated.customer.email,
                        customerName: `${updated.customer.firstName} ${updated.customer.lastName || ''}`.trim(),
                        caseNumber: updated.caseNumber,
                        subjectLine: updated.subject,
                        newStatus: client_1.CaseStatus.CUSTOMER_CONFIRMATION,
                    });
                }
            }
            catch (notifyErr) {
                console.error('Customer confirmation notification error:', notifyErr);
            }
        }
        catch (autoErr) {
            console.error('Auto transition to CUSTOMER_CONFIRMATION failed:', autoErr);
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
        if (updated.customer?.email && [client_1.CaseStatus.ASSIGNED, client_1.CaseStatus.IN_PROGRESS, client_1.CaseStatus.PENDING, client_1.CaseStatus.ESCALATED, client_1.CaseStatus.RESOLVED, client_1.CaseStatus.CLOSED].some(s => s === newStatus)) {
            await (0, email_1.sendStatusUpdateEmail)({
                customerEmail: updated.customer.email,
                customerName: `${updated.customer.firstName} ${updated.customer.lastName || ''}`.trim(),
                caseNumber: updated.caseNumber,
                subjectLine: updated.subject,
                newStatus: newStatus,
            });
        }
    }
    catch (e) {
        console.error("Status notification error:", e);
    }
    return updated;
}
exports.default = { updateStatus };
