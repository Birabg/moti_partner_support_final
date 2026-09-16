import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBuilding,
  FaUsers,
  FaClipboardList,
  FaChartBar,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/useAuth";

function getOrganisationLabel(managerType) {
  if (managerType === "DEPARTMENT") return "My Departments";
  if (managerType === "DIVISION") return "My Division";
  if (managerType === "SECTION") return "My Section";
  return "Organization";
}

export default function ManagerSidebar() {
  const { logout, user } = useAuth();
  const organisationLabel = getOrganisationLabel(user?.managerType);
  const managerItems = [
    { to: "/manager/dashboard", icon: FaHome, label: "Dashboard" },
    { to: "/manager/organization", icon: FaBuilding, label: organisationLabel },
    { to: "/manager/staff", icon: FaUsers, label: "Staff" },
    { to: "/manager/cases", icon: FaClipboardList, label: "Cases" },
    { to: "/manager/reports", icon: FaChartBar, label: "Reports" },
    { to: "/manager/profile", icon: FaUserCircle, label: "Profile" },
  ];

  return (
    <aside className="manager-sidebar">
      <div className="manager-sidebar__brand">
        <div className="manager-sidebar__brand-mark">M</div>
        <div>
          <strong>MOTI Partner</strong>
          <p>Support Center</p>
        </div>
      </div>

      <nav className="manager-sidebar__nav">
        {managerItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `manager-sidebar__item ${isActive ? "active" : ""}`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button type="button" className="manager-sidebar__logout" onClick={logout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </aside>
  );
}
