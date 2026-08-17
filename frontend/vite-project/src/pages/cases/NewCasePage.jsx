import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ClipboardList, UploadCloud } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Field'
import { useAuth } from '../../context/useAuth'
import { caseService, CASE_CATEGORIES, IMPACT_LEVELS } from '../../lib/services/caseService'

const initialForm = {
  subject: '',
  category: CASE_CATEGORIES[0],
  description: '',
  techEnvironment: '',
  frequency: '',
  impact: 'Medium',
}

export default function NewCasePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  function handleFiles(e) {
    const selected = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...selected].slice(0, 5))
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.subject.trim() || !form.description.trim()) {
      setError('Please fill in the subject and problem description.')
      return
    }
    setLoading(true)
    try {
      const newCase = await caseService.create(
        {
          ...form,
          customerId: user.id,
          branch: user.branch,
          attachments: files.map((f) => f.name),
        },
        user.name
      )
      navigate(`/cases/${newCase.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 px-6 py-6 text-white sm:px-8">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Submit a support request</h2>
              <p className="mt-1 text-sm text-navy-200">
                Provide enough detail for the support team to triage, route, and resolve the issue faster.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && (
            <p className="rounded-lg bg-danger-100 px-3.5 py-2.5 text-sm text-danger-600">{error}</p>
          )}

          <div className="grid grid-cols-1 gap-4 rounded-lg border border-ink-200 bg-ink-50 p-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Customer</p>
              <p className="mt-0.5 text-sm text-ink-900">{user.name}</p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Branch</p>
              <p className="mt-0.5 text-sm text-ink-900">{user.branch || '—'}</p>
            </div>
          </div>

          <Input
            id="subject"
            label="Subject"
            required
            placeholder="Brief summary of the issue"
            value={form.subject}
            onChange={update('subject')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select id="category" label="Product category" required value={form.category} onChange={update('category')}>
              {CASE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select id="impact" label="Impact level" required value={form.impact} onChange={update('impact')}>
              {IMPACT_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            id="description"
            label="Detailed problem description"
            required
            placeholder="Describe what happened, what you expected, and any error messages"
            value={form.description}
            onChange={update('description')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="techEnvironment"
              label="Technical environment"
              placeholder="e.g. Windows 11, Core Banking v4.2"
              value={form.techEnvironment}
              onChange={update('techEnvironment')}
            />
            <Input
              id="frequency"
              label="Frequency of occurrence"
              placeholder="e.g. Daily, Once, Always"
              value={form.frequency}
              onChange={update('frequency')}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink-700">Supporting attachments</label>
            <label
              htmlFor="attachments"
              className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ink-300 bg-ink-50 px-4 py-8 text-sm text-ink-500 transition hover:bg-ink-100"
            >
              <UploadCloud size={18} />
              <span className="font-medium text-ink-700">Click to attach screenshots or files</span>
              <span className="text-xs text-ink-500">Maximum 5 files, use images or PDFs for faster triage</span>
            </label>
            <input id="attachments" type="file" multiple className="hidden" onChange={handleFiles} />
            {files.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-700"
                  >
                    <span className="truncate">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-ink-400 hover:text-danger-600">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" loading={loading}>
              Submit request
            </Button>
          </div>
        </form>
        </div>
      </Card>
    </div>
  )
}
