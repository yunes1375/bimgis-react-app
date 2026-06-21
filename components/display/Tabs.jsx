import { useId, useState } from 'react'

export function Tabs({ items = [], value, defaultValue, onChange, className, ariaLabel = 'Tabs' }) {
  const auto = useId()
  const [inner, setInner] = useState(defaultValue ?? items[0]?.value)
  const current = value ?? inner
  const setCurrent = (v) => {
    if (value === undefined) setInner(v)
    onChange?.(v)
  }
  const active = items.find(t => t.value === current)

  return (
    <div className={className}>
      <div className="bp-tabs" role="tablist" aria-label={ariaLabel}>
        {items.map(t => {
          const id = `${auto}-${t.value}`
          const selected = current === t.value
          return (
            <button
              key={t.value}
              role="tab"
              id={`${id}-tab`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              className="bp-tabs__btn"
              disabled={t.disabled}
              onClick={() => setCurrent(t.value)}
              tabIndex={selected ? 0 : -1}
            >
              {t.label}
              {t.count !== undefined && <span className="bp-tabs__count">{t.count}</span>}
            </button>
          )
        })}
      </div>
      {active?.content !== undefined && (
        <div role="tabpanel" id={`${auto}-${active.value}-panel`} aria-labelledby={`${auto}-${active.value}-tab`} className="bp-tabs__panel">
          {active.content}
        </div>
      )}
    </div>
  )
}
