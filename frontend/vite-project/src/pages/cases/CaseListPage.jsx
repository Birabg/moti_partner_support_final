import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Ticket, PlusCircle, ArrowUpRight } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/Field'
import { useAuth } from '../../context/useAuth'
import { caseService, CASE_STATUSES } from '../../lib/services/caseService'

export default function CaseListPage() {
  const { user } = useAuth()
  const isStaff = ['agent', 'manager', 'admin'].includes(user.role)
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    let active = true
    queueMicrotask(() => active && setLoading(true))
    caseService
      .list({ customerId: isStaff ? undefined : user.id, status: status || undefined, search: search || undefined })
      .then((data) => active && setCases(data))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user.id, isStaff, status, search])

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">Support queue</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900">All support requests</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-500">
              Search by ticket number, filter by status, and jump into any request to review the history.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-full bg-ink-50 px-3 py-1 text-xs text-ink-600">{cases.length} total</div>
            <div className="rounded-full bg-navy-100 px-3 py-1 text-xs text-navy-800">{cases.filter((c) => c.status === 'Open').length} open</div>
            <div className="rounded-full bg-navy-100 px-3 py-1 text-xs text-navy-700">{cases.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length} resolved</div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 sm:max-w-sm">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by subject or ticket #"
                className="w-full rounded-lg border border-ink-300 bg-white py-2.5 pl-9 pr-3.5 text-sm outline-none transition focus:border-navy-600 focus:ring-2 focus:ring-navy-600/15"
              />
            </div>
            <Select id="status-filter" value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-48">
              <option value="">All statuses</option>
              {CASE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          {!isStaff && (
            <Button as={Link} to="/cases/new" variant="accent">
              <PlusCircle size={16} /> New request
            </Button>
          )}
        </div>
      </Card>

      {loading && <Card className="p-5 text-sm text-ink-500">Loading requests…</Card>}

      {!loading && cases.length === 0 && (
        <Card className="p-5">
          <EmptyState
            icon={Ticket}
            title="No matching requests"
            description="Try adjusting your search or filters."
          />
        </Card>
      )}

      {!loading && cases.length > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {cases.map((c) => (
            <Card key={c.id} className="group p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(16,24,40,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-medium text-ink-500">{c.ticketNo}</p>
                  <Link to={`/cases/${c.id}`} className="mt-1 block truncate font-display text-lg font-semibold text-ink-900 group-hover:text-navy-800">
                    {c.subject}
                  </Link>
                  <p className="mt-1 text-sm text-ink-500">{c.category}</p>
                </div>
                <ArrowUpRight size={18} className="shrink-0 text-ink-400 transition group-hover:text-navy-800" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone={c.impact}>{c.impact}</Badge>
                <Badge tone={c.status}>{c.status}</Badge>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-4 rounded-lg bg-ink-50 p-4 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink-500">Updated</dt>
                  <dd className="mt-1 text-ink-900">{new Date(c.updatedAt).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink-500">Branch</dt>
                  <dd className="mt-1 truncate text-ink-900">{c.branch || '—'}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

