function FieldWrapper({ label, error, hint, required, children, id }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-ink-700 tracking-wide">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink-500">{hint}</p>}
      {error && <p className="text-xs text-danger-600">{error}</p>}
    </div>
  )
}

const baseInputClass =
  'w-full appearance-none rounded-xl border border-ink-300 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition focus:border-navy-600 focus:ring-4 focus:ring-navy-600/10 disabled:bg-ink-100'

export function Input({
  label,
  error,
  hint,
  required,
  id,
  className = '',
  rightIcon,
  onRightIconClick,
  ...props
}) {
  return (
    <FieldWrapper
      label={label}
      error={error}
      hint={hint}
      required={required}
      id={id}
    >
      <div className="relative">
        <input
          id={id}
          className={`${baseInputClass} ${
            error ? 'border-danger-400' : ''
          } ${rightIcon ? 'pr-12' : ''} ${className}`}
          {...props}
        />

        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute inset-y-0 right-4 flex items-center text-ink-500 hover:text-ink-700"
          >
            {rightIcon}
          </button>
        )}
      </div>
    </FieldWrapper>
  )
}

export function Textarea({
  label,
  error,
  hint,
  required,
  id,
  className = '',
  ...props
}) {
  return (
    <FieldWrapper
      label={label}
      error={error}
      hint={hint}
      required={required}
      id={id}
    >
      <textarea
        id={id}
        rows={4}
        className={`${baseInputClass} resize-none ${
          error ? 'border-danger-400' : ''
        } ${className}`}
        {...props}
      />
    </FieldWrapper>
  )
}

export function Select({
  label,
  error,
  hint,
  required,
  id,
  className = '',
  children,
  ...props
}) {
  return (
    <FieldWrapper
      label={label}
      error={error}
      hint={hint}
      required={required}
      id={id}
    >
      <select
        id={id}
        className={`${baseInputClass} ${
          error ? 'border-danger-400' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  )
}
