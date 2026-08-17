import {
  FaHome,
  FaClipboardList,
  FaComments,
  FaChartBar,
  FaUserCircle,
  FaBuilding,
  FaUsers,
  FaTicketAlt,
  FaSitemap,
  FaBoxes,
  FaPlusCircle,
  FaBell,
  FaLock
} from "react-icons/fa";


import { useAuth } from "../../context/useAuth";
import SidebarShell from "./SidebarShell";



const ADMIN_ITEMS = [

  {
    to: "/dashboard",
    icon: FaHome,
    label: "Dashboard",
  },

  {
    to: "/admin/cases",
    icon: FaTicketAlt,
    label: "Case Tracking",
  },

  {
    to: "/admin/approval",
    icon: FaUserCircle,
    label: "User Management",
  },


  {
    to:"/admin/department-management",
    icon:FaSitemap,
    label:"Department Management",
  },


  {
    to:"/admin/product-service",
    icon:FaBoxes,
    label:"Product & Service",
  },


  {
    to:"/organizations",
    icon:FaBuilding,
    label:"Organizations",
  },


  {
    to:"/feedback",
    icon:FaComments,
    label:"Feedback",
  },


  {
    to:"/reports",
    icon:FaChartBar,
    label:"Reports & Analytics",
  },


  {
    to:"/profile",
    icon:FaUserCircle,
    label:"Profile",
  }

];

function getManagerOrganizationLabel(user) {
  if (user?.managerType === "DEPARTMENT") return "My Departments";
  if (user?.managerType === "DIVISION") return "My Division";
  if (user?.managerType === "SECTION") return "My Section";
  return "Organization";
}

const MANAGER_ITEMS = (user) => [
  {
    to: "/manager/dashboard",
    icon: FaHome,
    label: "Dashboard",
  },
  {
    to: "/manager/organization",
    icon: FaBuilding,
    label: getManagerOrganizationLabel(user),
  },
  {
    to: "/manager/staff",
    icon: FaUserCircle,
    label: "Staff",
  },
  {
    to: "/manager/cases",
    icon: FaTicketAlt,
    label: "Cases",
  },
  {
    to: "/manager/assign-case",
    icon: FaPlusCircle,
    label: "Assign Case",
  },
  {
    to: "/manager/reports",
    icon: FaChartBar,
    label: "Reports",
  },
  {
    to: "/manager/profile",
    icon: FaUserCircle,
    label: "Profile",
  },
];

const DIRECTOR_ITEMS = [
  {
    to: "/director/dashboard",
    icon: FaHome,
    label: "Dashboard",
  },
  {
    to: "/director/users",
    icon: FaUsers,
    label: "Users",
  },
  {
    to: "/director/department-management",
    icon: FaSitemap,
    label: "Department Management",
  },
  {
    to: "/director/case-analytics",
    icon: FaChartBar,
    label: "Case Analytics",
  },
  {
    to: "/director/organization-summary",
    icon: FaBuilding,
    label: "Organization Summary",
  },
  {
    to: "/director/profile",
    icon: FaUserCircle,
    label: "Profile",
  },
];

const PS_SUPPORT_ITEMS = [
  {
    to: "/support",
    icon: FaHome,
    label: "Dashboard",
  },
  {
    to: "/support/cases",
    icon: FaClipboardList,
    label: "My Assigned Cases",
  },
  {
    to: "/support/history",
    icon: FaTicketAlt,
    label: "Case History",
  },
  {
    to: "/support/feedback",
    icon: FaComments,
    label: "Feedback Analytics",
  },
  {
    to: "/support/profile",
    icon: FaUserCircle,
    label: "Profile",
  },
];





const CUSTOMER_ITEMS = [

  {
    to:"/dashboard",
    icon:FaHome,
    label:"Dashboard"
  },


  {
    to:"/customer/create-case",
    icon:FaPlusCircle,
    label:"New Request"
  },


  {
    to:"/customer/my-cases",
    icon:FaClipboardList,
    label:"My Cases"
  },


  {
    to:"/customer/notifications",
    icon:FaBell,
    label:"Notifications"
  },


  {
    to:"/customer/feedback",
    icon:FaComments,
    label:"Feedback"
  },


  {
    to:"/profile",
    icon:FaUserCircle,
    label:"Profile"
  },


  {
    to:"/customer/change-password",
    icon:FaLock,
    label:"Change Password"
  }

];






export default function Sidebar({ collapsed, onToggle }){


const {user}=useAuth();


// customer detection
const isCustomer =
user?.partyType === "CUSTOMER" ||
user?.userType === "CUSTOMER";



const isDirector = Boolean(user?.isDirector && !user?.isSAdmin && !user?.isPSsupport);
const isManager = Boolean(user?.isManager && !user?.isSAdmin && !user?.isPSsupport);

let items = isCustomer
  ? CUSTOMER_ITEMS
  : isDirector
  ? DIRECTOR_ITEMS
  : isManager
  ? MANAGER_ITEMS(user)
  : ADMIN_ITEMS;

if (user?.isPSsupport) {
  items = PS_SUPPORT_ITEMS;
}



return (
    <SidebarShell items={items} collapsed={collapsed} onToggle={onToggle} />
  );
}
