import { useEffect, useState } from "react";
import SupportApi from "../../api/supportApi";
import SupportHeader from "../../components/support/SupportHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

export default function History() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    SupportApi.getHistory()
      .then((res) => mounted && setItems(res?.data?.data || []))
      .catch(console.error);
    return () => (mounted = false);
  }, []);

  const total = items.length;
  const resolvedCount = items.filter((item) => item.status === "RESOLVED" || item.status === "CLOSED").length;
  const openCount = items.filter((item) => item.status === "OPEN").length;

  return (
    <div className="space-y-6">
      <SupportHeader compactTitle="Case History" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Cases in history</p>
            <div className="mt-2 text-3xl font-bold text-slate-900">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Resolved cases</p>
            <div className="mt-2 text-3xl font-bold text-slate-900">{resolvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Open cases in history</p>
            <div className="mt-2 text-3xl font-bold text-slate-900">{openCount}</div>
          </CardContent>
        </Card>
      </div>

      {!items.length ? (
        <Card>
          <CardContent>No historical support cases found yet. Your recent activity will appear here once work begins.</CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent case activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((c) => (
              <div key={c.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{c.caseNumber || c.id}</p>
                  <p className="mt-1 text-sm text-slate-600">{c.subject}</p>
                  <p className="mt-1 text-sm text-slate-500">Status: {c.status || "Unknown"}</p>
                </div>
                <div className="text-sm text-slate-500">{c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
