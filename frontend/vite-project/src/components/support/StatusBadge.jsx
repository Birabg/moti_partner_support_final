export default function StatusBadge({ status }) {
  const cls = status === "OPEN" ? "badge-open" : status === "IN_PROGRESS" ? "badge-progress" : "badge-resolved";
  return <span className={`ps-status-badge ${cls}`}>{status?.replace(/_/g, " ")}</span>;
}






