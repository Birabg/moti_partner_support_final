import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Axios from "../../api/axios";
import { reassignCase } from "../../api/caseApi";
import Button from "../../components/ui/Button";

export default function ReassignStaffModal({ caseData, close, refresh }) {
    const [staff, setStaff] = useState([]);
    const [selected, setSelected] = useState("");
    const [loading, setLoading] = useState(false);

    const loadStaff = async () => {
        try {
            const response = await Axios.get("/staff/support");
            setStaff(response.data.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => { loadStaff(); }, []);

    const submit = async () => {
        if (!selected) { alert("Select support staff"); return; }
        try {
            setLoading(true);
            await reassignCase(caseData.id, { assignedSupportId: selected });
            await refresh();
            close();
        } catch (error) {
            console.log(error);
            alert("Reassign failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1b33]/60 backdrop-blur-sm">
            <div className="w-full max-w-md transform rounded-2xl bg-white p-8 shadow-[0_20px_60px_rgba(11,27,51,0.2)]">
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-ink-900">Reassign Case</h2>
                    <button type="button" onClick={close} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>
                <p className="mb-6 text-sm text-slate-500">Case: <span className="font-semibold text-ink-700">{caseData.caseNumber}</span></p>
                <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="w-full rounded-xl border border-ink-300 bg-white px-4 py-3 text-sm text-ink-900 transition hover:border-ink-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
                >
                    <option value="">Select Staff</option>
                    {staff.map((item) => (
                        <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>
                    ))}
                </select>
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" size="sm" onClick={close}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={submit} loading={loading}>
                        {loading ? "Saving..." : "Reassign"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
