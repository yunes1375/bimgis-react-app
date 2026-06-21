import type { ReactNode } from 'react'

/** Dashed-border placeholder for empty lists / no-results states. */
export interface EmptyStateProps {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}
export declare function EmptyState(props: EmptyStateProps): JSX.Element
