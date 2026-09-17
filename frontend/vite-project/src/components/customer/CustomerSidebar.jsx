import { FaHome, FaPlusCircle, FaFolderOpen, FaStar, FaUser } from "react-icons/fa";
import SidebarShell from "../layout/SidebarShell";

export default function CustomerSidebar({ collapsed, onToggle }) {
    const items = [
        { to: "/customer/dashboard", icon: FaHome, label: "Dashboard" },
        { to: "/customer/create-case", icon: FaPlusCircle, label: "New Request" },
        { to: "/customer/my-cases", icon: FaFolderOpen, label: "My Cases" },
        { to: "/customer/feedback", icon: FaStar, label: "Feedback" },
        { to: "/customer/profile", icon: FaUser, label: "Profile" },
    ];

    return <SidebarShell items={items} collapsed={collapsed} onToggle={onToggle} />;
}

