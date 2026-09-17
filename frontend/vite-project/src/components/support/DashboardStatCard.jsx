export default function DashboardStatCard({ title, value }) {
  return (
    <div className="ps-stat-card">
      <p className="ps-stat-title">{title}</p>
      <h3 className="ps-stat-value">{value}</h3>
    </div>
  );
}






