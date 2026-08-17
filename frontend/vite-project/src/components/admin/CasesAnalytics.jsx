import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { AnalyticsApi } from "../../api/analyticsApi";

const emptyData = [
    { day: "Open", count: 0 },
    { day: "In Progress", count: 0 },
    { day: "Resolved", count: 0 },
    { day: "Closed", count: 0 },
];

export default function CasesAnalytics() {
    const [data, setData] = useState(emptyData);

    useEffect(() => {
        const load = () => {
            AnalyticsApi.getCaseSummary()
                .then((res) => {
                    const payload = res?.data?.data || {};
                    setData([
                        { day: "Open", count: payload.open || 0 },
                        { day: "In Progress", count: payload.inProgress || 0 },
                        { day: "Resolved", count: payload.resolved || 0 },
                        { day: "Closed", count: payload.closed || 0 },
                    ]);
                })
                .catch((error) => console.error(error));
        };

        load();

        const handleCaseUpdated = () => load();
        window.addEventListener("cases:updated", handleCaseUpdated);

        return () => {
            window.removeEventListener("cases:updated", handleCaseUpdated);
        };
    }, []);

    return (
        <div className="rounded-lg border border-navy-200/60 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-end justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Case workload overview</h2>
                    <p className="mt-1 text-sm text-slate-500">Live status distribution from the backend analytics endpoint.</p>
                </div>
            </div>

            <div className="h-[320px] w-full">
                <ResponsiveContainer>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(value) => [`${value} cases`, "Count"]} />
                        <Line type="monotone" dataKey="count" stroke="#0f3876" strokeWidth={3} dot={{ r: 6, fill: "#1456b8" }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}