import { useId } from 'react'

export function Input({ label, hint, error, fullWidth, addonEnd, id, className, ...rest }) {
  const auto = useId()
  const inputId = id ?? `bp-input-${auto}`
  const helpId = error || hint ? `${inputId}-help` : undefined

  return (
    <label className={['bp-input-wrap', fullWidth ? 'bp-input-wrap--full' : null].filter(Boolean).join(' ')} htmlFor={inputId}>
      {label && <span className="bp-input-wrap__label">{label}</span>}
      <span className="bp-input-wrap__field">
        <input
          id={inputId}
          className={['bp-input', error ? 'bp-input--error' : null, className].filter(Boolean).join(' ')}
          aria-invalid={error ? true : undefined}
          aria-describedby={helpId}
          {...rest}
        />
        {addonEnd && <span className="bp-input__addon">{addonEnd}</span>}
      </span>
      {(error || hint) && (
        <span id={helpId} className={['bp-input-wrap__hint', error ? 'bp-input-wrap__hint--error' : null].filter(Boolean).join(' ')}>
          {error || hint}
        </span>
      )}
    </label>
  )
}
