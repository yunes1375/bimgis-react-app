export function Footer({ brand = 'BIM\u00b7GIS \u00b7 2026', links = [], right, className }) {
  return (
    <footer className={['bp-footer', className].filter(Boolean).join(' ')}>
      <span className="bp-footer__brand">{brand}</span>
      {links.map(l => (<a key={l.href} href={l.href}>{l.label}</a>))}
      <span className="bp-footer__sep" />
      {right}
    </footer>
  )
}
