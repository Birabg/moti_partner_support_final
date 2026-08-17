import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Paperclip, MessageSquareHeart, Clock3, User, ShieldCheck, FileText } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Select } from '../../components/ui/Field'
import { useAuth } from '../../context/useAuth'


export default function CaseDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isStaff = ['agent', 'manager', 'admin'].includes(user.role)

  const [caseItem, setCaseItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [hasFeedback, setHasFeedback] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await caseService.get(id)
      setCaseItem(data)
      if (['Resolved', 'Closed'].includes(data.status)) {
        setHasFeedback(await feedbackService.hasFeedback(id))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      load()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleStatusChange(e) {
    setUpdating(true)
    try {
      const updated = await caseService.updateStatus(id, e.target.value, user.name)
      setCaseItem(updated)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <p className="text-sm text-ink-500">Loading case…</p>
  if (error || !caseItem)
    return (
      <div className="text-sm text-danger-600">
        {error || 'Case not found.'}{' '}
        <Link to="/cases" className="underline">
          Back to requests
        </Link>
      </div>
    )

  const canLeaveFeedback =
    !isStaff && ['Resolved', 'Closed'].includes(caseItem.status) && !hasFeedback

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/cases')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft size={15} /> Back to requests
      </button>

      <Card className="overflow-hidden bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 p-6 text-white shadow-[0_24px_60px_rgba(7,27,48,0.18)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs text-navy-200">{caseItem.ticketNo}</p>
            <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{caseItem.subject}</h2>
            <p className="mt-3 max-w-3xl text-sm text-navy-200">
              Review the request details, evidence, and case timeline before making an update.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={caseItem.impact}>{caseItem.impact} impact</Badge>
            <Badge tone={caseItem.status}>{caseItem.status}</Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_0.8fr]">
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-6">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-ink-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Category</dt>
                <dd className="mt-1 text-sm text-ink-900">{caseItem.category}</dd>
              </div>
              <div className="rounded-lg bg-ink-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Frequency</dt>
                <dd className="mt-1 text-sm text-ink-900">{caseItem.frequency || '—'}</dd>
              </div>
              <div className="rounded-lg bg-ink-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Technical environment</dt>
                <dd className="mt-1 text-sm text-ink-900">{caseItem.techEnvironment || '—'}</dd>
              </div>
              <div className="rounded-lg bg-ink-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Submitted</dt>
                <dd className="mt-1 text-sm text-ink-900">{new Date(caseItem.createdAt).toLocaleString()}</dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-ink-200 pt-5">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Problem description</dt>
              <dd className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-700">
                {caseItem.description}
              </dd>
            </div>

            {caseItem.attachments?.length > 0 && (
              <div className="mt-5 border-t border-ink-200 pt-5">
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Attachments</dt>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {caseItem.attachments.map((name) => (
                    <li key={name} className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2 text-sm text-navy-800">
                      <Paperclip size={14} /> {name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-semibold text-ink-900">Case history</h3>
                <p className="mt-1 text-sm text-ink-500">A chronological record of every case change.</p>
              </div>
              <FileText size={18} className="text-ink-400" />
            </div>
            <ol className="mt-5 space-y-4 border-l border-ink-200 pl-4">
              {caseItem.history.map((event, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-navy-500" />
                  <p className="text-sm text-ink-900">{event.action}</p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {event.by} · {new Date(event.at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-5">
          {isStaff && (
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-navy-600" />
                <h3 className="font-display text-sm font-semibold text-ink-900">Case management</h3>
              </div>
              <div className="mt-4">
                <Select id="status" label="Status" value={caseItem.status} onChange={handleStatusChange} disabled={updating}>
                  {CASE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="mt-4 border-t border-ink-200 pt-4 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Assigned to</p>
                <p className="mt-1 text-ink-900">
                  {caseItem.assignedTo ? 'Selam Tesfaye' : 'Unassigned'}
                </p>
              </div>
            </Card>
          )}

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Clock3 size={16} className="text-gold-600" />
              <h3 className="font-display text-sm font-semibold text-ink-900">Case metadata</h3>
            </div>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-start gap-3 rounded-lg bg-ink-50 p-3">
                <User size={16} className="mt-0.5 shrink-0 text-ink-500" />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink-500">Assigned to</dt>
                  <dd className="mt-1 text-ink-900">{caseItem.assignedTo ? 'Selam Tesfaye' : 'Unassigned'}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-ink-50 p-3">
                <Clock3 size={16} className="mt-0.5 shrink-0 text-ink-500" />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink-500">Last updated</dt>
                  <dd className="mt-1 text-ink-900">{new Date(caseItem.updatedAt).toLocaleString()}</dd>
                </div>
              </div>
            </dl>
          </Card>

          {canLeaveFeedback && (
            <Card className="overflow-hidden bg-gradient-to-br from-gold-500 to-gold-400 p-5 text-navy-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/30 text-navy-950">
                <MessageSquareHeart size={18} />
              </div>
              <h3 className="mt-3 font-display text-sm font-semibold text-navy-950">How did we do?</h3>
              <p className="mt-1 text-sm text-navy-950/80">
                Your case is {caseItem.status.toLowerCase()}. Share feedback to help us improve.
              </p>
              <Button as={Link} to={`/feedback/new/${caseItem.id}`} variant="gold" className="mt-4 w-full">
                Leave feedback
              </Button>
            </Card>
          )}

          {!isStaff && hasFeedback && (
            <Card className="p-5 text-sm text-ink-500">Thanks — you've already submitted feedback for this case.</Card>
          )}
        </div>
      </div>
    </div>
  )
}
