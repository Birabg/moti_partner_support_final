import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Axios from "../../api/axios";
import { assignCase } from "../../api/caseApi";
import Button from "../../components/ui/Button";

export default function AssignStaffModal({ caseData, close, refresh }) {
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingStaff, setLoadingStaff] = useState(true);

    const loadSupportStaff = async () => {
        try {
            setLoadingStaff(true);
            const response = await Axios.get("/staff/support");
            setStaffList(response.data.data || []);
        } catch (error) {
            console.log("Failed loading support staff:", error);
        } finally {
            setLoadingStaff(false);
        }
    };

    useEffect(() => { if (caseData) loadSupportStaff(); }, [caseData]);

    const submitAssignment = async () => {
        if (!selectedStaff) { alert("Please select support staff"); return; }
        try {
            setLoading(true);
            await assignCase(caseData.id, { assignedSupportId: selectedStaff });
            await refresh();
            close();
        } catch (error) {
            console.log("Assignment failed:", error);
            alert("Failed to assign case");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1b33]/60 backdrop-blur-sm">
            <div className="w-full max-w-md transform rounded-2xl bg-white p-8 shadow-[0_20px_60px_rgba(11,27,51,0.2)]">
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-ink-900">Assign Support Staff</h2>
                    <button type="button" onClick={close} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>
                <p className="mb-6 text-sm text-slate-500">Case: <span className="font-semibold text-ink-700">{caseData.caseNumber}</span></p>
                {loadingStaff ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy-200 border-t-navy-600" />
                    </div>
                ) : (
                    <select
                        value={selectedStaff}
                        onChange={(e) => setSelectedStaff(e.target.value)}
                        className="w-full rounded-xl border border-ink-300 bg-white px-4 py-3 text-sm text-ink-900 transition hover:border-ink-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
                    >
                        <option value="">Select Support Staff</option>
                        {staffList.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                                {staff.firstName} {staff.middleName} {staff.lastName ?? ""} - {staff.email}
                            </option>
                        ))}
                    </select>
                )}
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" size="sm" onClick={close}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={submitAssignment} loading={loading}>
                        {loading ? "Assigning..." : "Assign"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
