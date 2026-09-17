// src/components/customer/CustomerQuickActions.jsx

import { Link } from "react-router-dom";
import {
    FaPlusCircle,
    FaClipboardList,
    FaUserEdit,
    FaBell,
} from "react-icons/fa";

export default function CustomerQuickActions() {
    const actions = [
        {
            title: "Create Case",
            icon: <FaPlusCircle />,
            link: "/customer/create-case",
            color: "bg-navy-500",
        },
        {
            title: "My Cases",
            icon: <FaClipboardList />,
            link: "/customer/my-cases",
            color: "bg-green-500",
        },
        {
            title: "Profile",
            icon: <FaUserEdit />,
            link: "/customer/profile",
            color: "bg-purple-500",
        },
        {
            title: "Notifications",
            icon: <FaBell />,
            link: "/customer/notifications",
            color: "bg-orange-500",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {actions.map((item) => (
                <Link
                    key={item.title}
                    to={item.link}
                    className="
                        bg-white
                        rounded-lg
                        shadow-sm
                        p-6
                        hover:shadow-lg
                        duration-300
                        flex
                        flex-col
                        items-center
                        justify-center
                        gap-4
                    "
                >
                    <div
                        className={`
                            w-16
                            h-16
                            rounded-full
                            flex
                            items-center
                            justify-center
                            text-white
                            text-2xl
                            ${item.color}
                        `}
                    >
                        {item.icon}
                    </div>

                    <h3 className="font-semibold text-slate-700">
                        {item.title}
                    </h3>
                </Link>
            ))}
        </div>
    );
}
