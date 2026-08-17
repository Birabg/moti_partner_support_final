import { Card, CardContent } from "../ui/card";

export default function OrganizationStatistics({ organizations }) {
  const total = organizations.length;

  const active = organizations.filter((item) => item.isActive).length;

  const inactive = organizations.filter((item) => !item.isActive).length;

  const customers = organizations.reduce((total, item) => total + (item._count?.customers || 0), 0);

  return (
    <div className="grid md:grid-cols-6 gap-6">
      <Card>
        <CardContent>
          <h3>Total Organizations</h3>
          <h1 className="text-2xl font-medium mt-3">{total}</h1>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3>Active</h3>
          <h1 className="text-2xl font-medium mt-3">{active}</h1>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3>Inactive</h3>
          <h1 className="text-2xl font-medium mt-3">{inactive}</h1>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3>Total Customers</h3>
          <h1 className="text-2xl font-medium mt-3">{customers}</h1>
        </CardContent>
      </Card>
    </div>
  );
}