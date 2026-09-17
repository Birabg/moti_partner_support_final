import { useState } from "react";
import { X } from "lucide-react";
import caseApi from "../../api/caseApi";
import Button from "../ui/Button";

export default function CancelCaseModal({ caseData, close, refresh }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!reason || reason.trim().length < 5) {
      setError("Please provide a cancellation reason (min 5 characters).");
      return;
    }
    setLoading(true);
    try {
      await caseApi.updateStatus(caseData.id, { status: "CANCELLED", reason: reason.trim() });
      await refresh();
      close();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e?.message || "Failed to cancel case.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1b33]/60 backdrop-blur-sm">
      <div className="w-full max-w-md transform rounded-2xl bg-white p-8 shadow-[0_20px_60px_rgba(11,27,51,0.2)]">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Cancel Case</h2>
          <button type="button" onClick={close} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <p className="mb-6 text-sm text-slate-500">Case: <span className="font-semibold text-ink-700">{caseData.caseNumber}</span></p>
        <p className="mb-4 text-sm text-slate-500">This action is restricted to System Administrators. Enter a reason for cancellation; this will be recorded in the timeline.</p>
        <textarea
          className="w-full rounded-xl border border-ink-300 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 transition hover:border-ink-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter cancellation reason..."
        />
        {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={close} disabled={loading}>Close</Button>
          <Button variant="danger" size="sm" onClick={submit} loading={loading}>Confirm Cancel</Button>
        </div>
      </div>
    </div>
  );
}

