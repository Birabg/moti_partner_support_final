export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  AGENT: 'agent',
  CUSTOMER: 'customer',
}

export const STAFF_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT]

// Matches the backend's account status enum exactly (StaffStatus / the
// equivalent CustomerStatus) so the mock layer swaps to real API responses
// with no remapping.
export const ACCOUNT_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DEACTIVATED: 'DEACTIVATED',
  REJECTED: 'REJECTED',
}

export const ACCOUNT_STATUS_LABELS = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  DEACTIVATED: 'Deactivated',
  REJECTED: 'Rejected',
}

// Matches req.user.partyType from the JWT payload.
export const PARTY_TYPES = {
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
}

// Matches req.user.managerType from the JWT payload.
export const MANAGER_TYPES = {
  DIVISION: 'DIVISION',
  DEPARTMENT: 'DEPARTMENT',
  SECTION: 'SECTION',
}

export const CASE_STATUSES = ['open', 'assigned', 'in_progress', 'resolved', 'closed']

export const CASE_STATUS_LABELS = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const PRIORITIES = ['low', 'medium', 'high', 'critical']

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}