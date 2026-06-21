const TREND_GLYPH = { up: '\u25b2', down: '\u25bc', flat: '\u2013' }

export function KpiTile({ label, value, tone = 'default', trend, className }) {
  const cls = ['bp-kpi', tone !== 'default' ? `bp-kpi--${tone}` : null, className].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      <div className="bp-kpi__label">{label}</div>
      <div className="bp-kpi__value">{value}</div>
      {trend && (
        <div className={['bp-kpi__trend', `bp-kpi__trend--${trend.dir}`].join(' ')}>
          {TREND_GLYPH[trend.dir]} {trend.text}
        </div>
      )}
    </div>
  )
}
