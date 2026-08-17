import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Button from "../ui/button";

export default function OrganizationCard({
  organization,
  onDeactivate,
  onReactivate,
}) {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div>
          <div className="flex justify-between items-center">
            <CardTitle className="!text-xl">{organization.name}</CardTitle>

            <span
              className={`px-4 py-1 rounded-full text-sm font-medium ${
                organization.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {organization.isActive ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>

          <p className="mt-4">Customers: <b>{organization._count?.customers || 0}</b></p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Button as={Link} to={`/organizations/${organization.id}`} variant="outline" size="sm">
            View Details
          </Button>

          {organization.isActive ? (
            <Button onClick={() => onDeactivate(organization.id)} variant="danger" size="sm">
              Deactivate
            </Button>
          ) : (
            <Button onClick={() => onReactivate(organization.id)} variant="accent" size="sm">
              Reactivate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}