import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

export default function MonthlyTrendChart({ data = [] }) {
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
                  { month: "Sep", cases: 0 },
                  { month: "Oct", cases: 0 },
                  { month: "Nov", cases: 0 },
                  { month: "Dec", cases: 0 },
              ];

    const totalCases = data.reduce(
        (total, item) => total + Number(item.cases || 0),
        0
    );

    const hasMonthlyData = totalCases > 0;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_-12px_rgba(15,23,42,0.15)]">
            {/* HEADER */}
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Case Activity
                    </p>

                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                        Monthly Case Trend
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Support cases created over time
                    </p>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Total Cases
                    </p>

                    <p className="mt-0.5 text-lg font-semibold text-slate-900">
                        {totalCases}
                    </p>
                </div>
            </div>

            {/* CHART */}
            <div className="px-5 pb-5 pt-6 sm:px-6">
                <div className="h-[340px] w-full">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -15,
                                bottom: 5,
                            }}
                            barCategoryGap="28%"
                        >
                            <CartesianGrid
                                vertical={false}
                                stroke="#e2e8f0"
                                strokeDasharray="4 4"
                            />

                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 11,
                                }}
                                dy={10}
                            />

                            <YAxis
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 11,
                                }}
                            />

                            <Tooltip
                                cursor={{
                                    fill: "#f8fafc",
                                }}
                                contentStyle={{
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    boxShadow:
                                        "0 10px 30px -15px rgba(15,23,42,0.25)",
                                    padding: "10px 12px",
                                }}
                                labelStyle={{
                                    color: "#0f172a",
                                    fontWeight: 600,
                                    fontSize: "12px",
                                }}
                                itemStyle={{
                                    color: "#475569",
                                    fontSize: "12px",
                                }}
                                formatter={(value) => [
                                    `${value} cases`,
                                    "Cases",
                                ]}
                            />

                            <Bar
                                dataKey="cases"
                                fill="#5780be"
                                radius={[
                                    6,
                                    6,
                                    0,
                                    0,
                                ]}
                                maxBarSize={42}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {!hasMonthlyData && (
                    <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-center">
                        <p className="text-xs text-slate-400">
                            No monthly case statistics available yet.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
