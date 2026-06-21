export function Panel({ title, onClose, ghost = false, children, className, ...rest }) {
  const cls = ['bp-panel', ghost ? 'bp-panel--ghost' : null, className].filter(Boolean).join(' ')
  return (
    <div className={cls} {...rest}>
      {(title || onClose) && (
        <div className="bp-panel__head">
          {title && <h4 className="bp-panel__title">{title}</h4>}
          {onClose && <button className="bp-panel__close" onClick={onClose} aria-label="Close">{'\u00d7'}</button>}
        </div>
      )}
      <div className="bp-panel__body">{children}</div>
    </div>
  )
}
