import type { ReactNode } from 'react'

export interface FooterLink { href: string; label: string }

/** Uppercase mono footer rail with brand, link list and a right slot. */
export interface FooterProps {
  brand?: ReactNode
  links?: FooterLink[]
  right?: ReactNode
  className?: string
}
export declare function Footer(props: FooterProps): JSX.Element
