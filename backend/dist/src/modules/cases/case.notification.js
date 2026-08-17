"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCaseNotifications = processCaseNotifications;
const database_1 = require("../../config/database");
const client_1 = require("../../../generated/prisma/client");
const email_1 = require("../../utils/email");
const formatStaffName = (staff) => `${staff.firstName} ${staff.lastName || ""}`.trim();
async function processCaseNotifications(params) {
    const { caseId, caseNumber, customerId, assignedSupportId, previousSupportId, isReassignment, } = params;
    const [newAgent, customer, previousAgent] = await Promise.all([
        database_1.prisma.staff.findUnique({
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
        database_1.prisma.customer.findUnique({ where: { id: customerId } }),
        previousSupportId
            ? database_1.prisma.staff.findUnique({
                where: { id: previousSupportId },
                select: {
                    firstName: true,
                    lastName: true,
                },
            })
            : Promise.resolve(null),
    ]);
    if (!newAgent)
        return;
    const recipients = new Set();
    if (newAgent.section?.manager?.id)
        recipients.add(newAgent.section.manager.id);
    if (newAgent.section?.division?.manager?.id)
        recipients.add(newAgent.section.division.manager.id);
    if (newAgent.section?.division?.department?.manager?.id)
        recipients.add(newAgent.section.division.department.manager.id);
    const systemAdmins = await database_1.prisma.staff.findMany({
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
        const recipientType = isCustomer ? client_1.PartyType.CUSTOMER : client_1.PartyType.STAFF;
        let message = "";
        let type = client_1.NotificationType.CASE_ASSIGNED;
        if (!isReassignment) {
            if (recipientId === assignedSupportId) {
                message = `You have been assigned to Case #${caseNumber}.`;
            }
            else if (isCustomer) {
                message = `Your support case #${caseNumber} has been assigned to ${newAgentName}.`;
            }
            else {
                message = `Case #${caseNumber} has been assigned to ${newAgentName}.`;
            }
        }
        else {
            type = client_1.NotificationType.CASE_REASSIGNED;
            if (recipientId === assignedSupportId) {
                message = `You have been assigned to Case #${caseNumber}.`;
            }
            else if (recipientId === previousSupportId) {
                message = `Case #${caseNumber} has been removed from you and assigned to ${newAgentName}.`;
            }
            else if (isCustomer) {
                message = `Your support case #${caseNumber} has been reassigned to ${newAgentName}.`;
            }
            else {
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
        await database_1.prisma.notification.createMany({ data: notificationsData, skipDuplicates: true });
    }
    if (newAgent.email) {
        await (0, email_1.sendCaseAssignmentEmail)({
            agentEmail: newAgent.email,
            agentName: newAgentName,
            caseNumber,
        });
    }
    if (!isReassignment && customer?.email) {
        await (0, email_1.sendCustomerAssignmentEmail)({
            customerEmail: customer.email,
            customerName: `${customer.firstName} ${customer.lastName || ""}`.trim(),
            caseNumber,
        });
    }
}
