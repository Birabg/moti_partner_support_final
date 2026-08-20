import { useState } from "react";
import Button from "../ui/Button";

export default function PutOnPendingModal({ caseId, onClose, onSuccess, api }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!reason || reason.trim().length < 5) {
      setError("Please provide a reason (min 5 characters).");
      return;
    }
    setLoading(true);
    try {
      await api.updateStatus(caseId, { status: "PENDING", reason: reason.trim() });
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to put case on pending.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold">Put case on Pending</h3>
        <p className="mb-4 text-sm text-gray-600">Provide a reason for placing this case on pending. This is recorded in the case timeline.</p>
        <textarea
          className="w-full rounded-md border p-2"
          rows={5}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="accent" onClick={submit} loading={loading}>Confirm Pending</Button>
        </div>
      </div>
    </div>
  );
}
