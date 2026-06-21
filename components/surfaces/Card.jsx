export function Card({ variant = 'default', title, subtitle, action, footer, dense = false, children, className, ...rest }) {
  const cls = ['bp-card', variant !== 'default' ? `bp-card--${variant}` : null, className].filter(Boolean).join(' ')
  const hasHeader = title || action
  return (
    <div className={cls} {...rest}>
      {hasHeader && (
        <header className="bp-card__header">
          {title && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 className="bp-card__title">{title}</h3>
              {subtitle && <div className="bp-card__subtitle">{subtitle}</div>}
            </div>
          )}
          {action && <div className="bp-card__action">{action}</div>}
        </header>
      )}
      <div className={['bp-card__body', dense ? 'bp-card__body--dense' : null].filter(Boolean).join(' ')}>{children}</div>
      {footer && <footer className="bp-card__footer">{footer}</footer>}
    </div>
  )
}
