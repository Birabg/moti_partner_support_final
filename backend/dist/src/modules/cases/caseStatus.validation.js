"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canTransition = canTransition;
const client_1 = require("../../../generated/prisma/client");
const ALLOWED_TRANSITIONS = {
    OPEN: [client_1.CaseStatus.ASSIGNED, client_1.CaseStatus.CANCELLED],
    ASSIGNED: [client_1.CaseStatus.IN_PROGRESS, client_1.CaseStatus.CANCELLED],
    IN_PROGRESS: [client_1.CaseStatus.PENDING, client_1.CaseStatus.ESCALATED, client_1.CaseStatus.RESOLVED, client_1.CaseStatus.CANCELLED],
    PENDING: [client_1.CaseStatus.IN_PROGRESS, client_1.CaseStatus.ESCALATED, client_1.CaseStatus.CANCELLED],
    ESCALATED: [client_1.CaseStatus.IN_PROGRESS, client_1.CaseStatus.RESOLVED, client_1.CaseStatus.CANCELLED],
    RESOLVED: [client_1.CaseStatus.CUSTOMER_CONFIRMATION, client_1.CaseStatus.CLOSED],
    CUSTOMER_CONFIRMATION: [client_1.CaseStatus.CLOSED, client_1.CaseStatus.IN_PROGRESS],
    CLOSED: [],
    CANCELLED: [],
};
function canTransition(current, next, actor) {
    if (!current || !next)
        return { allowed: false, reason: "Invalid status values." };
    // System admins may perform any transition
    if (actor?.isSAdmin)
        return { allowed: true };
    // Prevent cancellation unless system admin
    if (next === client_1.CaseStatus.CANCELLED) {
        return { allowed: false, reason: 'Only System Administrators may cancel cases.' };
    }
    // If same status, allow as no-op
    if (current === next)
        return { allowed: true };
    const allowed = ALLOWED_TRANSITIONS[current] || [];
    if (allowed.includes(next))
        return { allowed: true };
    // Allow customers to move from CUSTOMER_CONFIRMATION -> IN_PROGRESS (reject resolution)
    if (actor && (actor.userId || actor.id) && next === client_1.CaseStatus.IN_PROGRESS && current === client_1.CaseStatus.CUSTOMER_CONFIRMATION) {
        return { allowed: true };
    }
    return { allowed: false, reason: `Transition from ${current} to ${next} is not allowed by policy.` };
}
exports.default = canTransition;
