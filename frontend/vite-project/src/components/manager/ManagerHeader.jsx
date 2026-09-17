import { PageHeader } from "../ui/page-header";

export default function ManagerHeader({ user, orgPath, managerRole }) {
  return (
    <PageHeader
      eyebrow="Manager Workspace"
      title={`${user?.firstName || "Manager"} ${user?.lastName || ""}`.trim()}
      subtitle={`${managerRole || user?.managerType || "Manager"} · ${orgPath || "Scope: your unit"}`}
    />
  );
}

