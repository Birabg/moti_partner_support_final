import { useEffect, useState } from "react";
import { ArrowRightLeft, ClipboardList, RefreshCw, UserPlus } from "lucide-react";
import Axios from "../../api/axios";
import { assignCase, reassignCase } from "../../api/caseApi";
import CaseDetailsDrawer from "../../components/cases/CaseDetailsDrawer";
import { useAuth } from "../../context/useAuth";
import { managerApi } from "../../api/managerApi";
import DashboardCard from "../../components/manager/DashboardCard";
import ManagerHeader from "../../components/manager/ManagerHeader";
import { Card, CardContent } from "../../components/ui/card";

export default function ManagerAssignCase() {
  const [detailCase, setDetailCase] = useState(null);
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffByCase, setSelectedStaffByCase] = useState({});
  const [loading, setLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(true);
  const [submittingCaseId, setSubmittingCaseId] = useState(null);

  async function loadOverview() {
    try {
      const response = await managerApi.getScopeOverview();
      setSnapshot(response?.data?.data || null);
    } finally {
      setLoading(false);
    }
  }

  async function loadSupportStaff() {
    try {
      setStaffLoading(true);
      const response = await Axios.get("/staff/support");
      setStaffList(response?.data?.data || []);
    } finally {
      setStaffLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    const handleCaseUpdated = () => {
      loadOverview();
      loadSupportStaff();
    };

    const handleFocus = () => {
      loadOverview();
      loadSupportStaff();
    };

    const safeLoadOverview = async () => {
      try {
        const response = await managerApi.getScopeOverview();
        if (!cancelled) {
          setSnapshot(response?.data?.data || null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const safeLoadSupportStaff = async () => {
      try {
        setStaffLoading(true);
        const response = await Axios.get("/staff/support");
        if (!cancelled) {
          setStaffList(response?.data?.data || []);
        }
      } finally {
        if (!cancelled) {
          setStaffLoading(false);
        }
      }
    };

    safeLoadOverview();
    safeLoadSupportStaff();

    window.addEventListener("cases:updated", handleCaseUpdated);
    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("cases:updated", handleCaseUpdated);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const cases = snapshot?.caseMetrics?.cases || [];
  const queue = cases
    .filter((item) => !["CLOSED", "RESOLVED", "WAITING_CUSTOMER_FEEDBACK"].includes(item.status))
    .sort((a, b) => {
      const aNeedsAssignment = !a.assignedSupportId && !a.assignedSupport?.id;
      const bNeedsAssignment = !b.assignedSupportId && !b.assignedSupport?.id;
      return Number(bNeedsAssignment) - Number(aNeedsAssignment);
    });
  const scopeName = snapshot?.department?.name || snapshot?.division?.name || snapshot?.section?.name || "Current scope";

  const handleAssignment = async (item) => {
    const currentValue = selectedStaffByCase[item.id] || item.assignedSupport?.id || item.assignedSupportId || "";

    if (!currentValue) {
      alert("Please select a support staff member before routing this case.");
      return;
    }

    setSubmittingCaseId(item.id);

    try {
      if (item.assignedSupportId || item.assignedSupport?.id) {
        await reassignCase(item.id, { assignedSupportId: currentValue });
      } else {
        await assignCase(item.id, { assignedSupportId: currentValue });
      }

      await loadOverview();
    } catch (error) {
      console.error("Manager assignment action failed:", error);
      alert("The assignment request could not be completed for this case.");
    } finally {
      setSubmittingCaseId(null);
    }
  };

  return (
    <div className="space-y-6">
      <ManagerHeader user={user} orgPath={scopeName} managerRole={user?.managerType || "Manager"} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <DashboardCard title="Assignment Queue" value={queue.length || 0} caption="Open and active cases needing action" icon={UserPlus} accent="blue" loading={loading} />
        <DashboardCard title="Visible Cases" value={snapshot?.caseMetrics?.totalAssignedCases || cases.length || 0} caption="Cases in the current manager scope" icon={ClipboardList} accent="amber" loading={loading} />
      </div>

      <Card>
        <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-600">Assignment Queue</p>
            <h2 className="text-lg font-semibold text-slate-900 mt-1">Manager assignment view</h2>
          </div>
          <ArrowRightLeft className="h-5 w-5 text-navy-500" />
        </div>

        <div className="mt-4 space-y-3">
          {queue.length === 0 ? (
            <p className="text-sm text-slate-500">No eligible assignment rows are visible in this scope right now.</p>
          ) : (
            queue.slice(0, 8).map((item) => {
              const selectedStaff = selectedStaffByCase[item.id] || item.assignedSupport?.id || item.assignedSupportId || "";
              const actionLabel = item.assignedSupportId || item.assignedSupport?.id ? "Reassign" : "Assign";
              const needsAssignment = !item.assignedSupportId && !item.assignedSupport?.id;
              const ownerName = item.assignedSupport
                ? `${item.assignedSupport.firstName || ""} ${item.assignedSupport.lastName || ""}`.trim()
                : "Unassigned";

              return (
                <article key={item.id} className="rounded-md border border-slate-200 p-4 flex flex-col gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.caseNumber || item.id}</p>
                    <p className="text-sm text-slate-500">{item.subject || "No subject available"}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Current owner: {ownerName}
                    </p>
                  </div>

                  <div className="flex flex-col items-stretch gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${needsAssignment ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {needsAssignment ? "Needs Assignment" : "Active Assignment"}
                      </span>
                      <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold text-navy-700">{item.status?.replace(/_/g, " ")}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">{item.priority || "NORMAL"}</span>
                    </div>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                      value={selectedStaff}
                      onChange={(event) => setSelectedStaffByCase((current) => ({ ...current, [item.id]: event.target.value }))}
                      disabled={staffLoading}
                    >
                      <option value="">Select support staff</option>
                      {staffList.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {`${staff.firstName || ""} ${staff.lastName || ""}`.trim() || staff.email || "Support staff"}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-xl bg-slate-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        onClick={() => setDetailCase(item)}
                      >
                        View details
                      </button>
                      <button
                        type="button"
                        className="rounded-xl bg-navy-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        onClick={() => handleAssignment(item)}
                        disabled={submittingCaseId === item.id}
                      >
                        {submittingCaseId === item.id ? <RefreshCw size={14} className="animate-spin" /> : actionLabel}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
        </CardContent>
      </Card>
      {detailCase && <CaseDetailsDrawer caseData={detailCase} close={() => setDetailCase(null)} />}
    </div>
  );
}
