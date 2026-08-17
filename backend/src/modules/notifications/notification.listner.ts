import { CaseEventBroker, CASE_EVENTS, CaseEventPayload } from "../cases/case.event";
import { prisma } from "../../config/database";
import { PartyType, NotificationType } from "../../../generated/prisma/client";

interface ManagerNode {
  managerId: string | null;
}

interface DeepDivisionNode extends ManagerNode {
  department?: ManagerNode | null; 
}

interface FullStructuralHierarchy extends ManagerNode {
  id: string;
  division: DeepDivisionNode | null;
}

async function compileNotificationRecipients(
  payload: CaseEventPayload, 
  targetRoles: { admin: boolean; agent: boolean; managers: boolean }
) {
  const recipientIds = new Set<string>();
  if (targetRoles.admin) {
    const admins = await prisma.staff.findMany({
      where: { isSAdmin: true, status: "ACTIVE" },
      select: { id: true }
    });
    admins.forEach(admin => recipientIds.add(admin.id));
  }
  if (targetRoles.agent && payload.assignedAgentId) {
    recipientIds.add(payload.assignedAgentId);
  }
  if (targetRoles.managers && payload.sectionId) {
    const rawHierarchy = await prisma.section.findUnique({
      where: { id: payload.sectionId },
      include: {
        division: true 
      }
    });

    if (rawHierarchy) {
      const structuralHierarchy = rawHierarchy as unknown as FullStructuralHierarchy;
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

async function dispatchSystemAlert(
  payload: CaseEventPayload, 
  message: string, 
  notificationType: NotificationType, 
  targetRoles: { admin: boolean; agent: boolean; managers: boolean }
) {
  try {
    const recipients = await compileNotificationRecipients(payload, targetRoles);
    
    if (recipients.length === 0) return;
    await prisma.notification.createMany({
      data: recipients.map(userId => ({
        recipientId: userId,               
        recipientType: PartyType.STAFF,   
        type: notificationType,      
        message: message,
        caseReportId: payload.caseId
      }))
    });

  } catch (error) {
    console.error(`[NotificationListener] Failed processing alert distribution for case ${payload.caseNumber}:`, error);
  }
}

export const initializeNotificationListeners = () => {
  
  CaseEventBroker.on(CASE_EVENTS.CREATED, async (payload: CaseEventPayload) => {
    const msg = `New Case #${payload.caseNumber} created by ${payload.actorName}: "${payload.subject}"`;
    await dispatchSystemAlert(payload, msg, NotificationType.NEW_CASE_ARRIVED, { admin: true, agent: false, managers: true });
  });

  CaseEventBroker.on(CASE_EVENTS.PRIORITY_CHANGED, async (payload: CaseEventPayload) => {
    const msg = `Alert: Case #${payload.caseNumber} priority updated to [${payload.priority}] by ${payload.actorName}.`;
    await dispatchSystemAlert(payload, msg, NotificationType.CASE_ASSIGNED, { admin: true, agent: true, managers: true });
  });

  CaseEventBroker.on(CASE_EVENTS.RESOLVED, async (payload: CaseEventPayload) => {
    const msg = `Case #${payload.caseNumber} has been marked as RESOLVED by agent. Awaiting customer confirmation.`;
    await dispatchSystemAlert(payload, msg, NotificationType.CASE_ASSIGNED, { admin: true, agent: true, managers: true });
  });

  CaseEventBroker.on(CASE_EVENTS.CLOSED, async (payload: CaseEventPayload) => {
    const msg = `Archive Alert: Case #${payload.caseNumber} has been officially CLOSED. Review metrics available.`;
    await dispatchSystemAlert(payload, msg, NotificationType.CASE_ASSIGNED, { admin: true, agent: true, managers: true });
  });

  CaseEventBroker.on(CASE_EVENTS.REOPENED, async (payload: CaseEventPayload) => {
    const msg = `Attention Needed: Case #${payload.caseNumber} was REJECTED by the customer and reopened back to IN_PROGRESS.`;
    await dispatchSystemAlert(payload, msg, NotificationType.CASE_ASSIGNED, { admin: true, agent: true, managers: true });
  });
};