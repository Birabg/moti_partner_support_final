export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-ink-300 bg-ink-50/60 px-6 py-16 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-100 text-navy-700">
          <Icon size={22} strokeWidth={1.75} />
        </div>
      )}
      <div>
        <p className="font-display text-base font-semibold text-ink-900">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}
