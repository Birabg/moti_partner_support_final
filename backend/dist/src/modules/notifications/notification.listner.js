"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeNotificationListeners = void 0;
const case_event_1 = require("../cases/case.event");
const database_1 = require("../../config/database");
const client_1 = require("../../../generated/prisma/client");
async function compileNotificationRecipients(payload, targetRoles) {
    const recipientIds = new Set();
    if (targetRoles.admin) {
        const admins = await database_1.prisma.staff.findMany({
            where: { isSAdmin: true, status: "ACTIVE" },
            select: { id: true }
        });
        admins.forEach(admin => recipientIds.add(admin.id));
    }
    if (targetRoles.agent && payload.assignedAgentId) {
        recipientIds.add(payload.assignedAgentId);
    }
    if (targetRoles.managers && payload.sectionId) {
        const rawHierarchy = await database_1.prisma.section.findUnique({
            where: { id: payload.sectionId },
            include: {
                division: true
            }
        });
        if (rawHierarchy) {
            const structuralHierarchy = rawHierarchy;
            if (structuralHierarchy.managerId) {
                recipientIds.add(structuralHierarchy.managerId);
            }
            if (structuralHierarchy.division?.managerId) {
                recipientIds.add(structuralHierarchy.division.managerId);
            }
            if (structuralHierarchy.division?.department?.managerId) {
                recipientIds.add(structuralHierarchy.division.department.managerId);
            }
        }
    }
    return Array.from(recipientIds);
}
async function dispatchSystemAlert(payload, message, notificationType, targetRoles) {
    try {
        const recipients = await compileNotificationRecipients(payload, targetRoles);
        if (recipients.length === 0)
            return;
        await database_1.prisma.notification.createMany({
            data: recipients.map(userId => ({
                recipientId: userId,
                recipientType: client_1.PartyType.STAFF,
                type: notificationType,
                message: message,
                caseReportId: payload.caseId
            }))
        });
    }
    catch (error) {
        console.error(`[NotificationListener] Failed processing alert distribution for case ${payload.caseNumber}:`, error);
    }
}
const initializeNotificationListeners = () => {
    case_event_1.CaseEventBroker.on(case_event_1.CASE_EVENTS.CREATED, async (payload) => {
        const msg = `New Case #${payload.caseNumber} created by ${payload.actorName}: "${payload.subject}"`;
        await dispatchSystemAlert(payload, msg, client_1.NotificationType.NEW_CASE_ARRIVED, { admin: true, agent: false, managers: true });
    });
    case_event_1.CaseEventBroker.on(case_event_1.CASE_EVENTS.PRIORITY_CHANGED, async (payload) => {
        const msg = `Alert: Case #${payload.caseNumber} priority updated to [${payload.priority}] by ${payload.actorName}.`;
        await dispatchSystemAlert(payload, msg, client_1.NotificationType.CASE_ASSIGNED, { admin: true, agent: true, managers: true });
    });
    case_event_1.CaseEventBroker.on(case_event_1.CASE_EVENTS.RESOLVED, async (payload) => {
        const msg = `Case #${payload.caseNumber} has been marked as RESOLVED by agent. Awaiting customer confirmation.`;
        await dispatchSystemAlert(payload, msg, client_1.NotificationType.CASE_ASSIGNED, { admin: true, agent: true, managers: true });
    });
    case_event_1.CaseEventBroker.on(case_event_1.CASE_EVENTS.CLOSED, async (payload) => {
        const msg = `Archive Alert: Case #${payload.caseNumber} has been officially CLOSED. Review metrics available.`;
        await dispatchSystemAlert(payload, msg, client_1.NotificationType.CASE_ASSIGNED, { admin: true, agent: true, managers: true });
    });
    case_event_1.CaseEventBroker.on(case_event_1.CASE_EVENTS.REOPENED, async (payload) => {
        const msg = `Attention Needed: Case #${payload.caseNumber} was REJECTED by the customer and reopened back to IN_PROGRESS.`;
        await dispatchSystemAlert(payload, msg, client_1.NotificationType.CASE_ASSIGNED, { admin: true, agent: true, managers: true });
    });
};
exports.initializeNotificationListeners = initializeNotificationListeners;
