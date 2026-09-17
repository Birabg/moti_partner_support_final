import {
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function DepartmentStatistics({
  departments = [],
  divisions = [],
  sections = [],
  type = "department",
}) {
  let data = departments;

  if (type === "division") data = divisions;
  if (type === "section") data = sections;

  const total = data.length;
  const active = data.filter((item) => item.isActive).length;
  const inactive = total - active;

  const typeConfig = {
    department: {
      label: "Departments",
      icon: FaBuilding,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    division: {
      label: "Divisions",
      icon: FaBuilding,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    section: {
      label: "Sections",
      icon: FaBuilding,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  };

  const config = typeConfig[type] || typeConfig.department;

  const statistics = [
    {
      label: `Total ${config.label}`,
      value: total,
      description: `All registered ${config.label.toLowerCase()}`,
      icon: config.icon,
      iconBg: config.iconBg,
      iconColor: config.iconColor,
    },
    {
      label: "Active",
      value: active,
      description: "Currently active",
      icon: FaCheckCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Inactive",
      value: inactive,
      description: "Currently inactive",
      icon: FaTimesCircle,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

      {statistics.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-5
              py-5
              shadow-[0_1px_3px_rgba(15,23,42,0.04)]
              transition-all
              duration-200
              hover:-translate-y-[1px]
              hover:border-slate-300
              hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]
            "
          >

            {/* Top */}
            <div className="flex items-center justify-between">

              <div
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  ${stat.iconBg}
                `}
              >
                <Icon
                  className={`text-[15px] ${stat.iconColor}`}
                />
              </div>

              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-slate-300
                "
              >
                Overview
              </span>

            </div>

            {/* Main content */}
            <div className="mt-5">

              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.08em]
                  text-slate-400
                "
              >
                {stat.label}
              </p>

              <div className="mt-1.5 flex items-baseline gap-2">

                <span
                  className={`
                    text-[30px]
                    font-semibold
                    leading-none
                    tracking-tight
                    ${
                      stat.label === "Active"
                        ? "text-emerald-600"
                        : stat.label === "Inactive"
                        ? "text-rose-600"
                        : "text-slate-950"
                    }
                  `}
                >
                  {stat.value}
                </span>

              </div>

              <p
                className="
                  mt-2
                  text-[11px]
                  font-medium
                  text-slate-400
                "
              >
                {stat.description}
              </p>

            </div>

            {/* Bottom indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100">

              <div
                className={`
                  h-full
                  transition-all
                  duration-500
                  ${
                    stat.label === "Active"
                      ? "bg-emerald-500"
                      : stat.label === "Inactive"
                      ? "bg-rose-500"
                      : "bg-blue-500"
                  }
                `}
                style={{
                  width:
                    total > 0
                      ? `${Math.max(
                          (stat.value / total) * 100,
                          3
                        )}%`
                      : "3%",
                }}
              />

            </div>

          </div>
        );
      })}

    </div>
  );
}
