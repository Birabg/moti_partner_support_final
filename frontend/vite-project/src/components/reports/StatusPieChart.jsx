import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#5780be", // Open
  "#0ea5ff", // In Progress
  "#ef4444", // Escalated
  "#10b981", // Resolved
  "#a78bfa", // Awaiting Customer
  "#6b7280", // Closed
];

export default function StatusPieChart({ data = [] }) {
  const hasData = data.some((item) => Number(item.value) > 0);

  // Recharts cannot render a pie when every value is 0.
  // Use tiny placeholder values so the chart still appears.
  const chartData = hasData
    ? data
    : [
        { name: "Open", value: 1, displayValue: 0 },
        { name: "In Progress", value: 1, displayValue: 0 },
        { name: "Escalated", value: 1, displayValue: 0 },
        { name: "Resolved", value: 1, displayValue: 0 },
        { name: "Awaiting Customer", value: 1, displayValue: 0 },
        { name: "Closed", value: 1, displayValue: 0 },
      ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Case Distribution</h2>
          <p className="text-sm text-slate-500">Current case status breakdown</p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={hasData ? 1 : 0.35}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name, props) => {
                const realValue =
                  props?.payload?.displayValue ?? value;
                return [realValue, name];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {(hasData ? data : chartData).map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: COLORS[index % COLORS.length],
                opacity: hasData ? 1 : 0.5,
              }}
            />
            <span className="text-slate-600">{item.name}</span>
            <span className="ml-auto font-medium text-slate-900">
              {item.displayValue ?? item.value}
            </span>
          </div>
        ))}
      </div>

      {!hasData && (
        <p className="text-center text-xs text-slate-400 mt-3">
          No case data yet
        </p>
      )}
    </div>
  );
}