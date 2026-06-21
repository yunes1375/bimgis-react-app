import { useId } from 'react'

export function Button({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  className,
  children,
  type = 'button',
  ...rest
}) {
  const cls = [
    'bp-btn',
    `bp-btn--${size}`,
    variant !== 'default' ? `bp-btn--${variant}` : null,
    fullWidth ? 'bp-btn--full' : null,
    className,
  ].filter(Boolean).join(' ')

  return (
    <button type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="bp-btn__spinner" aria-hidden /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
