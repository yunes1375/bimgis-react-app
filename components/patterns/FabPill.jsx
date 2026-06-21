export function FabPill({ active = false, shape = 'pill', icon, children, className, type = 'button', ...rest }) {
  const cls = ['bp-fab', active ? 'bp-fab--on' : null, shape === 'circle' ? 'bp-fab--circle' : null, className].filter(Boolean).join(' ')
  return (
    <button type={type} className={cls} aria-pressed={active} {...rest}>
      {icon && <span className="bp-fab__icon" aria-hidden>{icon}</span>}
      {children}
    </button>
  )
}
