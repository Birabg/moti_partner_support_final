import { useEffect, useState } from "react";
import SupportApi from "../../api/supportApi";
import FeedbackBarChart from "../../components/support/Charts/FeedbackBarChart";
import "../../styles/supportDashboard.css";

export default function FeedbackAnalytics() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Try to derive staff id from JWT in localStorage/sessionStorage so PS Support
    // explicitly requests analytics for the logged-in staff (same data path as admins).
    const getStaffIdFromToken = () => {
      try {
        const tok = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
        if (!tok) return null;
        const payload = JSON.parse(atob(tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        // common claim names used across backends: userId, id, sub
        return payload?.userId || payload?.id || payload?.sub || null;
      } catch (e) {
        console.debug('Failed to decode jwt token for staff id:', e);
        return null;
      }
    };

    const loadAnalytics = () => {
      const staffId = getStaffIdFromToken();

      console.debug('Derived staffId from token:', staffId);

      // If staffId is found, request analytics for that staff; otherwise call default endpoint.
      SupportApi.getFeedbackAnalytics(staffId)
        .then((res) => {
          console.debug('GET /staff/feedback/analytics response:', res);
          if (mounted) setAnalytics(res?.data?.data || {});
        })
        .catch((err) => {
          console.error('Failed to load staff feedback analytics:', err);
          if (mounted) setAnalytics({});
        });
    };

    loadAnalytics();

    // Listen for case updates and refresh analytics
    const handleCasesUpdated = () => {
      loadAnalytics();
    };

    window.addEventListener("cases:updated", handleCasesUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("cases:updated", handleCasesUpdated);
    };
  }, []);

  // Normalize summary fields to match admin analytics shape when possible
  const totalFeedback = analytics?.summary?.casesWithFeedbackReceived ?? analytics?.summary?.totalReviewsCount ?? 0;
  const averageRating = analytics?.summary?.averageSatisfactionScore ?? analytics?.summary?.averageRating ?? "—";
  const positiveRate = (analytics?.summary?.totalReviewsCount || analytics?.summary?.casesWithFeedbackReceived)
    ? Math.round(
        ((analytics?.ratingDistribution?.["5_star"] || 0) + (analytics?.ratingDistribution?.["4_star"] || 0)) /
          (analytics?.summary?.totalReviewsCount || analytics?.summary?.casesWithFeedbackReceived) *
          100
      )
    : null;

  const hasChartData = analytics?.ratingDistribution && Object.values(analytics.ratingDistribution).some((value) => value > 0);

  return (
    <div className="ps-support-dashboard">
      <div className="">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-600">Feedback Analytics</p>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Customer feedback overview</h1>
          <p className="text-sm text-ink-500 mt-1">Understand ratings, response trends, and customer sentiment in one view.</p>
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

          {/* Recent feedback list for PS Support: align with admin FeedbackPage shape (reviews + summary) */}
          <div style={{ marginTop: 18 }}>
            <h3 className="text-sm font-semibold">Recent feedback</h3>

            {Array.isArray(analytics?.reviews || analytics?.reviewsFeed) && (analytics.reviews || analytics.reviewsFeed).length > 0 ? (
              <div className="mt-3 space-y-3">
                {(analytics.reviews || analytics.reviewsFeed).map((item) => {
                  const agentName = item.assignedAgent || (item.assignedSupport && `${item.assignedSupport.firstName} ${item.assignedSupport.lastName}`) || item.assignedSupportName || item.customerName || 'Unknown';
                  const caseNumber = item.caseNumber || item.caseReportNumber || item.caseNumberDisplay || item.caseId || item.caseReport?.caseNumber;
                  const rating = item.rating || item.satisfactionScore || 0;
                  const comment = item.comment || item.feedbackComment || '';
                  const closedAt = item.closedAt || item.submittedAt || item.createdAt || item.submittedAt;

                  return (
                    <div key={item.id || item.feedbackId || Math.random()} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{agentName}</div>
                          <div className="text-xs text-ink-500">Case #{caseNumber}</div>
                        </div>

                        <div className="flex gap-1">
                          {Array.from({ length: Math.max(0, Math.floor(rating)) }).map((_, index) => (
                            <span key={index} className="text-amber-500">★</span>
                          ))}
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-ink-700">{comment || 'No additional comments provided.'}</p>

                      <div className="mt-2 text-xs text-ink-400">{closedAt ? new Date(closedAt).toLocaleDateString() : ''}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 text-sm text-ink-500">No recent feedback items for your assigned cases.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}









