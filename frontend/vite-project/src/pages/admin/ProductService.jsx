import { useState } from "react";

// Product Components
import CategoryTable from "../../components/productservice/CategoryTable";
import SubcategoryTable from "../../components/productservice/SubcategoryTable";
import CustomFieldTable from "../../components/productservice/CustomFieldTable";
import ServiceTypeTable from "../../components/productservice/ServiceTypeTable";

export default function ProductService() {
  const [activeTab, setActiveTab] = useState("category");

  const tabs = [
    { id: "category", name: "Product Categories" },
    { id: "subcategory", name: "Subcategories" },
    { id: "custom", name: "Custom Fields" },
    { id: "service", name: "Service Types" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Product & Service Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage product categories, subcategories, custom fields and service types.</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 rounded-xl font-semibold ${activeTab === tab.id ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div>
        {activeTab === "category" && <CategoryTable />}
        {activeTab === "subcategory" && <SubcategoryTable />}
        {activeTab === "custom" && <CustomFieldTable />}
        {activeTab === "service" && <ServiceTypeTable />}
      </div>
    </div>
  );
}
 