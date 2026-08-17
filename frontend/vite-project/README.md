# MOTI Partner Support Portal — Frontend

React + Vite frontend for the MOTI Partner Support Portal, built against the
proposal's four modules: Authentication & Access Control, Case Management,
Customer Feedback & Satisfaction, and Reporting & Analytics.

## Getting started

```bash
npm install
npm run dev
```

Visit http://localhost:5173. Demo accounts (mock mode):

| Role     | Email                              | Password     |
|----------|-------------------------------------|--------------|
| Customer | [email protected]  | Partner@123  |
| Agent    | [email protected]    | Agent@123    |
| Admin    | [email protected]        | Admin@123    |

## Project structure

```
src/
  components/
    layout/     Sidebar, Topbar, AppLayout, AuthLayout
    ui/         Button, Card, Badge, Field (Input/Select/Textarea), Rating, EmptyState
  context/      AuthContext (session state)
  lib/
    apiClient.js       fetch wrapper + mock/real toggle
    storage.js         localStorage-backed mock database + seed data
    services/          authService, caseService, feedbackService, reportService
  pages/
    auth/       Login, Register, Forgot password
    cases/      List, New request, Case detail
    feedback/   Submit feedback, Feedback list
    reports/    Reports & analytics dashboard (agent/admin only)
  routes/       ProtectedRoute (auth + role guard)
```

## Switching from mock data to the real backend

Every page calls a **service** (`src/lib/services/*.js`), never `localStorage`
or `fetch` directly. Each service function checks `USE_MOCK` and either reads
from the localStorage mock database or calls `request()` against
`VITE_API_BASE_URL`.

1. Copy `.env.example` to `.env` and set `VITE_USE_MOCK=false`.
2. Point `VITE_API_BASE_URL` at the running Express backend.
3. Implement the corresponding routes on the backend (see the `request()`
   calls inside each service file for the expected path/method/payload shape).

No page or component needs to change — only the service files.

## Roles

- **customer**: submit requests, track their own cases, leave feedback.
- **agent**: view all cases, update status, see feedback list.
- **admin**: same as agent, plus full reports/analytics access.

Role-gated routes: `/cases/new` (customer only), `/reports` (agent/admin only).
