import { prisma } from "../../config/database";
import { PartyType, NotificationType } from "../../../generated/prisma/client";
import { sendCaseAssignmentEmail, sendCustomerAssignmentEmail } from "../../utils/email";

interface NotifyAssignmentInput {
  caseId: string;
  caseNumber: string;
  customerId: string;
  assignedSupportId: string;
  previousSupportId?: string | null;
  operatorId: string;
  isReassignment: boolean;
}

const formatStaffName = (staff: { firstName: string; lastName?: string | null }) =>
  `${staff.firstName} ${staff.lastName || ""}`.trim();

export async function processCaseNotifications(params: NotifyAssignmentInput) {
  const {
    caseId,
    caseNumber,
    customerId,
    assignedSupportId,
    previousSupportId,
    isReassignment,
  } = params;

  const [newAgent, customer, previousAgent] = await Promise.all([
    prisma.staff.findUnique({
      where: { id: assignedSupportId },
      include: {
        section: {
          include: {
            manager: true,
            division: {
              include: {
                manager: true,
                department: { include: { manager: true } },
              },
            },
          },
        },
      },
    }),
    prisma.customer.findUnique({ where: { id: customerId } }),
    previousSupportId
      ? prisma.staff.findUnique({
          where: { id: previousSupportId },
          select: {
            firstName: true,
            lastName: true,
          },
        })
      : Promise.resolve(null),
  ]);

  if (!newAgent) return;

  const recipients = new Set<string>();

  if (newAgent.section?.manager?.id) recipients.add(newAgent.section.manager.id);
  if (newAgent.section?.division?.manager?.id) recipients.add(newAgent.section.division.manager.id);
  if (newAgent.section?.division?.department?.manager?.id)
    recipients.add(newAgent.section.division.department.manager.id);

  const systemAdmins = await prisma.staff.findMany({
    where: { isSAdmin: true },
    select: { id: true },
  });
  systemAdmins.forEach((admin) => recipients.add(admin.id));

  recipients.add(assignedSupportId);

  if (!isReassignment) {
    recipients.add(customerId);
  }

  if (isReassignment && previousSupportId && previousSupportId !== assignedSupportId) {
    recipients.add(previousSupportId);
  }

  const newAgentName = formatStaffName(newAgent);
  const previousAgentName = previousAgent ? formatStaffName(previousAgent) : "the previous agent";

  const notificationsData = Array.from(recipients).map((recipientId) => {
    const isCustomer = recipientId === customerId;
    const recipientType = isCustomer ? PartyType.CUSTOMER : PartyType.STAFF;
    let message = "";
    let type: NotificationType = NotificationType.CASE_ASSIGNED;

    if (!isReassignment) {
      if (recipientId === assignedSupportId) {
        message = `You have been assigned to Case #${caseNumber}.`;
      } else if (isCustomer) {
        message = `Your support case #${caseNumber} has been assigned to ${newAgentName}.`;
      } else {
        message = `Case #${caseNumber} has been assigned to ${newAgentName}.`;
      }
    } else {
      type = NotificationType.CASE_REASSIGNED;
      if (recipientId === assignedSupportId) {
        message = `You have been assigned to Case #${caseNumber}.`;
      } else if (recipientId === previousSupportId) {
        message = `Case #${caseNumber} has been removed from you and assigned to ${newAgentName}.`;
      } else if (isCustomer) {
        message = `Your support case #${caseNumber} has been reassigned to ${newAgentName}.`;
      } else {
        message = `Case #${caseNumber} has been reassigned from ${previousAgentName} to ${newAgentName}.`;
      }
    }

    return {
      recipientId,
      recipientType,
      caseReportId: caseId,
      type,
      message,
    };
  });

  if (notificationsData.length > 0) {
    await prisma.notification.createMany({ data: notificationsData, skipDuplicates: true });
  }

  if (newAgent.email) {
    await sendCaseAssignmentEmail({
      agentEmail: newAgent.email,
      agentName: newAgentName,
      caseNumber,
    });
  }

  if (!isReassignment && customer?.email) {
    await sendCustomerAssignmentEmail({
      customerEmail: customer.email,
      customerName: `${customer.firstName} ${customer.lastName || ""}`.trim(),
      caseNumber,
    });
  }
}
