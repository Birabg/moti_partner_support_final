import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const COLORS = [
    "#5780be",
    "#0ea5e9",
    "#8b5cf6",
    "#ef4444",
    "#10b981",
    "#a78bfa",
    "#64748b",
    "#9a6b75",
];

const STATUS_ORDER = [
    "Open",
    "In Progress",
    "Pending",
    "Escalated",
    "Resolved",
    "Awaiting Customer",
    "Closed",
    "Cancelled",
];

export default function StatusPieChart({ data = [] }) {
    const normalized = data.map((item) => ({
        ...item,
        name: String(item.name || "").trim(),
        value: Number(item.value || 0),
    }));

    const hasData = normalized.some(
        (item) => item.value > 0
    );

    const chartData = STATUS_ORDER.map((name) => {
        const found = normalized.find(
            (item) => item.name === name
        );

        return found || {
            name,
            value: 0,
        };
    });

    const displayData = hasData
        ? chartData
        : STATUS_ORDER.map((name) => ({
              name,
              value: 1,
              displayValue: 0,
          }));

    const total = normalized.reduce(
        (sum, item) => sum + item.value,
        0
    );

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_-12px_rgba(15,23,42,0.15)]">
            {/* HEADER */}
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Case Overview
                    </p>

                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                        Case Distribution
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Current support case status breakdown
                    </p>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Total
                    </p>

                    <p className="mt-0.5 text-lg font-semibold text-slate-900">
                        {total}
                    </p>
                </div>
            </div>

            {/* CHART */}
            <div className="px-6 pt-6">
                <div className="relative h-[290px]">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <PieChart>
                            <Pie
                                data={displayData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={82}
                                outerRadius={112}
                                paddingAngle={3}
                                stroke="#ffffff"
                                strokeWidth={3}
                            >
                                {displayData.map(
                                    (entry, index) => (
                                        <Cell
                                            key={entry.name}
                                            fill={
                                                COLORS[
                                                    index %
                                                        COLORS.length
                                                ]
                                            }
                                            fillOpacity={
                                                hasData
                                                    ? 1
                                                    : 0.3
                                            }
                                        />
                                    )
                                )}
                            </Pie>

                            <Tooltip
                                formatter={(
                                    value,
                                    name,
                                    props
                                ) => {
                                    const realValue =
                                        props?.payload
                                            ?.displayValue ??
                                        value;

                                    return [
                                        realValue,
                                        name,
                                    ];
                                }}
                                contentStyle={{
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    boxShadow:
                                        "0 10px 30px -15px rgba(15,23,42,0.25)",
                                    fontSize: "12px",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* CENTER VALUE */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-3xl font-semibold tracking-tight text-slate-900">
                                {total}
                            </p>

                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                Total Cases
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* LEGEND */}
            <div className="border-t border-slate-100 px-6 py-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {displayData.map((item, index) => {
                        const value =
                            item.displayValue ??
                            item.value;

                        return (
                            <div
                                key={item.name}
                                className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50"
                            >
                                <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{
                                        backgroundColor:
                                            COLORS[
                                                index %
                                                    COLORS.length
                                            ],
                                        opacity: hasData
                                            ? 1
                                            : 0.45,
                                    }}
                                />

                                <span className="min-w-0 truncate text-xs font-medium text-slate-600">
                                    {item.name}
                                </span>

                                <span className="ml-auto text-xs font-semibold text-slate-900">
                                    {value}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {!hasData && (
                    <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-center">
                        <p className="text-xs text-slate-400">
                            No case data available yet.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
