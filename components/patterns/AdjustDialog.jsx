import { useEffect } from 'react'

function fmt(r) { return r.format ? r.format(r.value) : `${r.value.toFixed(2)}${r.unit ?? ''}` }

export function AdjustDialog({ open, onClose, title = 'Adjust', rows = [], primaryAction, cancelLabel = 'Cancel', className }) {
  useEffect(() => {
    if (!open) return
    const onEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="bp-adj-overlay" onClick={onClose} role="presentation">
      <div className={['bp-adj', className].filter(Boolean).join(' ')} role="dialog" aria-modal="true" aria-labelledby="bp-adj-title" onClick={e => e.stopPropagation()}>
        <header className="bp-adj__head">
          <h3 id="bp-adj-title" className="bp-adj__title">{title}</h3>
          <button type="button" className="bp-adj__close" aria-label="Close" onClick={onClose}>{'\u00d7'}</button>
        </header>
        <div className="bp-adj__body">
          {rows.map(r => {
            const step = r.step ?? 1
            return (
              <div key={r.label} className="bp-adj__row">
                <span className="bp-adj__label">{r.label}</span>
                <span className="bp-adj__nudge">
                  <button type="button" className="bp-adj__nudge-btn" aria-label={`Decrease ${r.label}`} onClick={() => r.onChange(r.value - step)}>{'\u2212'}</button>
                  <span className="bp-adj__nudge-val">{fmt(r)}</span>
                  <button type="button" className="bp-adj__nudge-btn" aria-label={`Increase ${r.label}`} onClick={() => r.onChange(r.value + step)}>+</button>
                </span>
              </div>
            )
          })}
        </div>
        <footer className="bp-adj__foot">
          <button type="button" className="bp-btn bp-btn--md bp-btn--ghost" onClick={onClose}>{cancelLabel}</button>
          {primaryAction && (
            <button type="button" className="bp-btn bp-btn--md bp-btn--primary" onClick={primaryAction.onClick} disabled={primaryAction.disabled}>
              {primaryAction.label}
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
