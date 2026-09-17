import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublicCaseForConfirmation, reopenCase } from "../../api/customerCaseApi";

export default function CaseResolutionRejectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCase = async () => {
      try {
        const response = await getPublicCaseForConfirmation(id);
        const data = response?.data?.data || response?.data || response;
        setCaseData(data);
      } catch (error) {
        console.error("Failed to load case for rejection:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCase();
    }
  }, [id]);

  const handleReject = async () => {
    setSubmitting(true);

    try {
      await reopenCase(id);
      navigate("/customer/my-cases");
    } catch (error) {
      console.error("Failed to reject resolution:", error);
      alert(error?.response?.data?.message || "Unable to reject the resolution.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Loading case details...</div>;
  }

  if (!caseData) {
    return <div className="p-8 text-center text-red-600">Case not found.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Resolution Review</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Reject Resolution for {caseData.caseNumber}</h1>
        <p className="mt-2 text-slate-600">{caseData.subject}</p>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Rejected resolutions are returned to active case work so the support team can continue from the current state.
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/customer/my-cases")}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={submitting}
            className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {submitting ? "Processing..." : "Reject resolution"}
          </button>
        </div>
      </div>
    </div>
  );
}

