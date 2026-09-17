import { useEffect, useMemo, useState } from 'react'
import { Users2, ShieldCheck, ArrowRightLeft, BadgeCheck } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/useAuth'
import { authService } from '../../lib/services/authService'

const DEPARTMENTS = [
  'Support Operations',
  'Customer Success',
  'Technical Escalations',
  'Reporting & Analytics',
  'Platform Administration',
]

const ROLE_OPTIONS = [
  { value: 'agent', label: 'Support Agent' },
  { value: 'manager', label: 'Manager' },
]

export default function StaffOnboardingPage() {
  const { user } = useAuth()
  const [staffDirectory, setStaffDirectory] = useState([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    jobTitle: '',
    role: 'agent',
    reportsToId: '',
    isPSsupport: true,
    isAdmin: false,
    password: 'Staff@123',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true
    authService
      .listStaff()
      .then((staff) => {
        if (!active) return
        setStaffDirectory(staff)
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        setError(err.message)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const managers = useMemo(
    () => staffDirectory.filter((staff) => staff.role === 'manager' || staff.role === 'admin'),
    [staffDirectory],
  )

  function update(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      setForm((prev) => ({ ...prev, [field]: value }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name.trim() || !form.email.trim() || !form.department || !form.jobTitle.trim()) {
      setError('Please complete the required staff details.')
      return
    }

    if (form.role === 'agent' && !form.reportsToId) {
      setError('Choose the manager this staff member reports to.')
      return
    }

    setSaving(true)
    try {
      const created = await authService.createStaff(form, user.id)
      setStaffDirectory((prev) => [...prev, created])
      setSuccess(`${created.name} has been added as a ${created.role}.`)
      setForm({
        name: '',
        email: '',
        phone: '',
        department: '',
        jobTitle: '',
        role: 'agent',
        reportsToId: '',
        isPSsupport: true,
        isAdmin: false,
        password: 'Staff@123',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const staffCount = staffDirectory.filter((staff) => ['agent', 'manager'].includes(staff.role)).length

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Card className="overflow-hidden border-0 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 p-6 text-white shadow-[0_24px_60px_rgba(7,27,48,0.18)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Badge tone="neutral" className="bg-white/10 text-white ring-1 ring-white/10">Admin only</Badge>
              <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Staff onboarding and hierarchy</h2>
              <p className="mt-3 max-w-2xl text-sm text-navy-200 sm:text-base">
                Create staff accounts, assign departments, and place each person in the support hierarchy as an agent or manager.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[20rem] lg:grid-cols-1">
              <div className="rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.18em] text-navy-200">Staff accounts</p>
                <p className="mt-2 font-display text-2xl font-semibold">{staffCount}</p>
              </div>
              <div className="rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.18em] text-navy-200">Hierarchy</p>
                <p className="mt-2 font-display text-2xl font-semibold">Admin → Manager → Agent</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          {error && <p className="rounded-lg bg-danger-100 px-3.5 py-2.5 text-sm text-danger-600">{error}</p>}
          {success && <p className="rounded-lg bg-success-100 px-3.5 py-2.5 text-sm text-success-600">{success}</p>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full name" id="staff-name" required value={form.name} onChange={update('name')} placeholder="Alemu Tesfaye" />
              <Input label="Work email" id="staff-email" type="email" required value={form.email} onChange={update('email')} placeholder="[email protected]" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Phone number" id="staff-phone" value={form.phone} onChange={update('phone')} placeholder="+251 9xx xxx xxx" />
              <Select label="Department" id="staff-department" required value={form.department} onChange={update('department')}>
                <option value="">Select a department</option>
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Job title" id="staff-job-title" required value={form.jobTitle} onChange={update('jobTitle')} placeholder="Branch support lead" />
              <Select label="Role" id="staff-role" required value={form.role} onChange={update('role')}>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </Select>
            </div>

            {form.role === 'agent' && (
              <Select label="Reports to" id="staff-manager" required value={form.reportsToId} onChange={update('reportsToId')}>
                <option value="">Select a manager</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>{manager.name} · {manager.jobTitle || manager.role}</option>
                ))}
              </Select>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="flex items-start gap-3 rounded-lg border border-ink-200 bg-ink-50 px-4 py-3">
                <input type="checkbox" checked={form.isPSsupport} onChange={update('isPSsupport')} className="mt-1 h-4 w-4 rounded border-ink-300 text-navy-800 focus:ring-navy-800" />
                <span>
                  <span className="block text-sm font-medium text-ink-900">PS support</span>
                  <span className="block text-xs text-ink-500">Enable product support access</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-ink-200 bg-ink-50 px-4 py-3">
                <input type="checkbox" checked={form.isAdmin} onChange={update('isAdmin')} className="mt-1 h-4 w-4 rounded border-ink-300 text-navy-800 focus:ring-navy-800" />
                <span>
                  <span className="block text-sm font-medium text-ink-900">Admin access</span>
                  <span className="block text-xs text-ink-500">Grant admin-level permissions</span>
                </span>
              </label>
              <div className="rounded-lg border border-dashed border-ink-300 bg-white px-4 py-3 text-xs text-ink-500">
                Password defaults to <span className="font-mono text-ink-700">Staff@123</span> for this mock frontend.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-navy-50 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-navy-700">Hierarchy preview</p>
                <div className="mt-3 space-y-2 text-sm text-ink-700">
                  <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-navy-800" /> Admin creates and supervises accounts</div>
                  <div className="flex items-center gap-2"><Users2 size={16} className="text-navy-600" /> Manager oversees agents and case queues</div>
                  <div className="flex items-center gap-2"><ArrowRightLeft size={16} className="text-gold-600" /> Agent reports to a manager and works assigned cases</div>
                </div>
              </div>
              <div className="rounded-lg bg-ink-50 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Current staff roles</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {managers.slice(0, 4).map((manager) => (
                    <Badge key={manager.id} tone="neutral">{manager.name}</Badge>
                  ))}
                  {!loading && managers.length === 0 && <p className="text-sm text-ink-500">No managers found yet.</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setForm((prev) => ({ ...prev, reportsToId: '', name: '', email: '', phone: '', department: '', jobTitle: '' }))}>
                Clear
              </Button>
              <Button type="submit" variant="primary" loading={saving}>
                <BadgeCheck size={16} /> Create staff account
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Users2 size={16} className="text-navy-800" />
            <h3 className="font-display text-base font-semibold text-ink-900">Staff directory</h3>
          </div>
          <div className="mt-4 space-y-3">
            {loading && <p className="text-sm text-ink-500">Loading staff…</p>}
            {!loading && staffDirectory.length === 0 && <p className="text-sm text-ink-500">No staff accounts yet.</p>}
            {staffDirectory.map((staff) => (
              <div key={staff.id} className="rounded-lg border border-ink-200 bg-white px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{staff.name}</p>
                    <p className="text-xs text-ink-500">{staff.jobTitle || staff.role} · {staff.department || 'No department'}</p>
                  </div>
                  <Badge tone={staff.role === 'manager' ? 'appreciation' : 'neutral'}>{staff.role}</Badge>
                </div>
                <p className="mt-2 text-xs text-ink-500">{staff.email}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-base font-semibold text-ink-900">How hierarchy works</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Use managers to supervise agents by department. Agents should always have a reporting manager, while managers can be created with broader permissions and department ownership.
          </p>
          <div className="mt-4 rounded-lg bg-ink-50 p-4 text-sm text-ink-700">
            Admin account: {user.name}
          </div>
        </Card>
      </div>
    </div>
  )
}
