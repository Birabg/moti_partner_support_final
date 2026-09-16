import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublicCaseForConfirmation, submitFeedback } from "../../api/customerCaseApi";

export default function CaseResolutionFeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCase = async () => {
      try {
        const response = await getPublicCaseForConfirmation(id);
        const data = response?.data?.data || response?.data || response;
        setCaseData(data);
      } catch (error) {
        console.error("Failed to load case for feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCase();
    }
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await submitFeedback(id, rating, comment);
      navigate("/customer/my-cases");
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      alert(error?.response?.data?.message || "Unable to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Loading case details...</div>;
  }

  if (!caseData) {
    return <div className="p-8 text-center text-red-600">This case is not available for feedback.</div>;
  }

  const isFeedbackOpen = caseData.status === "CUSTOMER_CONFIRMATION";

  if (!isFeedbackOpen) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Customer Confirmation</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Case: {caseData.caseNumber}</h1>
          <p className="mt-3 text-slate-600">This case is not awaiting feedback. Feedback is only accepted after the reminder has been sent and the case is in customer confirmation status.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Customer Confirmation</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Case: {caseData.caseNumber}</h1>
        <p className="mt-2 text-slate-600">{caseData.subject}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">How satisfied are you?</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`h-12 w-12 rounded-full border text-lg font-bold transition ${
                    star <= rating
                      ? "border-amber-400 bg-amber-100 text-amber-600"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                  aria-label={`Rate ${star} out of 5`}
                >
                  {star}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="mb-2 block text-sm font-medium text-slate-700">
              Feedback (optional)
            </label>
            <textarea
              id="comment"
              rows={5}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500"
              placeholder="Tell us how the resolution worked for you..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/customer/my-cases")}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {submitting ? "Submitting..." : "Submit feedback & close case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
