import { prisma } from "../../config/database";
import { BadRequestError, NotFoundError, ForbiddenError} from "../../utils/error";
import {
  CaseStatus,
  CasePriority,
  PartyType,
  NotificationType,
} from "../../../generated/prisma/client";
import { sendStatusUpdateEmail } from "../../utils/email";
import { NotificationService } from "../notifications/notification.service";
import { triggerResolutionEmail } from "../../utils/email";
import { CASE_EVENTS, CaseEventBroker } from "./case.event";
import { processCaseNotifications } from "./case.notification";
import { validateHierarchyScope } from "./validation";
import { PERMISSIONS } from "../../config/default.permission";
import { getTransporter } from "../../utils/email";
import { ENV } from "../../config/env";
import { sendCaseCreationCustomerEmail, sendSharedSupportInboxAlert } from "../../utils/email";
import { createStatusHistory } from "./statusHistory.service";
import { generateNextCaseNumber } from "../../utils/caseNumber";



type Priority = "HIGH" | "MEDIUM" | "LOW";

export const getAllCases = async (

    page: number = 1,

    limit: number = 10,

    sortBy: string = "createdAt",

    order: "asc" | "desc" = "desc"

) => {

    const skip = (page - 1) * limit;

    const orderBy: any = {};

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

        prisma.caseReport.findMany({

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

        prisma.caseReport.count()

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

export const getCase = async (id: string) => {
    try {
        return await prisma.caseReport.findUnique({
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
    } catch (err: any) {
        if (err?.code === 'P2022') {
            // fallback: return case without statusHistory to avoid crashing when DB schema is out-of-sync
            const result = await prisma.caseReport.findUnique({
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
            if (result && !(result as any).statusHistory) (result as any).statusHistory = [];
            return result;
        }
        throw err;
    }
};
export interface CreateCaseInput {
  branchName: string;
  customerId: string;
  productCategoryId: string;
  productSubcategoryId?: string;
  subject: string;
  description: string;
  serviceTypeId: string;
  creationReason?: string;
  staffActorId?: string; 
}





export function hasStructuralAuthorization(actor: any, targetCase: any): boolean {
  const staff = actor.staffProfile || actor;
  if (!staff) return false;

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



const getUpwardManagementRecipients = async (assignedStaffId: string): Promise<string[]> => {
  const recipientIds = new Set<string>();

  const staff = await prisma.staff.findUnique({
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

  if (!staff) return [];

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
  
  const systemAdmins = await prisma.staff.findMany({
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

const triggerStatusNotification = async (caseDetails: any, newStatus: string) => {
  if (!caseDetails?.customer?.email) return;
  await sendStatusUpdateEmail({
    customerEmail: caseDetails.customer.email,
    customerName: `${caseDetails.customer.firstName || ''} ${caseDetails.customer.lastName || ''}`.trim() || "Valued Customer",
    caseNumber: caseDetails.caseNumber,
    caseId: caseDetails.id,
    subjectLine: caseDetails.subject,
    newStatus: newStatus,
  });
};


export interface AttachmentInput {
  fileName: string;
  storagePath: string;
  fileSizeBytes: number | bigint;
  mimeType: string;
}


export const getPrivilegedBroadcastStaff = async () => {
  return await prisma.staff.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { isSAdmin: true },
        {
          staffPermissions: {
            some: {
              permission: {
                code: PERMISSIONS.RECEIVE_NEW_CASE,
              },
            },
          },
        },
      ],
    },
    select: { id: true, email: true },
  });
};

export const createCase = async (input: any) => {
  const { creationReason, staffActorId, attachments = [], caseNumber, ...caseData } = input;

  const isStaff = Boolean(staffActorId);
  const uploaderType = isStaff ? "STAFF" : "CUSTOMER";

  if (isStaff && !creationReason) {
    throw new Error(
      "Creation reason is required when staff creates a case on behalf of a customer."
    );
  }

  const newCase = await prisma.$transaction(async (tx) => {
    const candidateCaseNumber =
      typeof caseNumber === "string" && /^MOTI-10000-M0C\d+$/.test(caseNumber)
        ? caseNumber
        : await generateNextCaseNumber(tx);

    const createdCase = await tx.caseReport.create({
      data: {
        ...caseData,
        caseNumber: candidateCaseNumber,
        creationReason: creationReason || null,
        status: CaseStatus.OPEN,
        updatedById: staffActorId || null,
        attachments:
          attachments.length > 0
            ? {
                create: attachments.map((file: any) => ({
                  fileName: file.fileName,
                  storagePath: file.storagePath,
                  fileSizeBytes: BigInt(file.fileSizeBytes),
                  mimeType: file.mimeType,
                  uploaderType: uploaderType as any,
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

    await createStatusHistory(tx, {
      caseReportId: createdCase.id,
      changedById: staffActorId || null,
      actorType: isStaff ? "STAFF" : "CUSTOMER",
      actorId: isStaff ? staffActorId : caseData.customerId,
      fromStatus: CaseStatus.OPEN,
      toStatus: CaseStatus.OPEN,
      oldPriority: null,
      newPriority: null,
      oldAgentId: null,
      newAgentId: null,
    });

    return createdCase;
  });

  const completeCaseDetails = await prisma.caseReport.findUnique({
    where: { id: newCase.id },
    include: {
      customer: true,
      updatedBy: true,
      attachments: true,
    },
  });

  if (completeCaseDetails) {
    const customerFullName =
      `${completeCaseDetails.customer?.firstName || ""} ${
        completeCaseDetails.customer?.lastName || ""
      }`.trim() || "Customer";

    const staffFullName = completeCaseDetails.updatedBy
      ? `${completeCaseDetails.updatedBy.firstName || ""} ${
          completeCaseDetails.updatedBy.lastName || ""
        }`.trim()
      : "Staff";

    const creatorName = isStaff ? staffFullName : customerFullName;

    try {
      const broadcastStaff = await getPrivilegedBroadcastStaff();

      if (broadcastStaff.length > 0) {
        const notifMessage = isStaff
          ? `A new support case (#${completeCaseDetails.caseNumber}) was logged by ${staffFullName} on behalf of ${customerFullName}.`
          : `New case #${completeCaseDetails.caseNumber} arrived from ${customerFullName}.`;

        await prisma.notification.createMany({
          data: broadcastStaff.map((staff) => ({
            recipientId: staff.id,
            recipientType: "STAFF" as const,
            type: "NEW_CASE_ARRIVED" as const,
            caseReportId: completeCaseDetails.id,
            message: notifMessage,
          })),
        });

        const privilegedEmails = broadcastStaff
          .map((s) => s.email)
          .filter(Boolean);

        if (privilegedEmails.length > 0) {
          const transporter = getTransporter();
          await transporter.sendMail({
            from: ENV.SMTP_FROM,
            to: ENV.SHARED_SUPPORT_INBOX,
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
    } catch (notifError) {
      console.error(
        "[Case Creation] Failed to broadcast staff notifications:",
        notifError
      );
    }

    try {
      if (completeCaseDetails.customer?.email) {
        await sendCaseCreationCustomerEmail({
          customerEmail: completeCaseDetails.customer.email,
          customerName: customerFullName,
          caseNumber: completeCaseDetails.caseNumber,
          subjectLine: completeCaseDetails.subject,
          description: completeCaseDetails.description,
          isCreatedByStaff: isStaff,
          creationReason: creationReason || null,
        });
      }
    } catch (emailError) {
      console.error(
        "[Case Creation] Failed to send customer confirmation email:",
        emailError
      );
    }

    try {
      await sendSharedSupportInboxAlert({
        caseNumber: completeCaseDetails.caseNumber,
        subjectLine: completeCaseDetails.subject,
        description: completeCaseDetails.description,
        customerName: customerFullName,
        customerEmail: completeCaseDetails.customer?.email || "",
        branchName: completeCaseDetails.branchName,
        creatorName,
        creationReason: creationReason || null,
      });
    } catch (inboxError) {
      console.error(
        "[Case Creation] Failed to send shared support inbox alert:",
        inboxError
      );
    }
  }

  const actorName =
    isStaff && completeCaseDetails?.updatedBy
      ? `${completeCaseDetails.updatedBy.firstName} ${completeCaseDetails.updatedBy.lastName}`
      : completeCaseDetails?.customer
      ? `${completeCaseDetails.customer.firstName} ${completeCaseDetails.customer.lastName}`
      : "Customer";

  CaseEventBroker.emit(CASE_EVENTS.CREATED, {
    caseId: newCase.id,
    caseNumber: (newCase as any).caseNumber,
    subject: (newCase as any).subject,
    currentStatus: newCase.status,
    priority: (newCase as any).priority,
    actorName,
    assignedAgentId: (newCase as any).assignedSupportId,
    sectionId: (newCase as any).sectionId,
    attachmentCount: newCase.attachments?.length || 0,
  });

  return newCase;
};

export const assignCaseSupport = async (
  caseId: string,
  assignedSupportId: string,
  operator: {
    id: string;
    isSAdmin?: boolean;
    isManager?: boolean;
    managerType?: string;
    departmentId?: string;
    divisionId?: string;
    sectionId?: string;
  }
) => {
 const targetCase = await prisma.caseReport.findUnique({
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
  throw new NotFoundError("Case report not found.");
}

const caseScope = {
  sectionId: targetCase.assignedSupport?.sectionId ?? null,
  divisionId: targetCase.assignedSupport?.section?.divisionId ?? null,
  departmentId: targetCase.assignedSupport?.section?.division?.departmentId ?? null,
};

  await validateHierarchyScope(operator, caseScope, assignedSupportId);
  await prisma.$transaction(async (tx) => {
    await tx.caseReport.update({
      where: { id: caseId },
      data: {
        assignedSupportId,
        status: CaseStatus.IN_PROGRESS,
        updatedById: operator.id,
      },
    });

    await createStatusHistory(tx, {
      caseReportId: caseId,
      changedById: operator.id,
      actorType: "STAFF",
      actorId: operator.id,
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
      operatorId: operator.id,
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



export const closeCaseReport = async (
  caseId: string,
  resolutionSummary: string,
  operatorId: string,
) => {
  const targetCase = await prisma.caseReport.findUnique({
    where: { id: caseId },
  });
  if (!targetCase) throw new NotFoundError("Case file not found.");
  if (targetCase.status === CaseStatus.CLOSED)
    throw new BadRequestError("This case is already closed.");

  const result = await prisma.$transaction(async (tx) => {
    const updatedCase = await tx.caseReport.update({
      where: { id: caseId },
      data: {
        status: CaseStatus.CLOSED,
        resolutionSummary,
        closedById: operatorId,
        closedAt: new Date(),
        resolvedAt: new Date(),
        updatedById: operatorId,
      },
      include: { updatedBy: true, customer: true }
    });

    await createStatusHistory(tx, {
      caseReportId: caseId,
      changedById: operatorId,
      actorType: "STAFF",
      actorId: operatorId,
      fromStatus: targetCase.status as any,
      toStatus: CaseStatus.CLOSED,
      oldPriority: targetCase.priority,
      newPriority: targetCase.priority,
      oldAgentId: targetCase.assignedSupportId,
      newAgentId: targetCase.assignedSupportId,
    });
    return updatedCase;
  });

  await triggerStatusNotification(result, CaseStatus.CLOSED);

  CaseEventBroker.emit(CASE_EVENTS.CLOSED, {
    caseId: result.id,
    caseNumber: (result as any).caseNumber,
    subject: (result as any).subject,
    currentStatus: result.status,
    priority: (result as any).priority,
    actorName: result.updatedBy ? `${result.updatedBy.firstName} ${result.updatedBy.lastName}` : "System Admin",
    assignedAgentId: (result as any).assignedSupportId,
    sectionId: (result as any).sectionId,
  });

  return result;
};

export const reassignOpenCase = async (
  caseId: string,
  newSupportId: string,
  operator: {
    id: string;
    isSAdmin?: boolean;
    isManager?: boolean;
    managerType?: string;
    departmentId?: string;
    divisionId?: string;
    sectionId?: string;
  }
) => {
  const targetCase = await prisma.caseReport.findUnique({
    where: { id: caseId },
  });

  if (!targetCase) throw new NotFoundError("Case record not found.");

  if (
    targetCase.status === CaseStatus.CLOSED ||
    targetCase.status === CaseStatus.CUSTOMER_CONFIRMATION
  ) {
    throw new BadRequestError(
      `Cannot reassign this case. It is already marked as ${targetCase.status}.`
    );
  }

  await validateHierarchyScope(
    operator,
    targetCase as unknown as {
      departmentId?: string | null;
      divisionId?: string | null;
      sectionId?: string | null;
    },
    newSupportId
  );

  const result = await prisma.$transaction(async (tx) => {
    const updatedCase = await tx.caseReport.update({
      where: { id: caseId },
      data: {
        assignedSupportId: newSupportId,
        status: CaseStatus.IN_PROGRESS,
        updatedById: operator.id,
      },
      include: { updatedBy: true },
    });

    await createStatusHistory(tx, {
      caseReportId: caseId,
      changedById: operator.id,
      actorType: "STAFF",
      actorId: operator.id,
      fromStatus: targetCase.status as any,
      toStatus: CaseStatus.IN_PROGRESS,
      oldPriority: targetCase.priority,
      newPriority: targetCase.priority,
      oldAgentId: targetCase.assignedSupportId,
      newAgentId: newSupportId,
    });

    return updatedCase;
  });

  CaseEventBroker.emit(CASE_EVENTS.ASSIGNED, {
    caseId: result.id,
    caseNumber: (result as any).caseNumber,
    subject: (result as any).subject,
    currentStatus: result.status,
    priority: (result as any).priority,
    actorName: result.updatedBy
      ? `${result.updatedBy.firstName} ${result.updatedBy.lastName}`
      : "Supervisor",
    assignedAgentId: (result as any).assignedSupportId,
    sectionId: (result as any).sectionId,
  });

  try {
    await processCaseNotifications({
      caseId,
      caseNumber: (result as any).caseNumber,
      customerId: targetCase.customerId,
      assignedSupportId: newSupportId,
      previousSupportId: targetCase.assignedSupportId || null,
      operatorId: operator.id,
      isReassignment: true,
    });
  } catch (notificationError) {
    console.error("[Open Case Reassignment] Notification error:", notificationError);
  }

  return result;
};


export const getCaseBasedonPriority = async (priority: CasePriority) => {
  return await prisma.caseReport.findMany({
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

export const getCaseWithStructuralScope = async (caseId: string) => {
  return await prisma.caseReport.findUnique({
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

export const validateHierarchyScopeforpriority = async (
  operator: {
    isSAdmin?: boolean;
    isManager?: boolean;
    isSystemSupport?: boolean; // FIX: added
    managerType?: string;
    departmentId?: string;
    divisionId?: string;
    sectionId?: string;
  },
  caseReport: {
    departmentId?: string | null;
    divisionId?: string | null;
    sectionId?: string | null;
  },
  assignedSupportId?: string
) => {
  if (operator.isSAdmin || operator.managerType === "DIRECTOR") {
    return;
  }

  // FIX: System Support bypass, matching assertCanSetPriority's design —
  // unrestricted, but ONLY for cases still unassigned.
  if (operator.isSystemSupport) {
    const isUnassigned = !caseReport.sectionId && !caseReport.divisionId && !caseReport.departmentId;
    if (!isUnassigned) {
      throw new ForbiddenError("System Support can only set priority on unassigned cases.");
    }
    return;
  }

  // FIX: removed `!operator.isManager ||` — managerType being set is
  // already proof of manager status; the separate isManager boolean can
  // go stale independently of the real managedDepartment/Division/Section
  // relation, which is exactly what broke Division Manager assignment earlier.
  if (!operator.managerType) {
    throw new ForbiddenError("You do not have permission to modify this case.");
  }

  let isCaseInScope = false;

  if (operator.managerType === "DEPARTMENT") {
    isCaseInScope = Boolean(operator.departmentId && caseReport.departmentId === operator.departmentId);
  } else if (operator.managerType === "DIVISION") {
    isCaseInScope = Boolean(operator.divisionId && caseReport.divisionId === operator.divisionId);
  } else if (operator.managerType === "SECTION") {
    isCaseInScope = Boolean(operator.sectionId && caseReport.sectionId === operator.sectionId);
  }

  if (!isCaseInScope) {
    throw new ForbiddenError(
      `Access Denied: This case belongs outside your ${operator.managerType.toLowerCase()} hierarchy.`
    );
  }

  if (assignedSupportId) {

    const targetStaff = await prisma.staff.findUnique({
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
      throw new NotFoundError("Target support agent not found.");
    }

    const staffDepartmentId = targetStaff.section?.division?.departmentId ?? null;
    const staffDivisionId = targetStaff.section?.divisionId ?? null;
    const staffSectionId = targetStaff.sectionId ?? null;

    let isStaffInScope = false;

    if (operator.managerType === "DEPARTMENT") {
      isStaffInScope = staffDepartmentId === operator.departmentId;
    } else if (operator.managerType === "DIVISION") {
      isStaffInScope = staffDivisionId === operator.divisionId;
    } else if (operator.managerType === "SECTION") {
      isStaffInScope = staffSectionId === operator.sectionId;
    }

    if (!isStaffInScope) {
      throw new ForbiddenError(
        `Access Denied: The assigned agent belongs outside your ${operator.managerType.toLowerCase()}.`
      );
    }
  }
};

export async function processPriorityChangeNotifications(params: {
  caseId: string;
  caseNumber: string;
  oldPriority: string;
  newPriority: string;
  assignedAgentId?: string | null;
  operatorId: string;
}) {
  const { caseId, caseNumber, oldPriority, newPriority, assignedAgentId, operatorId } = params;

  const targetUserIds = new Set<string>();

  const systemAdmins = await prisma.staff.findMany({
    where: { isSAdmin: true },
    select: { id: true },
  });
  systemAdmins.forEach((admin) => targetUserIds.add(admin.id));

  if (assignedAgentId) {
    targetUserIds.add(assignedAgentId);
  }

  const caseData = await prisma.caseReport.findUnique({
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

  if (secMgr) targetUserIds.add(secMgr);
  if (divMgr) targetUserIds.add(divMgr);
  if (deptMgr) targetUserIds.add(deptMgr);

  targetUserIds.delete(operatorId);

  if (targetUserIds.size === 0) return;

  const notificationsData = Array.from(targetUserIds).map((recipientId) => ({
    recipientId,
    recipientType: PartyType.STAFF,
    message: `Priority for Case #${caseNumber} was changed from ${oldPriority || "UNASSIGNED"} to ${newPriority}.`,
    type: NotificationType.CASE_PRIORITY_CHANGED, 
    caseReportId: caseId,
  }));

  await prisma.notification.createMany({
    data: notificationsData,
  });
}
export const givePriority = async (
  caseId: string,
  priority: CasePriority,
  operator: {
    id: string;
    isSAdmin?: boolean;
    isManager?: boolean;
    managerType?: string;
    departmentId?: string;
    divisionId?: string;
    sectionId?: string;
  }
) => {
 const targetCase = await prisma.caseReport.findUnique({
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

  if (!targetCase) throw new NotFoundError("Case file not found.");

  if (
    targetCase.status === CaseStatus.CLOSED ||
    targetCase.status === CaseStatus.CUSTOMER_CONFIRMATION
  ) {
    throw new BadRequestError(
      "Operational Refusal: Cannot modify priority for a closed or pending-feedback case."
    );
  }

const caseScope = {
    sectionId: targetCase.assignedSupport?.sectionId ?? null,
    divisionId: targetCase.assignedSupport?.section?.divisionId ?? null,
    departmentId: targetCase.assignedSupport?.section?.division?.departmentId ?? null,
  };

  await validateHierarchyScopeforpriority(
    operator,
    caseScope,
    targetCase.assignedSupportId || undefined
  );

  const oldPriority = targetCase.priority;

  const result = await prisma.$transaction(async (tx) => {
    const updatedCase = await tx.caseReport.update({
      where: { id: caseId },
      data: {
        priority,
        updatedById: operator.id,
      },
      include: { updatedBy: true },
    });

    await createStatusHistory(tx, {
      caseReportId: caseId,
      changedById: operator.id,
      actorType: "STAFF",
      actorId: operator.id,
      fromStatus: targetCase.status as any,
      toStatus: targetCase.status as any,
      oldPriority: targetCase.priority,
      newPriority: priority,
      oldAgentId: targetCase.assignedSupportId,
      newAgentId: targetCase.assignedSupportId,
    });

    return updatedCase;
  });

  CaseEventBroker.emit(CASE_EVENTS.PRIORITY_CHANGED, {
    caseId: result.id,
    caseNumber: (result as any).caseNumber,
    subject: (result as any).subject,
    currentStatus: result.status,
    priority: result.priority,
    actorName: result.updatedBy
      ? `${result.updatedBy.firstName} ${result.updatedBy.lastName}`
      : "Staff Member",
    assignedAgentId: result.assignedSupportId,
    sectionId: (result as any).sectionId ?? null,
  });

  try {
    await processPriorityChangeNotifications({
      caseId: result.id,
      caseNumber: (result as any).caseNumber,
      oldPriority: String(oldPriority),
      newPriority: String(priority),
      assignedAgentId: result.assignedSupportId,
      operatorId: operator.id,
    });
  } catch (notificationError) {
    console.error("[Priority Update] Notification dispatch error:", notificationError);
  }

  return result;
};


export const resolveCase = async (caseId: string, resolutionSummary: string, agentId: string) => {
  if (!resolutionSummary || resolutionSummary.trim().length < 10) {
    throw new BadRequestError("Please provide a thorough resolution summary (at least 10 characters).");
  }

  const targetCase = await prisma.caseReport.findUnique({
    where: { id: caseId },
  });

  if (!targetCase) throw new NotFoundError("Case file not found.");
  if (targetCase.status === CaseStatus.CLOSED) {
    throw new BadRequestError("Cannot resolve a case that is already closed.");
  }

  const updatedCase = await prisma.$transaction(async (tx) => {
    const updated = await tx.caseReport.update({
      where: { id: caseId },
      data: {
        status: CaseStatus.RESOLVED,
        resolutionSummary: resolutionSummary.trim(),
        resolvedAt: new Date(),
        updatedById: agentId,
      },
      include: { customer: true, updatedBy: true }, 
    });

    await createStatusHistory(tx, {
      caseReportId: caseId,
      changedById: agentId,
      actorType: "STAFF",
      actorId: agentId,
      fromStatus: targetCase.status as any,
      toStatus: CaseStatus.RESOLVED,
      oldPriority: targetCase.priority,
      newPriority: targetCase.priority,
      oldAgentId: targetCase.assignedSupportId,
      newAgentId: targetCase.assignedSupportId,
      resolutionSnapshot: resolutionSummary.trim(),
    });

    return updated;
  });

  try {
    await triggerResolutionEmail(updatedCase);
  } catch (emailError) {
    console.error("De-coupled resolution email notification error: ", emailError);
  }

  CaseEventBroker.emit(CASE_EVENTS.RESOLVED, {
    caseId: updatedCase.id,
    caseNumber: updatedCase.caseNumber,
    subject: updatedCase.subject,
    currentStatus: updatedCase.status,
    priority: updatedCase.priority,
    actorName: updatedCase.updatedBy ? `${updatedCase.updatedBy.firstName} ${updatedCase.updatedBy.lastName}` : "Agent",
    assignedAgentId: updatedCase.assignedSupportId,
    sectionId:(updatedCase as any).sectionId,
  });

  return updatedCase;
};


export const closeCaseWithFeedback = async (
  caseId: string,
  rating: number,
  comment: string | undefined,
  customerId: string
) => {
  if (rating < 1 || rating > 5) {
    throw new BadRequestError("Rating scale value must range between 1 and 5 stars.");
  }

  const targetCase = await prisma.caseReport.findUnique({
    where: { id: caseId },
  });

  if (!targetCase) throw new NotFoundError("Case file not found.");
  if (targetCase.customerId !== customerId) {
    throw new BadRequestError("Unauthorized: You do not own this case file.");
  }

  if (targetCase.status !== CaseStatus.CUSTOMER_CONFIRMATION) {
    throw new BadRequestError("This case is not awaiting customer confirmation feedback.");
  }

  const closedCase = await prisma.$transaction(async (tx) => {
    await tx.feedback.create({
      data: {
        caseReportId: caseId,
        rating,
        comment: comment?.trim() || null,
      },
    });

    const updated = await tx.caseReport.update({
      where: { id: caseId },
      data: {
        status: CaseStatus.CLOSED,
        closedAt: new Date(),
        updatedById: null,
      },
    });

    await createStatusHistory(tx, {
      caseReportId: caseId,
      // When a customer submits feedback and confirms closure, there is no Staff actor to reference.
      // Leave changedById null and populate actorType/actorId to record the customer actor.
      changedById: null,
      actorType: "CUSTOMER",
      actorId: targetCase.customerId,
      fromStatus: targetCase.status as any,
      toStatus: CaseStatus.CLOSED,
      oldPriority: targetCase.priority,
      newPriority: targetCase.priority,
      oldAgentId: targetCase.assignedSupportId,
      newAgentId: targetCase.assignedSupportId,
    });

    return updated;
  });


  try {
    const internalRecipients = new Set<string>();
    
    if (targetCase.assignedSupportId) {
      internalRecipients.add(targetCase.assignedSupportId); 
      
      const managers = await getUpwardManagementRecipients(targetCase.assignedSupportId);
      managers.forEach(id => internalRecipients.add(id));
    }

    if (internalRecipients.size > 0) {
      await NotificationService.createSystemNotification({
        recipientIds: Array.from(internalRecipients),
        recipientType: PartyType.STAFF,
        type: NotificationType.CASE_CLOSED,
        message: `Case Closed: Case #${closedCase.caseNumber} has been successfully closed by the customer with a rating of ${rating}/5.`,
        caseReportId: closedCase.id,
      });
    }
  } catch (notifErr) {
    console.error("Warning: Internal closing confirmation alerts failed to post:", notifErr);
  }

  return closedCase;
};




export const reopenCase = async (caseId: string, customerId: string) => {
  const targetCase = await prisma.caseReport.findUnique({
    where: { id: caseId },
  });

  if (!targetCase) throw new NotFoundError("Case file not found.");
  
  if (targetCase.customerId !== customerId) {
    throw new BadRequestError("Unauthorized: You do not own this case file.");
  }

  if (
    targetCase.status !== CaseStatus.RESOLVED &&
    targetCase.status !== CaseStatus.CUSTOMER_CONFIRMATION
  ) {
    throw new BadRequestError("Validation Failure: Only resolved or pending-confirmation cases can be rejected and reopened.");
  }

  const reopenedCase = await prisma.$transaction(async (tx) => {
    const updated = await tx.caseReport.update({
      where: { id: caseId },
      data: {
        status: CaseStatus.IN_PROGRESS,
        resolvedAt: null,
        resolutionSummary: null,
      },
      include: { customer: true },
    });

    await createStatusHistory(tx, {
      caseReportId: caseId,
      changedById: null,
      actorType: "CUSTOMER",
      actorId: targetCase.customerId,
      fromStatus: CaseStatus.CUSTOMER_CONFIRMATION,
      toStatus: CaseStatus.IN_PROGRESS,
      oldPriority: targetCase.priority,
      newPriority: targetCase.priority,
      oldAgentId: targetCase.assignedSupportId,
      newAgentId: targetCase.assignedSupportId,
    });

    return updated;
  });

  CaseEventBroker.emit(CASE_EVENTS.REOPENED, {
    caseId: reopenedCase.id,
    caseNumber: reopenedCase.caseNumber,
    subject: reopenedCase.subject,
    currentStatus: reopenedCase.status,
    priority: reopenedCase.priority,
    actorName: reopenedCase.customer ? `${reopenedCase.customer.firstName} ${reopenedCase.customer.lastName}` : "Customer",
    assignedAgentId: reopenedCase.assignedSupportId,
    sectionId: (reopenedCase as any).sectionId,
  });

  return reopenedCase;
};