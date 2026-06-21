function cell(col, row, i) {
  if (col.render) return col.render(row, i)
  const v = row[col.key]
  if (v === null || v === undefined) return <span style={{ color: 'var(--brand-faint)' }}>{'\u2014'}</span>
  return v
}

export function DataTable({
  columns = [],
  rows = [],
  rowKey,
  caption,
  empty = 'No rows.',
  dense = false,
  sortKey,
  sortDir,
  onSort,
  actions,
  actionsHeader = '',
  className,
}) {
  return (
    <div className={['bp-table-wrap', className].filter(Boolean).join(' ')}>
      <div className="bp-table-scroll">
        <table className={['bp-table', dense ? 'bp-table--dense' : null].filter(Boolean).join(' ')}>
          {caption && <caption>{caption}</caption>}
          <thead>
            <tr>
              {columns.map(c => {
                const isActive = sortKey === c.key
                return (
                  <th
                    key={c.key}
                    style={{ width: c.width }}
                    scope="col"
                    className={[c.align ? `bp-table__th--${c.align}` : null, c.sortable ? 'bp-table__th--sortable' : null].filter(Boolean).join(' ')}
                    onClick={c.sortable && onSort ? () => onSort(c.key) : undefined}
                    aria-sort={isActive ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {c.header}
                    {c.sortable && (
                      <span className={['bp-table__sort', isActive ? 'bp-table__sort--active' : null].filter(Boolean).join(' ')}>
                        {isActive ? (sortDir === 'asc' ? '\u25b2' : '\u25bc') : '\u2195'}
                      </span>
                    )}
                  </th>
                )
              })}
              {actions && <th scope="col" className="bp-table__th--end">{actionsHeader}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="bp-table__empty">{empty}</td></tr>
            ) : (
              rows.map((row, i) => (
                <tr key={rowKey(row)}>
                  {columns.map(c => (
                    <td key={c.key} className={c.align ? `bp-table__td--${c.align}` : undefined}>{cell(c, row, i)}</td>
                  ))}
                  {actions && <td className="bp-table__td--end"><span className="bp-table__actions">{actions(row)}</span></td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
