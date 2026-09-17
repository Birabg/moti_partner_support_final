import { useState } from "react";
import {
    SlidersHorizontal,
    Layers3,
    GitBranch,
    Wrench,
} from "lucide-react";

// Product Components
import CategoryTable from "../../components/productservice/CategoryTable";
import SubcategoryTable from "../../components/productservice/SubcategoryTable";
import CustomFieldTable from "../../components/productservice/CustomFieldTable";
import ServiceTypeTable from "../../components/productservice/ServiceTypeTable";

export default function ProductService() {
    const [activeTab, setActiveTab] = useState("category");

    const tabs = [
        {
            id: "category",
            name: "Product Categories",
            description: "Organize your products",
            icon: Layers3,
        },
        {
            id: "subcategory",
            name: "Subcategories",
            description: "Create detailed groupings",
            icon: GitBranch,
        },
        {
            id: "custom",
            name: "Custom Fields",
            description: "Define additional information",
            icon: SlidersHorizontal,
        },
        {
            id: "service",
            name: "Service Types",
            description: "Manage available services",
            icon: Wrench,
        },
    ];

    const activeTabData =
        tabs.find((tab) => tab.id === activeTab) || tabs[0];

    const ActiveIcon = activeTabData.icon;

    return (
        <div className="space-y-7">

            {/* =====================================================
                PAGE HEADER
            ===================================================== */}
            <div className="flex items-start justify-between gap-6">

                <div>
                    {/* Breadcrumb */}
                    <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                        <span className="text-slate-400">
                            Administration
                        </span>

                        <span className="text-slate-300">
                            /
                        </span>

                        <span className="text-slate-500">
                            Product & Service
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-[30px] font-semibold tracking-[-0.035em] text-slate-900">
                        Product & Service Management
                    </h1>

                    {/* Caption */}
                    <p className="mt-2 max-w-2xl text-[14px] leading-6 text-slate-500">
                        Manage product categories, subcategories,
                        custom fields, and service types from one
                        centralized workspace.
                    </p>
                </div>

                {/* Current section */}
                <div className="hidden shrink-0 sm:block">
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_4px_18px_-12px_rgba(15,23,42,0.25)]">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <ActiveIcon className="h-4 w-4" />
                        </div>

                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Current Section
                            </p>

                            <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                {activeTabData.name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                SECTION NAVIGATION
            ===================================================== */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-14px_rgba(15,23,42,0.18)]">

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">

                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`group relative flex min-h-[88px] items-center gap-3 px-5 py-4 text-left transition-all duration-200 ${
                                    isActive
                                        ? "bg-slate-50"
                                        : "bg-white hover:bg-slate-50/70"
                                }`}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900" />
                                )}

                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                                        isActive
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                                    }`}
                                >
                                    <Icon className="h-[18px] w-[18px]" />
                                </div>

                                <div className="min-w-0">
                                    <p
                                        className={`text-sm font-semibold ${
                                            isActive
                                                ? "text-slate-900"
                                                : "text-slate-700"
                                        }`}
                                    >
                                        {tab.name}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-slate-400">
                                        {tab.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* =====================================================
                CONTENT
            ===================================================== */}
            <div>
                {activeTab === "category" && (
                    <CategoryTable />
                )}

                {activeTab === "subcategory" && (
                    <SubcategoryTable />
                )}

                {activeTab === "custom" && (
                    <CustomFieldTable />
                )}

                {activeTab === "service" && (
                    <ServiceTypeTable />
                )}
            </div>
        </div>
    );
}
