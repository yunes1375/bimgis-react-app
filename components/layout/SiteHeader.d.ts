import type { ReactNode } from 'react'

export interface SiteHeaderNavLink { href: string; label: string; active?: boolean; icon?: ReactNode }

/** Sticky top bar: gradient-mark brand, primary nav, account chip, mobile hamburger. */
export interface SiteHeaderProps {
  brand?: ReactNode
  brandMark?: ReactNode
  brandHref?: string
  tag?: string
  nav?: SiteHeaderNavLink[]
  who?: { name: string; initials?: string; href?: string }
  onMenuClick?: () => void
  className?: string
  children?: ReactNode
}
export declare function SiteHeader(props: SiteHeaderProps): JSX.Element
