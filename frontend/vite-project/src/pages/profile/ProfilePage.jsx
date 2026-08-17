import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useAuth } from '../context/useAuth'

export default function ProfilePage() {
  const { user } = useAuth()
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 px-6 py-6 text-white sm:px-8">
          <p className="text-xs uppercase tracking-[0.18em] text-navy-200">Profile</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/10 font-display text-xl font-semibold ring-1 ring-white/10">
              {initials}
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">{user.name}</h2>
              <p className="mt-1 text-sm text-navy-200">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral" className="capitalize">{user.role}</Badge>
            <Badge tone="appreciation">Account suspended</Badge>
          </div>

          <dl className="mt-8 grid grid-cols-1 gap-5 border-t border-ink-200 pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Email</dt>
              <dd className="mt-1 text-sm text-ink-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Phone</dt>
              <dd className="mt-1 text-sm text-ink-900">{user.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Branch</dt>
              <dd className="mt-1 text-sm text-ink-900">{user.branch || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Position</dt>
              <dd className="mt-1 text-sm text-ink-900">{user.position || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Organization</dt>
              <dd className="mt-1 text-sm text-ink-900">{user.organizationId || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Department</dt>
              <dd className="mt-1 text-sm text-ink-900">{user.department || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Job title</dt>
              <dd className="mt-1 text-sm text-ink-900">{user.jobTitle || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Member since</dt>
              <dd className="mt-1 text-sm text-ink-900">{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="outline" as="a" href="mailto:support@moti.example">
              Contact support
            </Button>
            <Button variant="ghost" as="a" href="/cases">
              View requests
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
