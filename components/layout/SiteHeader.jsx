export function SiteHeader({
  brand = 'BIM\u00b7GIS',
  brandMark = 'B',
  brandHref = '/',
  tag,
  nav,
  who,
  onMenuClick,
  className,
  children,
}) {
  return (
    <header className={['bp-topbar', className].filter(Boolean).join(' ')}>
      <a href={brandHref} className="bp-topbar__brand">
        <span className="bp-topbar__brand-mark">{brandMark}</span>
        <span>{brand}</span>
        {tag && <span className="bp-topbar__brand-tag">/ {tag}</span>}
      </a>
      {children}
      {nav && (
        <nav className="bp-topbar__nav" aria-label="Primary">
          {nav.map(l => (
            <a key={l.href} href={l.href} className="bp-topbar__link" aria-current={l.active ? 'page' : undefined}>
              {l.icon}{l.label}
            </a>
          ))}
          {who && (
            <a href={who.href ?? '/account'} className="bp-topbar__who">
              <span className="bp-topbar__who-avatar">{who.initials ?? who.name[0]?.toUpperCase()}</span>
              <span>{who.name}</span>
            </a>
          )}
        </nav>
      )}
      {onMenuClick && (
        <button type="button" className="bp-topbar__hamburger" aria-label="Open menu" onClick={onMenuClick}>{'\u2630'}</button>
      )}
    </header>
  )
}
