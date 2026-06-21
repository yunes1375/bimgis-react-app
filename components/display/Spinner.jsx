export function Spinner({ size = 'md', label = 'Loading', className }) {
  const cls = ['bp-spinner', `bp-spinner--${size}`, className].filter(Boolean).join(' ')
  return <span className={cls} role="status" aria-label={label} />
}
