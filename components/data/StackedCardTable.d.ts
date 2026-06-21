import type { ReactNode } from 'react'
import type { Column } from './DataTable'

/** Mobile-friendly label/value card list — the same columns as DataTable, stacked. */
export interface StackedCardTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  empty?: ReactNode
  actions?: (row: T) => ReactNode
  className?: string
}
export declare function StackedCardTable<T>(props: StackedCardTableProps<T>): JSX.Element
