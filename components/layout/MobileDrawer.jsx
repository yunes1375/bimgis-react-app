export function MobileDrawer({ open, onClose, title, side = 'left', children, closeLabel = 'Close menu' }) {
  return (
    <>
      <div
        className={['bp-mdrawer-overlay', open ? 'bp-mdrawer-overlay--open' : null].filter(Boolean).join(' ')}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={['bp-mdrawer', side === 'right' ? 'bp-mdrawer--right' : null, open ? 'bp-mdrawer--open' : null].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="bp-mdrawer__head">
          <span className="bp-mdrawer__head-title">{title ?? 'Menu'}</span>
          <button type="button" className="bp-mdrawer__close" onClick={onClose} aria-label={closeLabel}>{'\u00d7'}</button>
        </div>
        <div className="bp-mdrawer__body">{children}</div>
      </aside>
    </>
  )
}
