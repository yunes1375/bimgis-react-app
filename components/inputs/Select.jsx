import { useId } from 'react'

export function Select({ label, hint, error, fullWidth, options = [], placeholder, id, className, ...rest }) {
  const auto = useId()
  const selectId = id ?? `bp-select-${auto}`
  const helpId = error || hint ? `${selectId}-help` : undefined

  return (
    <label className={['bp-input-wrap', fullWidth ? 'bp-input-wrap--full' : null].filter(Boolean).join(' ')} htmlFor={selectId}>
      {label && <span className="bp-input-wrap__label">{label}</span>}
      <span className="bp-input-wrap__field">
        <select
          id={selectId}
          className={['bp-select', error ? 'bp-select--error' : null, className].filter(Boolean).join(' ')}
          aria-invalid={error ? true : undefined}
          aria-describedby={helpId}
          {...rest}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>
      </span>
      {(error || hint) && (
        <span id={helpId} className={['bp-input-wrap__hint', error ? 'bp-input-wrap__hint--error' : null].filter(Boolean).join(' ')}>
          {error || hint}
        </span>
      )}
    </label>
  )
}
