import { useState } from 'react'
import Button from '../ui/Button'

export default function ResolutionModal({ onClose, onSubmit, initial = '' }) {
  const [value, setValue] = useState(initial || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!value || value.trim().length < 10) {
      setError('Please provide a detailed resolution summary (minimum 10 characters).')
      return
    }
    try {
      setLoading(true)
      await onSubmit(value.trim())
    } catch (err) {
      setError(err?.message || 'Failed to submit resolution')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1b33]/60 backdrop-blur-sm">
      <div className="w-full max-w-lg transform rounded-2xl bg-white p-8 shadow-[0_20px_60px_rgba(11,27,51,0.2)]">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-ink-900">Resolution summary</h3>
          <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-400 transition hover:bg-ink-100 hover:text-ink-600">✕</button>
        </div>

        <p className="mt-2 text-sm text-ink-500">Explain how the problem was resolved so the customer can verify the fix.</p>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-4 h-36 w-full rounded-xl border border-ink-300 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 transition hover:border-ink-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
          placeholder="Describe the resolution (what was changed, steps taken, verification)"
        />

        {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="accent" onClick={handleSubmit} loading={loading}>Submit resolution</Button>
        </div>
      </div>
    </div>
  )
}






