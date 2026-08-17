import { Card, CardTitle, CardContent } from "../ui/card";

export default function CaseTable({ rows = [], loading }) {
  if (loading) {
    return <div className="text-sm text-slate-500">Loading cases…</div>;
  }

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No case rows were returned for this manager scope.</p>
      ) : (
        rows.slice(0, 8).map((row) => (
          <Card key={row.id} className="p-4">
            <CardTitle className="text-base">{row.caseNumber || row.id}</CardTitle>
            <CardContent>{row.subject || "No subject available"}</CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
