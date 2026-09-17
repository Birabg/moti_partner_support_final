import { useState } from "react";
import { X } from "lucide-react";
import { resolveCase } from "../../api/caseApi";
import Button from "../../components/ui/Button";

export default function ResolveCaseModal({ caseData, close, refresh }) {
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (!summary.trim()) { alert("Please enter a resolution summary."); return; }
        try {
            setLoading(true);
            await resolveCase(caseData.id, { resolutionSummary: summary });
            await refresh();
            close();
        } catch (error) {
            console.log(error);
            const msg = error?.response?.data?.message || error?.message || "Failed to resolve case.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1b33]/60 backdrop-blur-sm">
            <div className="w-full max-w-xl transform rounded-2xl bg-white p-8 shadow-[0_20px_60px_rgba(11,27,51,0.2)]">
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-ink-900">Resolve Case</h2>
                    <button type="button" onClick={close} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>
                <p className="mb-6 text-sm text-slate-500">Case: <span className="font-semibold text-ink-700">{caseData.caseNumber}</span></p>
                <textarea
                    rows={7}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Write resolution summary..."
                    className="w-full rounded-xl border border-ink-300 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 transition hover:border-ink-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
                />
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" size="sm" onClick={close}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={submit} loading={loading}>
                        {loading ? "Resolving..." : "Resolve"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
