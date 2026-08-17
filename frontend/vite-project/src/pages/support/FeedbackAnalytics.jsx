import { useEffect, useState } from "react";
import SupportApi from "../../api/supportApi";
import FeedbackBarChart from "../../components/support/Charts/FeedbackBarChart";
import "../../styles/supportDashboard.css";

export default function FeedbackAnalytics() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let mounted = true;
    SupportApi.getFeedbackAnalytics()
      .then((res) => mounted && setAnalytics(res?.data?.data || {}))
      .catch(console.error);
    return () => (mounted = false);
  }, []);

  const totalFeedback = analytics?.summary?.totalReviewsCount ?? 0;
  const averageRating = analytics?.summary?.averageRating ?? "—";
  const positiveRate = analytics?.summary?.totalReviewsCount
    ? Math.round(
        ((analytics?.ratingDistribution?.["5_star"] || 0) + (analytics?.ratingDistribution?.["4_star"] || 0)) /
          analytics.summary.totalReviewsCount *
          100
      )
    : null;

  const hasChartData = analytics?.ratingDistribution && Object.values(analytics.ratingDistribution).some((value) => value > 0);

  return (
    <div className="ps-support-dashboard">
      <div className="ps-container">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-600">Feedback Analytics</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer feedback overview</h1>
          <p className="text-sm text-slate-500 mt-1">Understand ratings, response trends, and customer sentiment in one view.</p>
        </div>

        <div className="ps-stats-row">
          <div className="ps-small-card">
            <h3>{totalFeedback}</h3>
            <p>Total feedback items</p>
          </div>
          <div className="ps-small-card">
            <h3>{averageRating}</h3>
            <p>Average rating</p>
          </div>
          <div className="ps-small-card">
            <h3>{positiveRate != null ? `${positiveRate}%` : "—"}</h3>
            <p>Positive feedback</p>
          </div>
        </div>

        <div className="ps-card" style={{ marginTop: 18 }}>
          {hasChartData ? (
            <FeedbackBarChart data={{ ratingDistribution: analytics.ratingDistribution }} />
          ) : (
            <div className="ps-empty-state">
              No feedback analytics are available yet. Once customer responses arrive, this chart will update automatically.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
