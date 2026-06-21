export function Pill({ tone = 'neutral', dot = false, children, className, title }) {
  const cls = ['bp-pill', `bp-pill--${tone}`, className].filter(Boolean).join(' ')
  return (
    <span className={cls} title={title}>
      {dot && <span className="bp-pill__dot" aria-hidden />}
      {children}
    </span>
  )
}
