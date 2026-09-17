import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

import Sidebar from "./Sidebar";
import CustomerSidebar from "../customer/CustomerSidebar";
import Header from "./Header";

import "../../Dashboard.css";

export default function AppLayout() {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const isCustomer =
        user?.partyType === "CUSTOMER" ||
        user?.isCustomer ||
        user?.userType === "CUSTOMER";

    const toggleSidebar = () => {
        setCollapsed((value) => !value);
    };

    return (
        <div className="min-h-screen bg-[#f5f7fa]">
            {isCustomer ? (
                <CustomerSidebar
                    collapsed={collapsed}
                    onToggle={toggleSidebar}
                />
            ) : (
                <Sidebar
                    collapsed={collapsed}
                    onToggle={toggleSidebar}
                />
            )}

            <div
                className={`
                    flex min-h-screen flex-col
                    transition-[padding-left] duration-300 ease-out
                    ${collapsed ? "pl-16" : "pl-64"}
                `}
            >
                <Header
                    collapsed={collapsed}
                    onToggle={toggleSidebar}
                />

                <main className="min-w-0 flex-1 px-4 pb-8 pt-5 sm:px-6 lg:px-7">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
