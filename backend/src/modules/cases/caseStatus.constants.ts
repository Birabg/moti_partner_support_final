import { CaseStatus } from "../../../generated/prisma/client";

export const CASE_STATUS_DEFINITIONS: Record<CaseStatus, {
  label: string;
  description: string;
  details?: string[];
}> = {
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

export const RECOMMENDED_WORKFLOWS: CaseStatus[][] = [
  [
    CaseStatus.OPEN,
    CaseStatus.ASSIGNED,
    CaseStatus.IN_PROGRESS,
    CaseStatus.PENDING,
    CaseStatus.ESCALATED,
    CaseStatus.RESOLVED,
    CaseStatus.CUSTOMER_CONFIRMATION,
    CaseStatus.CLOSED,
  ],
  [
    CaseStatus.OPEN,
    CaseStatus.ASSIGNED,
    CaseStatus.IN_PROGRESS,
    CaseStatus.PENDING,
    CaseStatus.ESCALATED,
    CaseStatus.RESOLVED,
    CaseStatus.CUSTOMER_CONFIRMATION,
    CaseStatus.CLOSED,
  ],
];

export const RESOLVED_MEANS = `Resolved = technical team completed corrective action and verified the solution. Closed = customer/user confirmed the resolution or closure criteria met. Pending = waiting for required info or action.`;

export default CASE_STATUS_DEFINITIONS;
