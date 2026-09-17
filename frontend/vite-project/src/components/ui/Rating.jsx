import { Star } from 'lucide-react'

export default function Rating({ label, value, onChange, readOnly = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      {label && <span className="text-sm text-ink-700">{label}</span>}
      <div className="flex items-center gap-1" role={readOnly ? undefined : 'radiogroup'} aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onChange?.(star)}
            className={`transition ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            <Star
              size={20}
              className={star <= value ? 'fill-gold-500 text-gold-500' : 'fill-transparent text-ink-300'}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

