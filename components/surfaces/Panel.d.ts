import type { ReactNode, HTMLAttributes } from 'react'

/** Floating blurred panel for map overlays / inspectors. ghost = lighter fill. */
export interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  onClose?: () => void
  ghost?: boolean
  children?: ReactNode
}
export declare function Panel(props: PanelProps): JSX.Element
