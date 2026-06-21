import { useEffect, useRef, useState } from 'react'

export function BasemapPicker({ value, onChange, options = [], ariaLabel = 'Choose basemap', className }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onOutside = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  return (
    <div ref={rootRef} className={['bp-bmpicker', className].filter(Boolean).join(' ')}>
      <button type="button" className="bp-bmpicker__trigger" aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel} onClick={() => setOpen(v => !v)}>
        {'\u25f0'}
      </button>
      {open && (
        <div className="bp-bmpicker__menu" role="listbox">
          {options.map(o => {
            const active = o.id === value
            const swatchStyle = o.swatchImage ? { backgroundImage: `url(${o.swatchImage})` } : { background: o.swatchColor ?? 'var(--brand-surface-2)' }
            return (
              <button
                key={o.id}
                type="button"
                role="option"
                aria-selected={active}
                className={['bp-bmpicker__opt', active ? 'bp-bmpicker__opt--active' : null].filter(Boolean).join(' ')}
                onClick={() => { onChange(o.id); setOpen(false) }}
              >
                <span className="bp-bmpicker__swatch" style={swatchStyle} aria-hidden />
                {o.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
