export default function RecentFeedback({ items = [] }) {
  if (!items || items.length === 0) return <div className="ps-feedback-empty">No recent feedback.</div>;

  return (
    <div className="ps-feedback-list">
      {items.map((item) => {
        const feedback = item.feedback || item;
        const title = item.caseNumber ? `Case #${item.caseNumber}` : feedback.title || "Support feedback";
        return (
          <div key={item.id || feedback.id || title} className="ps-feedback-item">
            <div className="ps-feedback-header">
              <strong>{title}</strong>
              <span>{feedback.rating ? `${feedback.rating}★` : "—"}</span>
            </div>
            <p>{feedback.comment || item.comment || "No comment provided."}</p>
            <div className="ps-feedback-time">{item.resolvedAt ? new Date(item.resolvedAt).toLocaleString() : ""}</div>
          </div>
        );
      })}
    </div>
  );
}
