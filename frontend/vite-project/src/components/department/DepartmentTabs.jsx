import React from "react";
import {
  Building2,
  GitBranch,
  Layers3,
} from "lucide-react";

export default function DepartmentTabs({
  activeTab,
  setActiveTab,
}) {
  const tabs = [
    {
      id: "department",
      label: "Departments",
      icon: Building2,
    },
    {
      id: "division",
      label: "Divisions",
      icon: GitBranch,
    },
    {
      id: "section",
      label: "Sections",
      icon: Layers3,
    },
  ];

  return (
    <div className="w-full">
      <div
        className="
          flex w-full items-center
          overflow-x-auto
          rounded-2xl
          border border-slate-200
          bg-white
          p-1
          shadow-[0_1px_3px_rgba(15,23,42,0.04)]
        "
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                group relative
                flex min-w-[150px] flex-1
                items-center justify-center
                gap-2
                rounded-xl
                px-5 py-3
                text-sm
                font-medium
                transition-all duration-200
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500/30
                focus-visible:ring-offset-1

                ${
                  isActive
                    ? `
                      bg-blue-50
                      text-blue-700
                    `
                    : `
                      text-slate-500
                      hover:bg-slate-50
                      hover:text-slate-800
                    `
                }
              `}
            >
              <span
                className={`
                  flex h-7 w-7
                  items-center justify-center
                  rounded-lg
                  transition-all duration-200

                  ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "bg-transparent text-slate-400 group-hover:text-slate-600"
                  }
                `}
              >
                <Icon
                  size={16}
                  strokeWidth={isActive ? 2 : 1.8}
                />
              </span>

              <span className="whitespace-nowrap">
                {tab.label}
              </span>

              {isActive && (
                <span
                  className="
                    absolute
                    bottom-0.5
                    left-1/2
                    h-0.5
                    w-8
                    -translate-x-1/2
                    rounded-full
                    bg-blue-600
                  "
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
