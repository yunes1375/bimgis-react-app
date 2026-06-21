import type { ButtonHTMLAttributes, ReactNode } from 'react'

/** Floating map control — blurred glass pill or circle, toggles on with active. */
export interface FabPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  shape?: 'pill' | 'circle'
  icon?: ReactNode
  children?: ReactNode
}
export declare function FabPill(props: FabPillProps): JSX.Element
