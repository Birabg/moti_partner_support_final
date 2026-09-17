import { PageHeader } from "../ui/page-header";

export default function DirectorHeader({ eyebrow, title, subtitle }) {
  return (
    <PageHeader
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
    />
  );
}

