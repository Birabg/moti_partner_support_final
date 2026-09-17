import OrganizationCard from "./OrganizationCard";

export default function OrganizationTable({
  organizations,
  onDeactivate,
  onReactivate,
}) {
  return (
    <div
      className="
      grid
      lg:grid-cols-2
      xl:grid-cols-3
      gap-8
      "
    >
      {organizations.map(
        (item) => (
          <OrganizationCard
            key={item.id}
            organization={
              item
            }
            onDeactivate={
              onDeactivate
            }
            onReactivate={
              onReactivate
            }
          />
        )
      )}
    </div>
  );
}
