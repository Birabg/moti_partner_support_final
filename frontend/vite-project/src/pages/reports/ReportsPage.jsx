import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Ticket, Clock3, CheckCircle2, Star, BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const PIE_COLORS = ['#0b244a', '#0f4aa3', '#e8a33d', '#667285']

function StatTile({ icon: Icon, label, value, tone }) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-[0_18px_45px_rgba(16,24,40,0.08)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-ink-900">{value}</p>
    </Card>
  )
}

export default function ReportsPage() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    reportService.summary().then(setSummary)
  }, [])

  if (!summary) return <p className="text-sm text-ink-500">Loading reports…</p>

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 p-6 text-white shadow-[0_24px_60px_rgba(7,27,48,0.18)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Badge tone="neutral" className="bg-white/10 text-white ring-1 ring-white/10">Reporting</Badge>
            <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Performance and customer satisfaction</h2>
            <p className="mt-3 max-w-2xl text-sm text-navy-200 sm:text-base">
              Monitor queues, resolution speed, and feedback to understand how support is performing right now.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[22rem] lg:grid-cols-2">
            <div className="rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.18em] text-navy-200">Open cases</p>
              <p className="mt-2 font-display text-2xl font-semibold">{summary.openCases}</p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.18em] text-navy-200">Feedback items</p>
              <p className="mt-2 font-display text-2xl font-semibold">{summary.totalFeedback}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Ticket} label="Total cases" value={summary.totalCases} tone="bg-navy-100 text-navy-800" />
        <StatTile
          icon={Clock3}
          label="Avg. resolution time"
          value={`${summary.avgResolutionHours}h`}
          tone="bg-gold-100 text-gold-600"
        />
        <StatTile
          icon={CheckCircle2}
          label="Resolved cases"
          value={summary.resolvedCases}
          tone="bg-navy-100 text-navy-600"
        />
        <StatTile icon={Star} label="CSAT score" value={`${summary.csatScore}/5`} tone="bg-success-100 text-success-600" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-navy-800" />
            <h3 className="font-display text-base font-semibold text-ink-900">Case volume by status</h3>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#667285' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#667285' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0b244a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <PieChartIcon size={16} className="text-navy-600" />
            <h3 className="font-display text-base font-semibold text-ink-900">Cases by category</h3>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summary.byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {summary.byCategory.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-gold-600" />
            <h3 className="font-display text-base font-semibold text-ink-900">Case trend</h3>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#667285' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#667285' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0f4aa3" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
