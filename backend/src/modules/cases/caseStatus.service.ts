import { prisma } from "../../config/database";
import { CaseStatus, CasePriority } from "../../../generated/prisma/client";
import canTransition from "./caseStatus.validation";
import { CaseEventBroker, CASE_EVENTS } from "./case.event";
import { sendStatusUpdateEmail, triggerResolutionEmail, sendStaffCaseUpdateEmail } from "../../utils/email";
import { processCaseNotifications } from "./case.notification";
import { createStatusHistory } from "./statusHistory.service";
import { ENV } from "../../config/env";

type Actor = {
  id?: string;
  userId?: string;
  isSAdmin?: boolean;
  isPSsupport?: boolean;
  isManager?: boolean;
  isDirector?: boolean;
  isCustomer?: boolean;
};

const getCaseUpdateStaffRecipients = async (caseId: string, excludeStaffId?: string): Promise<Array<{id: string, email: string, firstName: string, lastName: string | null}>> => {
  const targetCase = await prisma.caseReport.findUnique({
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

  if (!targetCase) return [];

  const recipientIds = new Set<string>();

  if (targetCase.assignedSupportId && targetCase.assignedSupportId !== excludeStaffId) {
    recipientIds.add(targetCase.assignedSupportId);
  }

  if (targetCase.assignedSupport?.section) {
    const staff = targetCase.assignedSupport;
    const sectionId = staff.sectionId;
    const divisionId = staff.section?.divisionId;
    const departmentId = staff.section?.division?.departmentId;

    const getManagerOfUnit = async (
      unitType: "section" | "division" | "department",
      unitId: string | null | undefined
    ) => {
      if (!unitId) return null;
      const manager = await prisma.staff.findFirst({
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

  const systemAdmins = await prisma.staff.findMany({
    where: { isSAdmin: true },
    select: { id: true },
  });

  systemAdmins.forEach((admin) => {
    if (admin.id !== excludeStaffId) {
      recipientIds.add(admin.id);
    }
  });

  if (recipientIds.size === 0) return [];

  const staffDetails = await prisma.staff.findMany({
    where: { id: { in: Array.from(recipientIds) } },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  return staffDetails.filter(s => s.email);
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
    if (updated.customer?.email && [CaseStatus.ASSIGNED, CaseStatus.IN_PROGRESS, CaseStatus.PENDING, CaseStatus.ESCALATED, CaseStatus.RESOLVED, CaseStatus.CLOSED, CaseStatus.CANCELLED].some(s => s === newStatus)) {
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

  // Send staff email notifications for case updates
  try {
    const staffRecipients = await getCaseUpdateStaffRecipients(caseId, actorId || undefined);
    const actorName = updated.updatedBy
      ? `${updated.updatedBy.firstName} ${updated.updatedBy.lastName}`
      : actor.isCustomer
        ? (targetCase.customer ? `${targetCase.customer.firstName} ${targetCase.customer.lastName || ""}`.trim() : "Customer")
        : "Staff";
    const caseUrl = `${ENV.FRONTEND_URL || "http://localhost:3000"}/cases/${caseId}`;
    
    let updateType: "status_change" | "resolution" | "closure" | "reassignment" | "priority_change" | "escalation" | "note_added" = "status_change";
    if (newStatus === CaseStatus.RESOLVED) updateType = "resolution";
    else if (newStatus === CaseStatus.CLOSED) updateType = "closure";
    else if (newStatus === CaseStatus.ESCALATED) updateType = "escalation";
    
    const updateDetails = opts?.reason || opts?.note || opts?.resolutionSummary || undefined;

    for (const staff of staffRecipients) {
      await sendStaffCaseUpdateEmail({
        staffEmail: staff.email,
        staffName: `${staff.firstName} ${staff.lastName || ""}`.trim(),
        caseNumber: (updated as any).caseNumber,
        caseId: updated.id,
        subjectLine: (updated as any).subject,
        updateType,
        newStatus,
        previousStatus: targetCase.status,
        updatedBy: actorName,
        updateDetails,
        caseUrl,
      });
    }
  } catch (staffEmailError) {
    console.error("[Status Update] Staff email notification error:", staffEmailError);
  }

  return updated;
}

export default { updateStatus };
