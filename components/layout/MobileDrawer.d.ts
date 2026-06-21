import type { ReactNode } from 'react'

/** Off-canvas navigation drawer with scrim. Slides from left or right. */
export interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  side?: 'left' | 'right'
  children: ReactNode
  closeLabel?: string
}
export declare function MobileDrawer(props: MobileDrawerProps): JSX.Element
