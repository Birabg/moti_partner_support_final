import { useEffect, useState } from "react";
import SupportApi from "../../api/supportApi";
import StatusBadge from "../../components/support/StatusBadge";
import ResolutionModal from "../../components/support/ResolutionModal";
import CaseDetailsDrawer from "../../components/cases/CaseDetailsDrawer";
import SupportHeader from "../../components/support/SupportHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import Button from "../../components/ui/button";

export default function AssignedCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingCase, setResolvingCase] = useState(null);
  const [detailCase, setDetailCase] = useState(null);

  useEffect(() => {
    let mounted = true;
    SupportApi.getAssignedCases()
      .then((res) => mounted && setCases(res?.data?.data || []))
      .catch(console.error)
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, []);

  const handleResolve = (c) => {
    setResolvingCase(c);
  };

  const handleViewDetails = (c) => {
    setDetailCase(c);
  };

  const submitResolution = async (text) => {
    if (!resolvingCase) return;
    try {
      await SupportApi.resolveCase(resolvingCase.id, { resolution: text });
      setCases((cur) => cur.map((x) => (x.id === resolvingCase.id ? { ...x, status: "RESOLVED" } : x)));
      setResolvingCase(null);
      window.dispatchEvent(new CustomEvent("cases:updated"));
    } catch (err) {
      console.error(err);
      alert("Failed to resolve case");
    }
  };

  const total = cases.length;
  const openCount = cases.filter((item) => item.status === "OPEN").length;
  const inProgressCount = cases.filter((item) => item.status === "IN_PROGRESS").length;
  const resolvedCount = cases.filter((item) => item.status === "RESOLVED" || item.status === "CLOSED").length;

  return (
    <div className="space-y-6">
      <SupportHeader compactTitle="Assigned Cases" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Total assigned cases</p>
            <div className="mt-2 text-3xl font-bold text-slate-900">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Open cases</p>
            <div className="mt-2 text-3xl font-bold text-slate-900">{openCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">In progress</p>
            <div className="mt-2 text-3xl font-bold text-slate-900">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Resolved cases</p>
            <div className="mt-2 text-3xl font-bold text-slate-900">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Card>
          <CardContent>Loading your assigned cases…</CardContent>
        </Card>
      ) : !cases.length ? (
        <Card>
          <CardContent>No assigned cases right now. Check back after your next ticket assignment.</CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Assigned case queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cases.map((c) => (
              <div key={c.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{c.caseNumber || c.id}</p>
                  <p className="mt-1 text-sm text-slate-600">{c.subject}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={c.status} />
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(c)}>
                    View details
                  </Button>
                  <Button variant="accent" size="sm" onClick={() => handleResolve(c)}>
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {resolvingCase && <ResolutionModal onClose={() => setResolvingCase(null)} onSubmit={submitResolution} />}
      {detailCase && <CaseDetailsDrawer caseData={detailCase} close={() => setDetailCase(null)} />}
    </div>
  );
}
