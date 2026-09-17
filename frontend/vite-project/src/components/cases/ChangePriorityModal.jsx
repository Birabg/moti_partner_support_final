import { useState } from "react";
import { X } from "lucide-react";
import { changePriority } from "../../api/caseApi";
import Button from "../../components/ui/Button";

export default function ChangePriorityModal({ caseData, close, refresh }) {
    const [priority, setPriority] = useState(caseData.priority || "LOW");
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        try {
            setLoading(true);
            await changePriority(caseData.id, { priority });
            await refresh();
            close();
        } catch (error) {
            console.log("Priority update failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1b33]/60 backdrop-blur-sm">
            <div className="w-full max-w-[400px] transform rounded-2xl bg-white p-8 shadow-[0_20px_60px_rgba(11,27,51,0.2)]">
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-ink-900">Change Priority</h2>
                    <button type="button" onClick={close} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-ink-300 bg-white px-4 py-3 text-sm text-ink-900 transition hover:border-ink-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
                >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                </select>
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" size="sm" onClick={close}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={submit} loading={loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
