import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  UploadCloud,
  FileText,
  AlertCircle,
  Building2,
  User,
  ArrowLeft,
  Info,
  Layers,
  Activity,
  HardDrive
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Field'
import { useAuth } from '../../context/useAuth'
import { caseService, CASE_CATEGORIES, IMPACT_LEVELS } from '../../lib/services/caseService'

const initialForm = {
  subject: '',
  category: CASE_CATEGORIES?.[0] || 'General Support',
  description: '',
  techEnvironment: '',
  frequency: '',
  impact: 'Medium',
}

const MAX_FILES = 5
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function NewCasePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function processFiles(incomingFiles) {
    const selected = Array.from(incomingFiles || [])
    if (!selected.length) return

    if (selected.length + files.length > MAX_FILES) {
      setError(`You can attach a maximum of ${MAX_FILES} files per request.`)
      return
    }

    const oversized = selected.find((file) => file.size > MAX_FILE_SIZE)
    if (oversized) {
      setError(`File "${oversized.name}" exceeds the 50 MB limit.`)
      return
    }

    setFiles((prev) => [...prev, ...selected].slice(0, MAX_FILES))
    setError('')
  }

  function handleFileInput(e) {
    processFiles(e.target.files)
    e.target.value = ''
  }

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.subject.trim() || !form.description.trim()) {
      setError('Please provide both a subject line and a detailed description.')
      return
    }

    setLoading(true)
    try {
      const newCase = await caseService.create(
        {
          ...form,
          customerId: user?.id,
          branch: user?.branch,
          attachments: files.map((f) => f.name),
        },
        user?.name
      )
      navigate(`/cases/${newCase.id}`)
    } catch (err) {
      setError(err?.message || 'Failed to submit case request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      {/* Navigation & Header Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500 transition hover:text-ink-900"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Cancel and return
        </button>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-ink-100 bg-white p-0 shadow-sm">
        {/* Header Banner */}
        <div className="relative border-b border-navy-900/40 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-0.5 text-xs font-medium text-navy-200 backdrop-blur-sm">
                Case Submission
              </span>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Open a Support Ticket
              </h1>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-navy-200">
                Submit issue parameters, technical context, and attachments for priority triage and support assignment.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Global Alert Notification */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-900 animate-in fade-in duration-200">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
              <div className="flex-1 leading-relaxed">{error}</div>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-rose-400 hover:text-rose-700 transition"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Requester Identity Card */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-400">
              Requester Profile
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3.5 rounded-xl border border-ink-100 bg-ink-50/60 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-ink-600 shadow-sm ring-1 ring-ink-100">
                  <User size={16} />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-medium uppercase tracking-wider text-ink-400">
                    Logged In User
                  </span>
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {user?.name || user?.email || 'Authorized User'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-xl border border-ink-100 bg-ink-50/60 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-ink-600 shadow-sm ring-1 ring-ink-100">
                  <Building2 size={16} />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-medium uppercase tracking-wider text-ink-400">
                    Department / Branch
                  </span>
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {user?.branch || 'Headquarters'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Ticket Core Attributes */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-400">
              Request Details
            </h2>

            <div className="space-y-4">
              <Input
                id="subject"
                label="Subject Summary"
                required
                placeholder="Clear and concise statement of the problem"
                value={form.subject}
                onChange={update('subject')}
                className="w-full text-sm font-medium"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  id="category"
                  label="Category"
                  required
                  value={form.category}
                  onChange={update('category')}
                >
                  {CASE_CATEGORIES?.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>

                <Select
                  id="impact"
                  label="Priority & Severity"
                  required
                  value={form.impact}
                  onChange={update('impact')}
                >
                  {IMPACT_LEVELS?.map((level) => (
                    <option key={level} value={level}>
                      {level} Priority
                    </option>
                  ))}
                </Select>
              </div>

              <Textarea
                id="description"
                label="Problem Description"
                required
                rows={5}
                placeholder="Include steps to reproduce, expected vs actual behavior, and relevant error messages"
                value={form.description}
                onChange={update('description')}
                className="leading-relaxed"
              />
            </div>
          </section>

          {/* System Context Inputs */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-400">
                Technical Context
              </h2>
              <span className="text-[11px] text-ink-400">Optional</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="techEnvironment"
                label="Environment / OS / Build"
                placeholder="e.g. Windows 11, Chrome v124, Build 4.01"
                value={form.techEnvironment}
                onChange={update('techEnvironment')}
              />

              <Input
                id="frequency"
                label="Frequency of Recurrence"
                placeholder="e.g. Consistently reproducible, Intermittent"
                value={form.frequency}
                onChange={update('frequency')}
              />
            </div>
          </section>

          {/* Drag & Drop File Upload Area */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-400">
                Attachments
              </h2>
              <span className="text-[11px] text-ink-400">
                Up to {MAX_FILES} files (50 MB each)
              </span>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center transition ${
                isDragging
                  ? 'border-navy-600 bg-navy-50/50'
                  : 'border-ink-200 bg-ink-50/40 hover:border-navy-400 hover:bg-ink-50/80'
              }`}
            >
              <input
                ref={fileInputRef}
                id="attachments"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-ink-600 shadow-sm ring-1 ring-ink-200 transition group-hover:scale-105">
                <UploadCloud size={20} className="group-hover:text-navy-700 transition" />
              </div>
              <p className="mt-3 text-xs font-semibold text-ink-900">
                Click to browse files <span className="font-normal text-ink-500">or drop them here</span>
              </p>
              <p className="mt-1 text-[11px] text-ink-400">
                Accepts images, error stack trace logs, PDF reports, and archives
              </p>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-2">
                {files.map((file, idx) => (
                  <li
                    key={`${file.name}-${idx}`}
                    className="group flex items-center justify-between rounded-xl border border-ink-200 bg-white p-2.5 shadow-sm transition hover:border-ink-300"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
                        <FileText size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-ink-900">{file.name}</p>
                        <p className="text-[10px] text-ink-400">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(idx)
                      }}
                      className="rounded-lg p-1 text-ink-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Form Actions Footer */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-ink-100 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              loading={loading}
              className="w-full sm:w-auto min-w-[140px] shadow-sm"
            >
              Submit Ticket
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}