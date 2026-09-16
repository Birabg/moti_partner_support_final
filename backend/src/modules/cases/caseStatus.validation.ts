import { CaseStatus } from "../../../generated/prisma/client";

type Actor = {
  id?: string;
  userId?: string;
  isSAdmin?: boolean;
  isPSsupport?: boolean;
  isManager?: boolean;
  isDirector?: boolean;
  role?: string;
};

const ALLOWED_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  OPEN: [CaseStatus.ASSIGNED, CaseStatus.CANCELLED],
  ASSIGNED: [CaseStatus.IN_PROGRESS, CaseStatus.CANCELLED],
  IN_PROGRESS: [CaseStatus.PENDING, CaseStatus.ESCALATED, CaseStatus.RESOLVED, CaseStatus.CANCELLED],
  PENDING: [CaseStatus.IN_PROGRESS, CaseStatus.ESCALATED, CaseStatus.CANCELLED],
  ESCALATED: [CaseStatus.IN_PROGRESS, CaseStatus.RESOLVED, CaseStatus.CANCELLED],
  RESOLVED: [CaseStatus.CUSTOMER_CONFIRMATION, CaseStatus.CLOSED, CaseStatus.IN_PROGRESS],
  CUSTOMER_CONFIRMATION: [CaseStatus.CLOSED, CaseStatus.IN_PROGRESS],
  CLOSED: [],
  CANCELLED: [],
};

export function canTransition(
  current: CaseStatus,
  next: CaseStatus,
  actor: Actor | null,
): { allowed: boolean; reason?: string } {
  if (!current || !next) return { allowed: false, reason: "Invalid status values." };

  // System admins may perform any transition
  if (actor?.isSAdmin) return { allowed: true };

  // Prevent cancellation unless system admin
  if (next === CaseStatus.CANCELLED) {
    return { allowed: false, reason: 'Only System Administrators may cancel cases.' };
  }

  // If same status, allow as no-op
  if (current === next) return { allowed: true };

  const allowed = ALLOWED_TRANSITIONS[current] || [];
  if (allowed.includes(next)) return { allowed: true };

  // Allow customers to reject and reopen the case from either the initial resolved state or the reminder confirmation state.
  if (
    actor && (actor.userId || actor.id) &&
    next === CaseStatus.IN_PROGRESS &&
    (current === CaseStatus.RESOLVED || current === CaseStatus.CUSTOMER_CONFIRMATION)
  ) {
    return { allowed: true };
  }

  return { allowed: false, reason: `Transition from ${current} to ${next} is not allowed by policy.` };
}

export default canTransition;
