function renderCell(col, row, i) {
  if (col.render) return col.render(row, i)
  const v = row[col.key]
  if (v === null || v === undefined) return <span style={{ color: 'var(--brand-faint)' }}>{'\u2014'}</span>
  return v
}

export function StackedCardTable({ columns = [], rows = [], rowKey, empty = 'No rows.', actions, className }) {
  if (rows.length === 0) {
    return <div className={['bp-sct__empty', className].filter(Boolean).join(' ')}>{empty}</div>
  }
  return (
    <ul className={['bp-sct', className].filter(Boolean).join(' ')} role="list">
      {rows.map((row, i) => (
        <li key={rowKey(row)} className="bp-sct__card">
          {columns.map(c => (
            <div key={c.key} className="bp-sct__row">
              <span className="bp-sct__label">{c.header}</span>
              <span className="bp-sct__value">{renderCell(c, row, i)}</span>
            </div>
          ))}
          {actions && <div className="bp-sct__actions">{actions(row)}</div>}
        </li>
      ))}
    </ul>
  )
}
