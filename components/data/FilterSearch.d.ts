import type { ReactNode } from 'react'

/** Search bar with magnifier, matched/total counter, inline filter slot and clear. */
export interface FilterSearchProps {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  count?: { matched: number; total: number }
  onClear?: () => void
  filters?: ReactNode
  className?: string
}
export declare function FilterSearch(props: FilterSearchProps): JSX.Element
