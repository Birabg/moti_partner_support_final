import { useAuth } from "../../context/useAuth";
import { PageHeader } from "../ui/page-header";

export default function SupportHeader({ compactTitle = "Support Dashboard" }) {
  const { user } = useAuth();

  return (
    <PageHeader
      eyebrow="PS Support"
      title={compactTitle}
      subtitle={`Assigned to ${user?.firstName || user?.email}`}
    />
  );
}
