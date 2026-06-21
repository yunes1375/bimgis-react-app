const DEFAULT_ICON = { info: '\u2022', success: '\u2713', warn: '!', error: '\u00d7' }

export function Toast({ tone = 'info', title, description, action, onClose, className, icon }) {
  return (
    <div className={['bp-toast', `bp-toast--${tone}`, className].filter(Boolean).join(' ')} role="status">
      <span className="bp-toast__icon" aria-hidden>{icon ?? DEFAULT_ICON[tone]}</span>
      <div className="bp-toast__body">
        <div className="bp-toast__title">{title}</div>
        {description && <div className="bp-toast__desc">{description}</div>}
      </div>
      {action && (
        <button type="button" className="bp-toast__action" onClick={action.onClick}>{action.label}</button>
      )}
      {onClose && (
        <button type="button" className="bp-toast__close" aria-label="Dismiss" onClick={onClose}>{'\u00d7'}</button>
      )}
    </div>
  )
}

export function ToastStack({ children }) {
  return <div className="bp-toast-stack" role="region" aria-label="Notifications">{children}</div>
}
