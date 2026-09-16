import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Paperclip, MessageSquareHeart, Clock3, User, ShieldCheck, FileText } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Select } from '../../components/ui/Field'
import { useAuth } from '../../context/useAuth'
import caseApi from '../../api/caseApi'
import PutOnPendingModal from '../../components/cases/PutOnPendingModal'
import EscalateModal from '../../components/cases/EscalateModal'
import CancelCaseModal from '../../components/cases/CancelCaseModal'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

const getAttachmentUrl = (attachment) => {
  if (!attachment) return ''

  if (typeof attachment === 'string') {
    if (/^https?:\/\//i.test(attachment)) return attachment
    const fileName = attachment.split('/').pop()
    return fileName ? `${API_BASE_URL}/uploads/${encodeURIComponent(fileName)}` : ''
  }

  if (attachment.url && /^https?:\/\//i.test(attachment.url)) return attachment.url

  const storagePath = attachment.storagePath || attachment.filePath || attachment.path || attachment.fileName || ''
  if (storagePath) {
    if (/^https?:\/\//i.test(storagePath)) return storagePath
    const fileName = storagePath.replace(/\\/g, '/').split('/').filter(Boolean).pop()
    if (fileName) return `${API_BASE_URL}/uploads/${encodeURIComponent(fileName)}`
  }

  if (attachment.fileName) {
    return `${API_BASE_URL}/uploads/${encodeURIComponent(attachment.fileName)}`
  }

  return ''
}

export default function CaseDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const resolveUserRole = (account) => {
    if (!account) return 'customer'
    if (account.role) return String(account.role).toLowerCase()
    if (account.isSAdmin) return 'admin'
    if (account.isManager) return 'manager'
    if (account.isPSsupport) return 'agent'
    if (account.isDirector) return 'director'
    return String(account.partyType || 'customer').toLowerCase()
  }
  const userRole = resolveUserRole(user)
  const isStaff = ['agent', 'manager', 'admin', 'director'].includes(userRole)

  const [caseItem, setCaseItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [hasFeedback, setHasFeedback] = useState(false)
  const [error, setError] = useState('')

  const [showPendingModal, setShowPendingModal] = useState(false)
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  async function load() {
    try {
      const resp = await caseApi.getCase(id)
      const data = resp?.data?.data || resp?.data || null
      setCaseItem(data)
      if (['Resolved', 'Closed'].includes(data?.status)) {
        // attempt to call feedbackService if available (best-effort)
        try {
          // eslint-disable-next-line no-undef
          if (typeof feedbackService !== 'undefined') setHasFeedback(await feedbackService.hasFeedback(id))
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      setError(err.message || String(err))
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
    const target = e.target.value
    setUpdating(true)
    try {
      let payload = { status: target }

      // Require description/reason for PENDING and ESCALATED and CANCELLED
      if (['PENDING', 'ESCALATED'].includes(target)) {
        const reason = window.prompt(`Please provide a short reason for setting status to ${target}:`)
        if (!reason || reason.trim().length < 5) {
          alert('A reason of at least 5 characters is required.')
          return
        }
        payload.reason = reason.trim()
      }

      if (target === 'CANCELLED') {
        if (!user || user.role !== 'admin') {
          alert('Only System Administrators may cancel cases.')
          return
        }
        const confirmCancel = window.confirm('Are you sure you want to CANCEL this case? This action is restricted to System Administrators.')
        if (!confirmCancel) return
        const reason = window.prompt('Cancellation reason (required):')
        if (!reason || reason.trim().length < 5) {
          alert('A cancellation reason of at least 5 characters is required.')
          return
        }
        payload.reason = reason.trim()
      }

      await caseApi.updateStatus(id, payload)

      // reload fresh case
      await load()
    } catch (err) {
      console.error('Status change failed:', err)
      alert(err?.message || 'Failed to change case status')
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

  const normalizeStatus = (value) => String(value || '').toUpperCase().replace(/\s+/g, '_')
  const currentStatus = normalizeStatus(caseItem.status)
  const isAdmin = userRole === 'admin'
  const isManagerOrStaff = ['agent', 'manager', 'admin', 'director'].includes(userRole)
  const statusHistory = Array.isArray(caseItem.statusHistory) ? caseItem.statusHistory : []
  const latestStatusEntry = [...statusHistory].reverse().find((item) => normalizeStatus(item?.toStatus ?? item?.newStatus ?? item?.status) === currentStatus)
  const pendingReason = [...statusHistory].reverse().find((item) => normalizeStatus(item?.toStatus ?? item?.newStatus ?? item?.status) === 'PENDING')?.reason || latestStatusEntry?.reason || 'No reason provided.'
  const escalatedReason = [...statusHistory].reverse().find((item) => normalizeStatus(item?.toStatus ?? item?.newStatus ?? item?.status) === 'ESCALATED')?.reason || latestStatusEntry?.reason || 'No escalation reason provided.'

  const resumeCase = async () => {
    try {
      await caseApi.updateStatus(caseItem.id, {
        status: 'IN_PROGRESS',
        reason: currentStatus === 'PENDING' ? 'Case resumed after pending state.' : 'Case resumed after escalation.'
      })
      await load()
    } catch (err) {
      alert(err?.message || 'Failed to resume case')
    }
  }

  const resolveCase = async () => {
    const summary = window.prompt('Please provide the resolution summary:')
    if (!summary || summary.trim().length < 10) {
      alert('A detailed resolution summary is required (minimum 10 characters).')
      return
    }
    try {
      await caseApi.updateStatus(caseItem.id, {
        status: 'RESOLVED',
        resolutionSummary: summary.trim(),
        reason: 'Case resolved by support team.'
      })
      await load()
    } catch (err) {
      alert(err?.message || 'Failed to resolve case')
    }
  }

  const acceptResolution = async () => {
    try {
      await caseApi.updateStatus(caseItem.id, {
        status: 'CLOSED',
        reason: 'Customer accepted the resolution.'
      })
      await load()
    } catch (err) {
      alert(err?.message || 'Unable to accept resolution')
    }
  }

  const rejectResolution = async () => {
    try {
      await caseApi.updateStatus(caseItem.id, {
        status: 'IN_PROGRESS',
        reason: 'Customer rejected the resolution and requested rework.'
      })
      await load()
    } catch (err) {
      alert(err?.message || 'Unable to reject resolution')
    }
  }

  const [showMoreActions, setShowMoreActions] = useState(false)

  const caseActions = []
  if (currentStatus === 'IN_PROGRESS') {
    if (isManagerOrStaff) {
      caseActions.push({ label: 'Put on Pending', onClick: () => setShowPendingModal(true), color: 'bg-amber-500 text-white hover:bg-amber-600' })
    }
    if (isManagerOrStaff) {
      caseActions.push({ label: 'Escalate', onClick: () => setShowEscalateModal(true), color: 'bg-orange-500 text-white hover:bg-orange-600' })
      caseActions.push({ label: 'Resolve Case', onClick: resolveCase, color: 'bg-blue-600 text-white hover:bg-blue-700' })
    }
  }

  if (['PENDING', 'ESCALATED'].includes(currentStatus) && (isManagerOrStaff || caseItem.customer?.id === user?.id)) {
    caseActions.push({ label: 'Resume Case', onClick: resumeCase, color: 'bg-emerald-600 text-white hover:bg-emerald-700' })
  }

  if (currentStatus === 'CUSTOMER_CONFIRMATION' && !isManagerOrStaff) {
    caseActions.push({ label: 'Accept Resolution', onClick: acceptResolution, color: 'bg-emerald-600 text-white hover:bg-emerald-700' })
    caseActions.push({ label: 'Reject Resolution', onClick: rejectResolution, color: 'bg-red-600 text-white hover:bg-red-700' })
  }

  const showCaseActionBar = caseActions.length > 0 || (isAdmin && currentStatus !== 'CANCELLED')

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/cases')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft size={15} /> Back to requests
      </button>

      <Card className="overflow-hidden bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 p-6 text-white shadow-[0_24px_60px_rgba(7,27,48,0.18)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-mono text-xs text-navy-200">{caseItem.caseNumber || caseItem.ticketNo || caseItem.id}</p>
            <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{caseItem.subject}</h2>
            <p className="mt-2 text-sm text-navy-200">
              Customer: {caseItem.customer ? `${caseItem.customer.firstName || ''} ${caseItem.customer.lastName || ''}`.trim() || caseItem.customer.email : 'Unknown'}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <Badge tone={caseItem.impact}>{caseItem.impact} impact</Badge>
            <Badge tone={currentStatus}>{caseItem.status}</Badge>
          </div>
        </div>

        {showCaseActionBar && (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-navy-100">Case Actions</h3>
              {isAdmin && currentStatus !== 'CANCELLED' && (
                <div className="relative">
                  <button
                    type="button"
                    className="rounded border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10"
                    onClick={() => setShowMoreActions((prev) => !prev)}
                  >
                    More Actions
                  </button>
                  {showMoreActions && (
                    <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-2 text-left shadow-lg">
                      <button
                        type="button"
                        className="w-full rounded px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setShowMoreActions(false)
                          setShowCancelModal(true)
                        }}
                      >
                        Cancel Case
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {caseActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition ${action.color}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {currentStatus === 'PENDING' && (
        <Card className="border-l-4 border-amber-500 bg-amber-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-800">Pending reason</h3>
          <p className="mt-2 text-sm text-amber-900">{pendingReason}</p>
        </Card>
      )}

      {currentStatus === 'ESCALATED' && (
        <Card className="border-l-4 border-orange-500 bg-orange-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-800">Escalation information</h3>
          <p className="mt-2 text-sm text-orange-900">{escalatedReason}</p>
        </Card>
      )}

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
                  {caseItem.attachments.map((attachment) => {
                    const url = getAttachmentUrl(attachment)
                    const label = typeof attachment === 'string' ? attachment : (attachment.fileName || attachment.name || 'Attachment')

                    return (
                      <li key={label} className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2 text-sm text-navy-800">
                        <Paperclip size={14} />
                        {url ? (
                          <a href={url} target="_blank" rel="noreferrer" className="text-navy-800 underline break-all">
                            {label}
                          </a>
                        ) : (
                          <span className="break-all">{label}</span>
                        )}
                      </li>
                    )
                  })}
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

          {/* modals */}
          {showPendingModal && (
            <PutOnPendingModal
              caseId={caseItem.id}
              onClose={() => setShowPendingModal(false)}
              onSuccess={() => load()}
              api={caseApi}
            />
          )}

          {showEscalateModal && (
            <EscalateModal
              caseId={caseItem.id}
              onClose={() => setShowEscalateModal(false)}
              onSuccess={() => load()}
              api={caseApi}
            />
          )}

          {showCancelModal && (
            <CancelCaseModal
              caseId={caseItem.id}
              onClose={() => setShowCancelModal(false)}
              onSuccess={() => load()}
              api={caseApi}
            />
          )}
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
