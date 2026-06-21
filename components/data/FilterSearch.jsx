export function FilterSearch({ value, onChange, placeholder = 'Search\u2026', count, onClear, filters, className }) {
  return (
    <div className={['bp-fs', className].filter(Boolean).join(' ')} role="search">
      <span className="bp-fs__icon" aria-hidden>{'\u2315'}</span>
      <input type="search" className="bp-fs__input" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      {filters}
      {count && (
        <span className="bp-fs__count"><strong>{count.matched}</strong> / {count.total}</span>
      )}
      {value && onClear && (
        <button type="button" className="bp-fs__clear" onClick={onClear}>Clear</button>
      )}
    </div>
  )
}
