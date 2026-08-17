import { EventEmitter } from "events";
import { CaseStatus, CasePriority } from "../../../generated/prisma/client";

export const CaseEventBroker = new EventEmitter();

export const CASE_EVENTS = {
  CREATED: "case.created",
  ASSIGNED: "case.assigned",
  PRIORITY_CHANGED: "case.priority_changed",
  RESOLVED: "case.resolved",
  CLOSED: "case.closed",
  REOPENED: "case.reopened",
};

export interface CaseEventPayload {
  caseId: string;
  caseNumber: string;
  subject: string;
  currentStatus: CaseStatus;
  priority: CasePriority;
  actorName: string;            
  assignedAgentId?: string | null;
  sectionId?: string | null;  
  details?: string;            
}