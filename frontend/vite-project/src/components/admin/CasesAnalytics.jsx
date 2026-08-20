import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { AnalyticsApi } from "../../api/analyticsApi";

const STATUS_ORDER = [
  { key: 'OPEN', label: 'Open', color: '#3b82f6' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#10b981' },
  { key: 'PENDING', label: 'Pending', color: '#8b5cf6' },
  { key: 'ESCALATED', label: 'Escalated', color: '#ef4444' },
  { key: 'RESOLVED', label: 'Resolved', color: '#06b6d4' },
  { key: 'CUSTOMER_CONFIRMATION', label: 'Awaiting Customer', color: '#f97316' },
  { key: 'CLOSED', label: 'Closed', color: '#64748b' },
];

const emptyData = STATUS_ORDER.map(s => ({ status: s.label, count: 0, key: s.key, color: s.color }));

export default function CasesAnalytics() {
    const [data, setData] = useState(emptyData);

    useEffect(() => {
        const load = () => {
            AnalyticsApi.getCaseSummary()
                .then((res) => {
                    const payload = res?.data?.data || {};

                    const mapped = STATUS_ORDER.map(s => ({
                        status: s.label,
                        key: s.key,
                        count:
                          s.key === 'OPEN' ? (payload.open ?? payload.OPEN ?? 0) :
                          s.key === 'IN_PROGRESS' ? (payload.inProgress ?? payload.IN_PROGRESS ?? 0) :
                          s.key === 'PENDING' ? (payload.pending ?? payload.PENDING ?? 0) :
                          s.key === 'ESCALATED' ? (payload.escalated ?? payload.ESCALATED ?? 0) :
                          s.key === 'RESOLVED' ? (payload.resolved ?? payload.RESOLVED ?? 0) :
                          s.key === 'CUSTOMER_CONFIRMATION' ? (payload.customerConfirmation ?? payload.CUSTOMER_CONFIRMATION ?? 0) :
                          s.key === 'CLOSED' ? (payload.closed ?? payload.CLOSED ?? 0) : 0,
                        color: s.color,
                    }));

                    setData(mapped);
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

            <div className="flex gap-6">
              {/* Left column: status list */}
              <div className="w-64">
                <ul className="space-y-3">
                  {data.map(d => (
                    <li key={d.key} className="flex items-center justify-between bg-slate-50 p-3 rounded-md border">
                      <div className="flex items-center gap-3">
                        <span style={{ width: 12, height: 12, background: d.color, display: 'inline-block', borderRadius: 3 }} />
                        <span className="text-sm font-medium">{d.status}</span>
                      </div>
                      <div className="text-sm text-slate-700 font-bold">{d.count}</div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right column: bar chart (vertical bars) */}
              <div className="flex-1 h-[320px]">
                <ResponsiveContainer>
                  <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                    <XAxis dataKey="status" type="category" tickLine={false} axisLine={false} interval={0} tick={{ angle: -45, textAnchor: 'end' }} height={70} />
                    <YAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => [`${value} cases`, "Count"]} />
                    <Bar dataKey="count" barSize={36}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
        </div>
    );
}