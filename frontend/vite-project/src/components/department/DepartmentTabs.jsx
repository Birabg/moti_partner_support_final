import React from "react";

export default function DepartmentTabs({
  activeTab,
  setActiveTab,
}) {
  const tabs = [
    {
      id: "department",
      label: "Departments",
    },
    {
      id: "division",
      label: "Divisions",
    },
    {
      id: "section",
      label: "Sections",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-2 border flex gap-2 w-fit">

      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-6 py-2 rounded-lg transition font-medium

          ${
            activeTab === tab.id
              ? "bg-navy-600 text-white"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}

    </div>
  );
}