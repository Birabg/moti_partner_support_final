import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

export default function MonthlyTrendChart({
    data = [],
}) {
    const chartData =
        data.length > 0
            ? data
            : [
                  { month: "Jan", cases: 0 },
                  { month: "Feb", cases: 0 },
                  { month: "Mar", cases: 0 },
                  { month: "Apr", cases: 0 },
                  { month: "May", cases: 0 },
                  { month: "Jun", cases: 0 },
                  { month: "Jul", cases: 0 },
                  { month: "Aug", cases: 0 },
                  { month: "Sept", cases: 0 },
                  { month: "Oct", cases: 0 },
                  { month: "Nov", cases: 0 },
                  { month: "Dec", cases: 0 },
              ];

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 h-full">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Monthly Case Trend
            </h2>

            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="month" tick={{ angle: -45, textAnchor: 'end' }} height={60} />

                    <YAxis allowDecimals={false} />

                    <Tooltip formatter={(value) => [`${value} cases`, 'Cases']} />

                    <Bar dataKey="cases" fill="#5780be" barSize={30} />
                </BarChart>
            </ResponsiveContainer>

            {data.length === 0 && (
                <p className="text-center text-gray-500 mt-2">
                    No monthly statistics available.
                </p>
            )}
        </div>
    );
}