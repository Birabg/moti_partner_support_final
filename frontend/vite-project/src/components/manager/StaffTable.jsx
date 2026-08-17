import { Card, CardTitle, CardContent } from "../ui/card";

export default function StaffTable({ rows = [], loading }) {
  if (loading) {
    return <div className="text-sm text-slate-500">Loading staff…</div>;
  }

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No staff rows were returned for this manager scope.</p>
      ) : (
        rows.slice(0, 8).map((row, index) => (
          <Card key={row.id || `${row.name}-${index}`} className="p-4">
            <CardTitle className="text-base">{row.name || row.manager || row.title || "Staff Member"}</CardTitle>
            <CardContent>{row.email || row.role || "No email on file"}</CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
