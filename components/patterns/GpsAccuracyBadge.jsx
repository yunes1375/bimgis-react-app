export function deriveGpsLevel(m) {
  if (m == null || Number.isNaN(m)) return 'none'
  if (m <= 8) return 'good'
  if (m <= 25) return 'fair'
  return 'poor'
}

const LABEL = { good: 'GPS', fair: 'GPS', poor: 'GPS', none: 'NO GPS' }

export function GpsAccuracyBadge({ accuracy, level, className, hideValue = false }) {
  const lvl = level ?? deriveGpsLevel(accuracy)
  return (
    <div className={['bp-gps', `bp-gps--${lvl}`, className].filter(Boolean).join(' ')} role="status">
      <span className="bp-gps__bars" aria-hidden>
        <span className="bp-gps__bar" /><span className="bp-gps__bar" /><span className="bp-gps__bar" />
      </span>
      <span>{LABEL[lvl]}</span>
      {!hideValue && lvl !== 'none' && accuracy != null && (
        <span className="bp-gps__value">{'\u00b1'}{accuracy.toFixed(0)} m</span>
      )}
    </div>
  )
}
