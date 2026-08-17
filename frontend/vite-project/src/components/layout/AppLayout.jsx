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
        user?.isCustomer;

    return (
        <div className="min-h-screen bg-slate-50">
            {isCustomer ? (
                <CustomerSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
            ) : (
                <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
            )}

            <div className={`flex min-h-screen flex-col transition-all duration-200 ${collapsed ? "pl-16" : "pl-64"}`}>
                <Header collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

                <main className="flex-1 p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
