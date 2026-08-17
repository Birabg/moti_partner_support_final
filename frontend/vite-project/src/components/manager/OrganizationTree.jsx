import { Card, CardTitle, CardContent } from "../ui/card";

export default function OrganizationTree({ snapshot }) {
  const scope = snapshot?.department || snapshot?.division || snapshot?.section || {};
  const hierarchy = snapshot?.hierarchyMetrics || {};

  return (
    <Card>
      <CardTitle>Scope</CardTitle>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{scope.name || "Organization"}</div>
        <p className="mt-2 text-sm text-slate-500">Staff count: {hierarchy.totalSectionStaffCount || hierarchy.totalDivisionStaffCount || hierarchy.totalDepartmentStaffCount || 0}</p>
      </CardContent>
    </Card>
  );
}
