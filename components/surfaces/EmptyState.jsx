export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={['bp-empty', className].filter(Boolean).join(' ')}>
      {icon && <div className="bp-empty__icon" aria-hidden>{icon}</div>}
      <h3 className="bp-empty__title">{title}</h3>
      {description && <p className="bp-empty__desc">{description}</p>}
      {action && <div className="bp-empty__action">{action}</div>}
    </div>
  )
}
