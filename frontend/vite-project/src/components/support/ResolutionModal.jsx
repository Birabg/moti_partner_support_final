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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">Resolution summary</h3>
          <button onClick={onClose} aria-label="Close" className="text-ink-500 hover:text-ink-900">✕</button>
        </div>

        <p className="mt-2 text-sm text-gray-600">Explain how the problem was resolved so the customer can verify the fix.</p>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-4 h-36 w-full rounded-md border p-3 text-sm leading-relaxed"
          placeholder="Describe the resolution (what was changed, steps taken, verification)"
        />

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="accent" onClick={handleSubmit} loading={loading}>Submit resolution</Button>
        </div>
      </div>
    </div>
  )
}
