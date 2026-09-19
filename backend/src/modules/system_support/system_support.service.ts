import { prisma } from "../../config/database";
import { NotFoundError, BadRequestError, ForbiddenError, ConflictError} from "../../utils/error";
import { CaseStatus, CasePriority} from "../../../generated/prisma/client";
import { processCaseNotifications } from "../cases/case.notification";
import { CaseEventBroker, CASE_EVENTS } from "../cases/case.event";
import { sendStatusUpdateEmail } from "../../utils/email";
import { createStatusHistory } from "../cases/statusHistory.service";



const triggerStatusNotification = async (caseDetails: any, newStatus: string) => {
  if (!caseDetails?.customer?.email) return;
  await sendStatusUpdateEmail({
    customerEmail: caseDetails.customer.email,
    customerName: `${caseDetails.customer.firstName || ''} ${caseDetails.customer.lastName || ''}`.trim() || "Valued Customer",
    caseNumber: caseDetails.caseNumber,
    subjectLine: caseDetails.subject,
    newStatus: newStatus,
  });
};


export const assignCaseSupport = async (
  caseId: string,
  assignedSupportId: string,
  operatorId: string,
  requireCurrentlyUnassigned: boolean = false, 
) => {
  const targetCase = await prisma.caseReport.findUnique({ where: { id: caseId } });
  if (!targetCase) throw new NotFoundError("Case file not found.");

  await prisma.$transaction(async (tx) => {

    const updateResult = await tx.caseReport.updateMany({
      where: {
        id: caseId,
        ...(requireCurrentlyUnassigned ? { assignedSupportId: null } : {}),
      },
      data: {
        assignedSupportId,
        status: CaseStatus.IN_PROGRESS,
        updatedById: operatorId,
      },
    });

    if (updateResult.count === 0) {
      throw new ConflictError(
        "This case was just assigned by someone else. Please refresh your queue and pick another case."
      );
    }

    await createStatusHistory(tx, {
      caseReportId: caseId,
      changedById: operatorId,
      actorType: "STAFF",
      actorId: operatorId,
      fromStatus: targetCase.status as any,
      toStatus: CaseStatus.IN_PROGRESS,
      oldPriority: targetCase.priority,
      newPriority: targetCase.priority,
      oldAgentId: targetCase.assignedSupportId,
      newAgentId: assignedSupportId,
    });
  });



  const completeCaseDetails = await prisma.caseReport.findUnique({
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
    throw new NotFoundError("Updated case details could not be found.");
  }

  CaseEventBroker.emit(CASE_EVENTS.ASSIGNED, {
    caseId: completeCaseDetails.id,
    caseNumber: (completeCaseDetails as any).caseNumber,
    subject: (completeCaseDetails as any).subject,
    currentStatus: completeCaseDetails.status,
    priority: (completeCaseDetails as any).priority,
    actorName: completeCaseDetails.updatedBy
      ? `${completeCaseDetails.updatedBy.firstName} ${completeCaseDetails.updatedBy.lastName}`
      : "Manager",
    assignedAgentId: (completeCaseDetails as any).assignedSupportId,
    sectionId: (completeCaseDetails as any).sectionId,
  });

  try {
    await processCaseNotifications({
      caseId,
      caseNumber: (completeCaseDetails as any).caseNumber,
      customerId: targetCase.customerId,
      assignedSupportId,
      previousSupportId: targetCase.assignedSupportId || null,
      operatorId,
      isReassignment: false,
    });
  } catch (notificationError) {
    console.error("[Case Assignment] Notification error:", notificationError);
  }

  try {
    await triggerStatusNotification(completeCaseDetails, CaseStatus.IN_PROGRESS);
  } catch (emailError) {
    console.error("Asynchronous email tracking notice warning:", emailError);
  }

  return completeCaseDetails;
};


export const updateCasePriority = async (
  caseId: string,
  priority: CasePriority,
  operatorId: string,
) => {
  const targetCase = await prisma.caseReport.findUnique({
    where: { id: caseId },
  });

  if (!targetCase) throw new NotFoundError("Case file not found.");

  if (targetCase.status === CaseStatus.CLOSED || targetCase.status === CaseStatus.CUSTOMER_CONFIRMATION) {
    throw new BadRequestError(
      "Operational Refusal: Cannot modify priority for a closed or pending-feedback case.",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
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
        fromStatus: targetCase.status as any,
        toStatus: targetCase.status as any,
        oldPriority: targetCase.priority,
        newPriority: priority,
        oldAgentId: targetCase.assignedSupportId,
        newAgentId: targetCase.assignedSupportId,
      },
    });

    return updatedCase;
  });

  CaseEventBroker.emit(CASE_EVENTS.PRIORITY_CHANGED, {
    caseId: result.id,
    caseNumber: (result as any).caseNumber,
    subject: (result as any).subject,
    currentStatus: result.status,
    priority: result.priority,
    actorName: result.updatedBy ? `${result.updatedBy.firstName} ${result.updatedBy.lastName}` : "Staff Member",
    assignedAgentId: (result as any).assignedSupportId,
    sectionId: (result as any).sectionId,
  });

  return result;
};