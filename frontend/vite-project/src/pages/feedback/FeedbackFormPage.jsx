import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Rating from '../../components/ui/Rating'
import { Select, Textarea } from '../../components/ui/Field'
import { useAuth } from '../../context/useAuth'
import { caseService } from '../../lib/services/caseService'
import { feedbackService, FEEDBACK_TYPES } from '../../lib/services/feedbackService'

const ratingFields = [
  { key: 'overall', label: 'Overall service quality' },
  { key: 'responseTime', label: 'Response time' },
  { key: 'resolutionEffectiveness', label: 'Resolution effectiveness' },
  { key: 'professionalism', label: 'Support team professionalism' },
  { key: 'experience', label: 'Overall user experience' },
]

export default function FeedbackFormPage() {
  const { caseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [caseItem, setCaseItem] = useState(null)
  const [ratings, setRatings] = useState({
    overall: 0,
    responseTime: 0,
    resolutionEffectiveness: 0,
    professionalism: 0,
    experience: 0,
  })
  const [type, setType] = useState('appreciation')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    caseService.get(caseId).then(setCaseItem).catch(() => setCaseItem(null))
  }, [caseId])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (Object.values(ratings).some((v) => v === 0)) {
      setError('Please rate every category before submitting.')
      return
    }
    setLoading(true)
    try {
      await feedbackService.submit({
        caseId,
        customerId: user.id,
        type,
        comment,
        ...ratings,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <CheckCircle2 className="text-navy-500" size={44} />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900">Feedback submitted</h2>
            <p className="mt-1 text-sm text-ink-500">
              Thank you — your feedback has been recorded and helps us improve our service.
            </p>
          </div>
          <Button as={Link} to="/cases" variant="accent">
            Back to requests
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-ink-900">Rate your support experience</h2>
        {caseItem && (
          <p className="mt-1 text-sm text-ink-500">
            For case <span className="font-mono">{caseItem.ticketNo}</span> — {caseItem.subject}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && (
            <p className="rounded-lg bg-danger-100 px-3.5 py-2.5 text-sm text-danger-600">{error}</p>
          )}

          <div className="divide-y divide-ink-200 rounded-xl border border-ink-200 px-4">
            {ratingFields.map(({ key, label }) => (
              <Rating
                key={key}
                label={label}
                value={ratings[key]}
                onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
              />
            ))}
          </div>

          <Select id="type" label="Feedback type" value={type} onChange={(e) => setType(e.target.value)}>
            {FEEDBACK_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </Select>

          <Textarea
            id="comment"
            label="Comments or suggestions"
            placeholder="Tell us more about your experience (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" loading={loading}>
              Submit feedback
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

