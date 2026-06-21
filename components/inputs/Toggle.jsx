import { useId } from 'react'

export function Toggle({ label, hint, id, disabled, className, ...rest }) {
  const auto = useId()
  const inputId = id ?? `bp-toggle-${auto}`
  return (
    <label htmlFor={inputId} className={['bp-toggle', disabled ? 'bp-toggle--disabled' : null, className].filter(Boolean).join(' ')}>
      <input type="checkbox" id={inputId} className="bp-toggle__input" role="switch" disabled={disabled} {...rest} />
      <span className="bp-toggle__track"><span className="bp-toggle__thumb" /></span>
      {(label || hint) && (
        <span className="bp-toggle__text">
          {label && <span className="bp-toggle__label">{label}</span>}
          {hint && <span className="bp-toggle__hint">{hint}</span>}
        </span>
      )}
    </label>
  )
}
