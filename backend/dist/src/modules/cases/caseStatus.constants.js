"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESOLVED_MEANS = exports.RECOMMENDED_WORKFLOWS = exports.CASE_STATUS_DEFINITIONS = void 0;
const client_1 = require("../../../generated/prisma/client");
exports.CASE_STATUS_DEFINITIONS = {
    OPEN: {
        label: "Open",
        description: "Case has been created. Awaiting initial review and assessment.",
    },
    ASSIGNED: {
        label: "Assigned",
        description: "Case has been assigned to the responsible person/team. Initial ownership established.",
    },
    IN_PROGRESS: {
        label: "In Progress",
        description: "Case is actively being investigated; resolution activities are ongoing.",
    },
    PENDING: {
        label: "Pending",
        description: "Waiting for required information or action (customer input, logs, scheduled activity, or another party).",
    },
    ESCALATED: {
        label: "Escalated",
        description: "Escalated to a higher-level team, hardware team, or vendor for further investigation.",
    },
    RESOLVED: {
        label: "Resolved",
        description: "Issue has been technically resolved and is under verification/testing; ready for customer verification.",
    },
    CUSTOMER_CONFIRMATION: {
        label: "Customer Confirmation",
        description: "Waiting for customer to verify the resolution. Confirmation required before closure.",
    },
    CLOSED: {
        label: "Closed",
        description: "Resolution confirmed and case officially completed.",
    },
    CANCELLED: {
        label: "Cancelled",
        description: "Case was withdrawn, duplicated, created incorrectly, or cancelled due to non-response.",
    },
};
exports.RECOMMENDED_WORKFLOWS = [
    [
        client_1.CaseStatus.OPEN,
        client_1.CaseStatus.ASSIGNED,
        client_1.CaseStatus.IN_PROGRESS,
        client_1.CaseStatus.PENDING,
        client_1.CaseStatus.ESCALATED,
        client_1.CaseStatus.RESOLVED,
        client_1.CaseStatus.CUSTOMER_CONFIRMATION,
        client_1.CaseStatus.CLOSED,
    ],
    [
        client_1.CaseStatus.OPEN,
        client_1.CaseStatus.ASSIGNED,
        client_1.CaseStatus.IN_PROGRESS,
        client_1.CaseStatus.PENDING,
        client_1.CaseStatus.ESCALATED,
        client_1.CaseStatus.RESOLVED,
        client_1.CaseStatus.CUSTOMER_CONFIRMATION,
        client_1.CaseStatus.CLOSED,
    ],
];
exports.RESOLVED_MEANS = `Resolved = technical team completed corrective action and verified the solution. Closed = customer/user confirmed the resolution or closure criteria met. Pending = waiting for required info or action.`;
exports.default = exports.CASE_STATUS_DEFINITIONS;
