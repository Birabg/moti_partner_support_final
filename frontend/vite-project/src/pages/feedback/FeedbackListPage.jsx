import { useEffect, useState } from 'react'
import { MessageSquareHeart, Star } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Rating from '../../components/ui/Rating'
import EmptyState from '../../components/ui/EmptyState'
import { useAuth } from '../../context/useAuth'
import { feedbackService } from '../../lib/services/feedbackService'
import { caseService } from '../../lib/services/caseService'

export default function FeedbackListPage() {
  const { user } = useAuth()
  const isStaff = ['agent', 'manager', 'admin'].includes(user.role)
  const [items, setItems] = useState([])
  const [casesById, setCasesById] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const [feedback, cases] = await Promise.all([
        feedbackService.list(isStaff ? {} : { customerId: user.id }),
        caseService.list(),
      ])
      if (!active) return
      setItems(feedback)
      setCasesById(Object.fromEntries(cases.map((c) => [c.id, c])))
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [user.id, isStaff])

  if (loading) return <p className="text-sm text-ink-500">Loading feedback…</p>

  if (items.length === 0) {
    return (
      <Card className="p-5">
        <EmptyState
          icon={MessageSquareHeart}
          title="No feedback yet"
          description={
            isStaff
              ? 'Customer feedback will appear here once cases are resolved and rated.'
              : 'Feedback you submit after a case is resolved will appear here.'
          }
        />
      </Card>
    )
  }

  const average = items.reduce((sum, item) => sum + item.overall, 0) / items.length

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 p-6 text-white shadow-[0_24px_60px_rgba(7,27,48,0.18)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge tone="neutral" className="bg-white/10 text-white ring-1 ring-white/10">Feedback</Badge>
            <h2 className="mt-4 font-display text-3xl font-semibold">Customer ratings and comments</h2>
            <p className="mt-3 max-w-2xl text-sm text-navy-200 sm:text-base">
              Review what customers said after cases were resolved and spot patterns in service quality.
            </p>
          </div>
          <div className="rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/10">
            <p className="text-xs uppercase tracking-[0.18em] text-navy-200">Average score</p>
            <div className="mt-2 flex items-center gap-2">
              <Star size={18} className="fill-gold-400 text-gold-400" />
              <p className="font-display text-2xl font-semibold">{average.toFixed(1)}/5</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((f) => {
          const c = casesById[f.caseId]
          return (
            <Card key={f.id} className="p-5 transition-shadow hover:shadow-[0_18px_45px_rgba(16,24,40,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-ink-500">{c?.ticketNo || f.caseId}</p>
                  <p className="mt-0.5 text-sm font-medium text-ink-900">{c?.subject || 'Case'}</p>
                </div>
                <Badge tone={f.type}>{f.type}</Badge>
              </div>
              <div className="mt-4 rounded-lg bg-ink-50 p-3">
                <Rating label="Overall" value={f.overall} readOnly />
              </div>
              {f.comment && <p className="mt-3 text-sm leading-relaxed text-ink-700">{f.comment}</p>}
              <p className="mt-3 text-xs text-ink-400">{new Date(f.submittedAt).toLocaleString()}</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
