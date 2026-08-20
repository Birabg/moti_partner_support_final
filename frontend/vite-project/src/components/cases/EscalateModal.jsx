import { useState } from "react";
import Button from "../ui/Button";

export default function EscalateModal({ caseId, onClose, onSuccess, api }) {
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
      await api.updateStatus(caseId, payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to escalate case.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold">Escalate case</h3>
        <p className="mb-4 text-sm text-gray-600">Provide an escalation reason and optionally specify who or which team to escalate to.</p>
        <input
          className="mb-3 w-full rounded-md border px-3 py-2"
          placeholder="Escalate to (team or person) - optional"
          value={escalateTo}
          onChange={(e) => setEscalateTo(e.target.value)}
        />
        <textarea
          className="w-full rounded-md border p-2"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="accent" onClick={submit} loading={loading}>Escalate</Button>
        </div>
      </div>
    </div>
  );
}
