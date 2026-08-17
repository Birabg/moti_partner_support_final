PS Support Modules

Overview
- PS Support staff access is limited to cases assigned to them. They need a simple, focused UI: assigned cases list, case detail and timeline, status updates, resolution submission, feedback viewing, and profile management.

Files added
- src/pages/support/PSSupportDashboard.jsx
  - Manager-style dashboard showing personal stats, recent assigned cases, quick actions, and charts.
  - Uses `GET /api/staff/analyze` (client: `supportApi.getDashboard()`).

- src/pages/support/AssignedCases.jsx
  - Full page to view assigned cases, change status, and resolve with summary.
  - Uses `GET /cases/assigned` and `PATCH /cases/:id/status`, `POST /cases/:id/resolve` (client: `supportApi`).

- src/pages/support/CaseDetail.jsx
  - Case detail page showing full case data and timeline; resolve case from here.
  - Uses `GET /cases/:id` and `POST /cases/:id/resolve`.

- src/pages/support/History.jsx
  - Case history listing (placeholder uses assigned cases endpoint). Can be extended to query historical cases.

- src/pages/support/FeedbackAnalytics.jsx
  - Displays aggregated feedback using charts.
  - Uses `GET /staff/feedback/analytics`.

- src/pages/support/Profile.jsx
  - Support user profile edit page.
  - Uses `PATCH /api/user/updateProfile`.

Components
- src/components/support/SupportHeader.jsx
  - Header with `NotificationButton`, profile button, and sign out using `useAuth().logout()`.

- src/components/support/AssignedCasesTable.jsx
  - Small table used on the dashboard and pages; links to `CaseDetail`.

- src/components/support/RecentFeedback.jsx
  - Sidebar list of feedback items.

- src/components/support/ResolutionModal.jsx
  - Modal UI for entering resolution summary; used by AssignedCases and CaseDetail.

- src/components/support/StatusTimeline.jsx
  - Timeline display for case events.

- src/components/support/Charts/*
  - Chart components using Chart.js (StatusPieChart, ResolutionTrendChart, FeedbackBarChart).

API client
- src/api/supportApi.js
  - Exposes: `getDashboard()`, `getAssignedCases()`, `getCase(id)`, `updateCaseStatus(id,payload)`, `resolveCase(id,payload)`, `getFeedbackAnalytics()`, `updateProfile(payload)`.
  - Intended backend endpoints:
    - GET /api/staff/analyze
    - GET /api/cases/assigned
    - GET /api/cases/:id
    - PATCH /api/cases/:id/status
    - POST /api/cases/:id/resolve
    - GET /api/staff/feedback/analytics
    - PATCH /api/user/updateProfile

Notes & Next steps
- SSE/notifications: `NotificationButton` already implemented and included in `SupportHeader`.
- Backend: confirm endpoint paths and request/response shapes (especially `/cases/assigned` and `/staff/analyze`).
- Tests: recommend adding E2E tests to cover status transitions and resolution submission.

Security
- Ensure `POST /cases/:id/resolve` validates that the logged-in user is the assigned support staff or has permission to resolve.
- Keep SSE authentication via cookies or token-in-query handling if required.
