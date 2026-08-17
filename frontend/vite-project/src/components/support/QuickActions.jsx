import { Link } from "react-router-dom";

export default function QuickActions() {
  return (
    <div className="ps-quick-actions">
      <Link to="/support/cases">View Assigned Cases</Link>
      <Link to="/support/history">View History</Link>
      <Link to="/support/profile">Profile</Link>
    </div>
  );
}
