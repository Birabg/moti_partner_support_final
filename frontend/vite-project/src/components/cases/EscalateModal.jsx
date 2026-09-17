import { useState } from "react";
import { X } from "lucide-react";
import caseApi from "../../api/caseApi";
import Button from "../ui/Button";

export default function EscalateModal({ caseData, close, refresh }) {
  const [reason, setReason] = useState("");
  const [escalateTo, setEscalateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!reason || reason.trim().length < 5) {
      setError("Please provide an escalation reason (min 5 characters).");
      return;
    }
    setLoading(true);
    try {
      const payload = { status: "ESCALATED", reason: reason.trim() };
      if (escalateTo && String(escalateTo).trim()) payload.note = `Escalated to: ${escalateTo.trim()}`;
      await caseApi.updateStatus(caseData.id, payload);
      await refresh();
      close();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e?.message || "Failed to escalate case.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1b33]/60 backdrop-blur-sm">
      <div className="w-full max-w-md transform rounded-2xl bg-white p-8 shadow-[0_20px_60px_rgba(11,27,51,0.2)]">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Escalate Case</h2>
          <button type="button" onClick={close} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <p className="mb-6 text-sm text-slate-500">Case: <span className="font-semibold text-ink-700">{caseData.caseNumber}</span></p>
        <p className="mb-4 text-sm text-slate-500">Provide an escalation reason and optionally specify who or which team to escalate to.</p>
        <input
          className="mb-3 w-full rounded-xl border border-ink-300 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 transition hover:border-ink-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
          placeholder="Escalate to (team or person) - optional"
          value={escalateTo}
          onChange={(e) => setEscalateTo(e.target.value)}
        />
        <textarea
          className="w-full rounded-xl border border-ink-300 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 transition hover:border-ink-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter escalation reason..."
        />
        {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={close} disabled={loading}>Cancel</Button>
          <Button variant="accent" size="sm" onClick={submit} loading={loading}>Escalate</Button>
        </div>
      </div>
    </div>
  );
}

