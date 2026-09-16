import { prisma } from "../../config/database";
import { CaseStatus, CasePriority } from "../../../generated/prisma/client";
import canTransition from "./caseStatus.validation";
import { CaseEventBroker, CASE_EVENTS } from "./case.event";
import { sendStatusUpdateEmail, triggerResolutionEmail } from "../../utils/email";
import { processCaseNotifications } from "./case.notification";
import { createStatusHistory } from "./statusHistory.service";

type Actor = {
  id?: string;
  userId?: string;
  isSAdmin?: boolean;
  isPSsupport?: boolean;
  isManager?: boolean;
  isDirector?: boolean;
  isCustomer?: boolean;
};

export async function updateStatus(
  caseId: string,
  newStatus: CaseStatus,
  actor: Actor,
  opts?: { reason?: string; note?: string; resolutionSummary?: string }
) {
  const targetCase = await prisma.caseReport.findUnique({ where: { id: caseId }, include: { customer: true, assignedSupport: true } });
  if (!targetCase) throw new Error("Case not found.");

  const actorId = actor?.id || actor?.userId || null;

  // Enrich actor flags from DB when possible
  if (actorId) {
    const staff = await prisma.staff.findUnique({ where: { id: actorId }, select: { id: true, isSAdmin: true, isPSsupport: true, isManager: true, isDirector: true } });
    if (staff) {
      actor.isSAdmin = !!staff.isSAdmin;
      actor.isPSsupport = !!staff.isPSsupport;
      actor.isManager = !!staff.isManager;
      actor.isDirector = !!staff.isDirector;
    } else {
      const cust = await prisma.customer.findUnique({ where: { id: actorId }, select: { id: true } });
      if (cust) actor.isCustomer = true;
    }
  }

  const validation = canTransition(targetCase.status as CaseStatus, newStatus, actor);
  if (!validation.allowed) {
    throw new Error(validation.reason || "Transition not allowed.");
  }

  // Enforce Cancelled only by system admin (double-check at service layer)
  if (newStatus === CaseStatus.CANCELLED && !actor.isSAdmin) {
    throw new Error("Only System Administrators may cancel cases.");
  }

  // PENDING: require reason and restrict actors to customer (case owner), assigned agent, manager/director, or system admin
  if (newStatus === CaseStatus.PENDING) {
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
  if (newStatus === CaseStatus.ESCALATED) {
    if (!opts?.reason || typeof opts.reason !== 'string' || opts.reason.trim().length < 5) {
      throw new Error("Escalation reason is required (min 5 chars).");
    }
  }

  // Enforce resolutionSummary when marking RESOLVED
  if (newStatus === CaseStatus.RESOLVED && (!opts?.resolutionSummary || opts.resolutionSummary.trim().length < 10)) {
    throw new Error("A detailed resolutionSummary (min 10 chars) is required when resolving a case.");
  }

  const updateData: any = { status: newStatus, updatedById: actorId };
  if (newStatus === CaseStatus.RESOLVED) {
    updateData.resolutionSummary = opts?.resolutionSummary?.trim() ?? null;
    updateData.resolvedAt = new Date();
  }

  if (newStatus === CaseStatus.CLOSED) {
    updateData.closedAt = new Date();
    updateData.closedById = actorId;
  }

  // Role-based enforcement: system admins bypass, other actors restricted
  if (!actor.isSAdmin) {
    // If attempting to CLOSE from CUSTOMER_CONFIRMATION, require customer or privileged staff
    if (newStatus === CaseStatus.CLOSED && targetCase.status === CaseStatus.CUSTOMER_CONFIRMATION) {
      if (!(actor.isCustomer && actorId === targetCase.customerId) && !actor.isManager && !actor.isDirector) {
        throw new Error("Only the case owner (customer) or privileged staff can confirm closure.");
      }
    }

    // Only assigned agent or manager/director may set IN_PROGRESS, RESOLVED, or ESCALATED
    if ([CaseStatus.IN_PROGRESS, CaseStatus.RESOLVED, CaseStatus.ESCALATED].some(s => s === newStatus)) {
      const isAssignedAgent = actorId && targetCase.assignedSupportId && actorId === targetCase.assignedSupportId;
      if (!isAssignedAgent && !actor.isManager && !actor.isDirector) {
        throw new Error("Only the assigned agent or a manager/director can perform this transition.");
      }
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedCase = await tx.caseReport.update({ where: { id: caseId }, data: updateData, include: { customer: true, updatedBy: true } });

    await createStatusHistory(tx, {
      caseReportId: caseId,
      // Only set changedById when the actor is a Staff (the relation points to Staff). If actor is a customer, leave null.
      changedById: actor?.isCustomer ? null : (actorId as any),
      actorType: actor?.isCustomer ? "CUSTOMER" : "STAFF",
      actorId: actorId || null,
      fromStatus: targetCase.status as any,
      toStatus: newStatus,
      reason: opts?.reason || null,
      note: opts?.note || null,
      oldPriority: targetCase.priority as CasePriority | null,
      newPriority: targetCase.priority as CasePriority | null,
      oldAgentId: targetCase.assignedSupportId,
      newAgentId: targetCase.assignedSupportId,
    });

    return updatedCase;
  });

  // Emit events for key transitions
  if (newStatus === CaseStatus.RESOLVED) {
    CaseEventBroker.emit(CASE_EVENTS.RESOLVED, {
      caseId: updated.id,
      caseNumber: (updated as any).caseNumber,
      subject: (updated as any).subject,
      currentStatus: updated.status,
      priority: (updated as any).priority,
      actorName: (updated as any).updatedBy ? `${(updated as any).updatedBy.firstName} ${(updated as any).updatedBy.lastName}` : "Agent",
      assignedAgentId: (updated as any).assignedSupportId,
      sectionId: (updated as any).sectionId,
    });

    try {
      await triggerResolutionEmail(updated);
    } catch (e) {
      console.error("Resolution email error:", e);
    }
  }

  if (newStatus === CaseStatus.CLOSED) {
    CaseEventBroker.emit(CASE_EVENTS.CLOSED, {
      caseId: updated.id,
      caseNumber: (updated as any).caseNumber,
      subject: (updated as any).subject,
      currentStatus: updated.status,
      priority: (updated as any).priority,
      actorName: (updated as any).updatedBy ? `${(updated as any).updatedBy.firstName} ${(updated as any).updatedBy.lastName}` : "Operator",
      assignedAgentId: (updated as any).assignedSupportId,
      sectionId: (updated as any).sectionId,
    });

    // notify customer of closure
    try {
      if (updated.customer?.email) {
        await sendStatusUpdateEmail({
          customerEmail: updated.customer.email,
          customerName: `${updated.customer.firstName} ${updated.customer.lastName || ''}`.trim(),
          caseNumber: (updated as any).caseNumber,
          caseId: updated.id,
          subjectLine: (updated as any).subject,
          newStatus: newStatus,
        });
      }
    } catch (e) {
      console.error("Status email error:", e);
    }
  }

  // Send general status update emails for notable status changes
  try {
    if (updated.customer?.email && [CaseStatus.ASSIGNED, CaseStatus.IN_PROGRESS, CaseStatus.PENDING, CaseStatus.ESCALATED, CaseStatus.RESOLVED, CaseStatus.CLOSED].some(s => s === newStatus)) {
      await sendStatusUpdateEmail({
        customerEmail: updated.customer.email,
        customerName: `${updated.customer.firstName} ${updated.customer.lastName || ''}`.trim(),
        caseNumber: (updated as any).caseNumber,
        caseId: updated.id,
        subjectLine: (updated as any).subject,
        newStatus: newStatus,
      });
    }
  } catch (e) {
    console.error("Status notification error:", e);
  }

  return updated;
}

export default { updateStatus };
