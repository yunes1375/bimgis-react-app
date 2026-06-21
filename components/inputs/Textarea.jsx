import { useId } from 'react'

export function Textarea({ label, hint, error, fullWidth, mono, id, className, ...rest }) {
  const auto = useId()
  const taId = id ?? `bp-ta-${auto}`
  const helpId = error || hint ? `${taId}-help` : undefined

  return (
    <label className={['bp-input-wrap', fullWidth ? 'bp-input-wrap--full' : null].filter(Boolean).join(' ')} htmlFor={taId}>
      {label && <span className="bp-input-wrap__label">{label}</span>}
      <textarea
        id={taId}
        className={['bp-textarea', mono ? 'bp-textarea--mono' : null, error ? 'bp-textarea--error' : null, className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={helpId}
        {...rest}
      />
      {(error || hint) && (
        <span id={helpId} className={['bp-input-wrap__hint', error ? 'bp-input-wrap__hint--error' : null].filter(Boolean).join(' ')}>
          {error || hint}
        </span>
      )}
    </label>
  )
}
