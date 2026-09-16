import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Paperclip,
  MessageSquareHeart,
  Clock3,
  User,
  ShieldCheck,
  FileText,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Copy,
  Check,
  Calendar,
  Layers,
  Activity,
  Cpu,
  RefreshCw,
  CornerDownRight
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Select } from '../../components/ui/Field'
import { useAuth } from '../../context/useAuth'
import caseApi from '../../api/caseApi'
import PutOnPendingModal from '../../components/cases/PutOnPendingModal'
import EscalateModal from '../../components/cases/EscalateModal'
import CancelCaseModal from '../../components/cases/CancelCaseModal'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '')

const DEFAULT_STATUSES = [
  'SUBMITTED',
  'IN_PROGRESS',
  'PENDING',
  'ESCALATED',
  'RESOLVED',
  'CUSTOMER_CONFIRMATION',
  'CLOSED',
  'CANCELLED'
]

const PIPELINE_STEPS = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'CUSTOMER_CONFIRMATION', label: 'Review' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' }
]

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
  const isAdmin = userRole === 'admin'
  const isManagerOrStaff = isStaff

  const [caseItem, setCaseItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [hasFeedback, setHasFeedback] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const [showPendingModal, setShowPendingModal] = useState(false)
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showMoreActions, setShowMoreActions] = useState(false)

  const moreActionsRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (moreActionsRef.current && !moreActionsRef.current.contains(e.target)) {
        setShowMoreActions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function load() {
    try {
      const resp = await caseApi.getCase(id)
      const data = resp?.data?.data || resp?.data || null
      setCaseItem(data)
      if (['Resolved', 'Closed'].includes(data?.status)) {
        try {
          // eslint-disable-next-line no-undef
          if (typeof feedbackService !== 'undefined') {
            setHasFeedback(await feedbackService.hasFeedback(id))
          }
        } catch {
          // Best effort
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

  const copyCaseId = () => {
    const caseId = caseItem?.caseNumber || caseItem?.ticketNo || caseItem?.id
    if (caseId) {
      navigator.clipboard.writeText(caseId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleStatusChange(e) {
    const target = e.target.value
    setUpdating(true)
    try {
      let payload = { status: target }

      if (['PENDING', 'ESCALATED'].includes(target)) {
        const reason = window.prompt(`Please provide a short reason for setting status to ${target}:`)
        if (!reason || reason.trim().length < 5) {
          alert('A reason of at least 5 characters is required.')
          return
        }
        payload.reason = reason.trim()
      }

      if (target === 'CANCELLED') {
        if (!isAdmin) {
          alert('Only System Administrators may cancel cases.')
          return
        }
        const confirmCancel = window.confirm(
          'Are you sure you want to CANCEL this case? This action is restricted to System Administrators.'
        )
        if (!confirmCancel) return
        const reason = window.prompt('Cancellation reason (required):')
        if (!reason || reason.trim().length < 5) {
          alert('A cancellation reason of at least 5 characters is required.')
          return
        }
        payload.reason = reason.trim()
      }

      await caseApi.updateStatus(id, payload)
      await load()
    } catch (err) {
      console.error('Status change failed:', err)
      alert(err?.message || 'Failed to change case status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-navy-900" />
        <p className="text-xs font-semibold tracking-wide uppercase text-slate-400">Loading case file…</p>
      </div>
    )
  }

  if (error || !caseItem) {
    return (
      <div className="mx-auto mt-12 max-w-md rounded-2xl border border-rose-100 bg-rose-50/50 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
          <AlertCircle size={22} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">Case not accessible</h3>
        <p className="mt-1 text-sm text-slate-600">{error || 'This case record cannot be found or is unavailable.'}</p>
        <Link
          to="/cases"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
      </div>
    )
  }

  const normalizeStatus = (value) => String(value || '').toUpperCase().replace(/\s+/g, '_')
  const currentStatus = normalizeStatus(caseItem.status)
  const canLeaveFeedback = !isStaff && ['Resolved', 'Closed'].includes(caseItem.status) && !hasFeedback
  const statusHistory = Array.isArray(caseItem.statusHistory) ? caseItem.statusHistory : []
  const latestStatusEntry = [...statusHistory]
    .reverse()
    .find((item) => normalizeStatus(item?.toStatus ?? item?.newStatus ?? item?.status) === currentStatus)
  const pendingReason =
    [...statusHistory]
      .reverse()
      .find((item) => normalizeStatus(item?.toStatus ?? item?.newStatus ?? item?.status) === 'PENDING')?.reason ||
    latestStatusEntry?.reason ||
    'No reason provided.'
  const escalatedReason =
    [...statusHistory]
      .reverse()
      .find((item) => normalizeStatus(item?.toStatus ?? item?.newStatus ?? item?.status) === 'ESCALATED')?.reason ||
    latestStatusEntry?.reason ||
    'No escalation reason provided.'

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

  const caseActions = []
  if (currentStatus === 'IN_PROGRESS') {
    if (isManagerOrStaff) {
      caseActions.push({
        label: 'Put on Pending',
        icon: <Clock3 size={14} />,
        onClick: () => setShowPendingModal(true),
        className: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
      })
      caseActions.push({
        label: 'Escalate',
        icon: <AlertTriangle size={14} />,
        onClick: () => setShowEscalateModal(true),
        className: 'bg-orange-500/15 text-orange-300 border border-orange-500/30 hover:bg-orange-500/25'
      })
      caseActions.push({
        label: 'Resolve Case',
        icon: <CheckCircle2 size={14} />,
        onClick: resolveCase,
        className: 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm border border-blue-400/30'
      })
    }
  }

  if (['PENDING', 'ESCALATED'].includes(currentStatus) && (isManagerOrStaff || caseItem.customer?.id === user?.id)) {
    caseActions.push({
      label: 'Resume Case',
      icon: <PlayCircle size={14} />,
      onClick: resumeCase,
      className: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm border border-emerald-400/30'
    })
  }

  if (currentStatus === 'CUSTOMER_CONFIRMATION' && !isManagerOrStaff) {
    caseActions.push({
      label: 'Accept Resolution',
      icon: <CheckCircle2 size={14} />,
      onClick: acceptResolution,
      className: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
    })
    caseActions.push({
      label: 'Reject Resolution',
      icon: <XCircle size={14} />,
      onClick: rejectResolution,
      className: 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm'
    })
  }

  const showCaseActionBar = caseActions.length > 0 || (isAdmin && currentStatus !== 'CANCELLED')
  const statusOptions = typeof CASE_STATUSES !== 'undefined' ? CASE_STATUSES : DEFAULT_STATUSES

  const assigneeName = caseItem.assignedTo
    ? typeof caseItem.assignedTo === 'object'
      ? `${caseItem.assignedTo.firstName || ''} ${caseItem.assignedTo.lastName || ''}`.trim() ||
        caseItem.assignedTo.name ||
        caseItem.assignedTo.email
      : caseItem.assignedTo
    : 'Unassigned'

  // Determine current pipeline step index
  const activeStepIdx = PIPELINE_STEPS.findIndex((s) => s.key === currentStatus)

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-16 sm:px-6">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/cases')}
          className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Back to requests
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading || updating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            title="Refresh case"
          >
            <RefreshCw size={13} className={updating ? 'animate-spin text-navy-600' : ''} />
            Sync
          </button>
        </div>
      </div>

      {/* Hero Header Frame */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0B132B] p-6 text-white shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={copyCaseId}
                className="group inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs font-medium text-slate-300 transition hover:border-white/25 hover:bg-white/10"
              >
                <span>{caseItem.caseNumber || caseItem.ticketNo || caseItem.id}</span>
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-slate-400 group-hover:text-white" />}
              </button>

              <span className="text-xs text-slate-400">
                Created {new Date(caseItem.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {caseItem.subject}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-slate-400" />
                <span>Customer:</span>
                <span className="font-semibold text-white">
                  {caseItem.customer
                    ? `${caseItem.customer.firstName || ''} ${caseItem.customer.lastName || ''}`.trim() ||
                      caseItem.customer.email
                    : 'Unknown'}
                </span>
              </div>
              <span className="hidden text-slate-600 sm:inline">&bull;</span>
              <div className="flex items-center gap-1.5">
                <Layers size={14} className="text-slate-400" />
                <span>Category:</span>
                <span className="font-medium text-slate-200">{caseItem.category || 'General Support'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start">
            <Badge tone={caseItem.impact} className="shadow-sm">
              {caseItem.impact} Priority
            </Badge>
            <Badge tone={currentStatus} className="shadow-sm">
              {caseItem.status}
            </Badge>
          </div>
        </div>

        {/* Action Header Bar */}
        {showCaseActionBar && (
          <div className="relative z-10 mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-900/60 p-3 backdrop-blur-md">
            <div className="flex items-center gap-2 pl-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Available Actions
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {caseActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition active:scale-[0.98] ${action.className}`}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}

              {isAdmin && currentStatus !== 'CANCELLED' && (
                <div className="relative" ref={moreActionsRef}>
                  <button
                    type="button"
                    aria-label="More actions"
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
                    onClick={() => setShowMoreActions((prev) => !prev)}
                  >
                    <MoreVertical size={14} />
                  </button>

                  {showMoreActions && (
                    <div className="absolute right-0 z-30 mt-2 w-44 origin-top-right rounded-xl border border-slate-200 bg-white p-1 text-slate-800 shadow-xl">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                        onClick={() => {
                          setShowMoreActions(false)
                          setShowCancelModal(true)
                        }}
                      >
                        <XCircle size={14} />
                        Cancel Case
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Critical Status Alerts */}
      {currentStatus === 'PENDING' && (
        <div className="flex items-start gap-3.5 rounded-xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
          <AlertCircle className="mt-0.5 shrink-0 text-amber-600" size={18} />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900">Case In Pending State</h2>
            <p className="mt-1 text-sm text-amber-800 leading-relaxed">{pendingReason}</p>
          </div>
        </div>
      )}

      {currentStatus === 'ESCALATED' && (
        <div className="flex items-start gap-3.5 rounded-xl border border-orange-200 bg-orange-50/80 p-4 shadow-sm">
          <AlertTriangle className="mt-0.5 shrink-0 text-orange-600" size={18} />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-orange-900">Escalation in Progress</h2>
            <p className="mt-1 text-sm text-orange-800 leading-relaxed">{escalatedReason}</p>
          </div>
        </div>
      )}

      {/* Two-Column Structured Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left/Primary Column (8 Columns) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Progress Tracker Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Lifecycle Progress</h2>
            <div className="mt-4 flex items-center justify-between">
              {PIPELINE_STEPS.map((step, idx) => {
                const isPassed = activeStepIdx >= 0 && idx < activeStepIdx
                const isCurrent = idx === activeStepIdx
                return (
                  <div key={step.key} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${
                          isPassed
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-navy-900 text-white ring-4 ring-navy-100'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isPassed ? <Check size={14} /> : idx + 1}
                      </div>
                      <span className={`mt-2 text-[11px] font-medium ${isCurrent ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < PIPELINE_STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 -mt-5 transition-colors ${
                          isPassed ? 'bg-emerald-600' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Core Case Information */}
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Key Value Data Grid */}
            <div className="p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">System Parameters</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Activity size={13} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Frequency</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{caseItem.frequency || 'Not Specified'}</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Cpu size={13} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Environment</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-800 truncate" title={caseItem.techEnvironment}>
                    {caseItem.techEnvironment || 'Standard'}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={13} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Created</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {new Date(caseItem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Body */}
            <div className="p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Problem Description</h2>
              <div className="mt-3 rounded-xl bg-slate-50 p-4.5 text-sm leading-relaxed text-slate-800 whitespace-pre-line border border-slate-100">
                {caseItem.description}
              </div>
            </div>

            {/* Attachments Section */}
            {caseItem.attachments?.length > 0 && (
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Attached Files ({caseItem.attachments.length})
                  </h2>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {caseItem.attachments.map((attachment, idx) => {
                    const url = getAttachmentUrl(attachment)
                    const label =
                      typeof attachment === 'string'
                        ? attachment
                        : attachment.fileName || attachment.name || `Document_${idx + 1}`

                    return (
                      <div
                        key={idx}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-300 hover:bg-blue-50/20"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition">
                            <Paperclip size={14} />
                          </div>
                          <span className="truncate text-xs font-medium text-slate-700 group-hover:text-slate-900">
                            {label}
                          </span>
                        </div>

                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            title="Open file"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Activity History</h2>
                <p className="mt-0.5 text-xs text-slate-500">System audit log of events and state changes</p>
              </div>
              <FileText size={16} className="text-slate-400" />
            </div>

            <div className="mt-6">
              {caseItem.history && caseItem.history.length > 0 ? (
                <ol className="relative ml-3 space-y-6 border-l-2 border-slate-100">
                  {caseItem.history.map((event, i) => (
                    <li key={i} className="group relative pl-6">
                      <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-navy-900 ring-4 ring-white" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-slate-900">{event.action}</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="font-medium text-slate-700">{event.by}</span>
                          <span>&bull;</span>
                          <span>{new Date(event.at).toLocaleString()}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">No activity recorded for this request.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar (4 Columns) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Staff Controls Panel */}
          {isStaff && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck size={16} className="text-navy-900" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Operator Console</h2>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Transition Status
                  </label>
                  <Select
                    id="status"
                    value={caseItem.status}
                    onChange={handleStatusChange}
                    disabled={updating}
                    className="w-full text-xs"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Assignee</span>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-[10px] font-bold text-white">
                      {assigneeName.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{assigneeName}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Context / Meta Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
              Case Meta
            </h2>

            <dl className="mt-4 space-y-3.5">
              <div className="flex items-start gap-3">
                <User size={15} className="mt-0.5 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <dt className="text-[11px] font-medium text-slate-400">Handler</dt>
                  <dd className="truncate text-xs font-semibold text-slate-800">{assigneeName}</dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock3 size={15} className="mt-0.5 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <dt className="text-[11px] font-medium text-slate-400">Last Modified</dt>
                  <dd className="truncate text-xs font-semibold text-slate-800">
                    {new Date(caseItem.updatedAt).toLocaleString()}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Customer Satisfaction Card */}
          {canLeaveFeedback && (
            <div className="relative overflow-hidden rounded-2xl bg-[#D4AF37] p-6 text-slate-900 shadow-md">
              <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/20 blur-xl" />
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/10">
                <MessageSquareHeart size={20} className="text-slate-900" />
              </div>
              <h3 className="mt-3 text-sm font-bold">How was your service?</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-800">
                This case has been resolved. Let us know how the support team handled your request.
              </p>
              <Button
                as={Link}
                to={`/feedback/new/${caseItem.id}`}
                className="mt-4 w-full justify-center bg-slate-900 text-white hover:bg-slate-800"
              >
                Submit Feedback
              </Button>
            </div>
          )}

          {!isStaff && hasFeedback && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium text-emerald-900">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>Feedback submitted for this ticket.</span>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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
  )
}