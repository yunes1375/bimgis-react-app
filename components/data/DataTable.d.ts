import type { ReactNode } from 'react'

export type ColumnAlign = 'start' | 'end' | 'center'
export type SortDir = 'asc' | 'desc'
export interface Column<T> {
  key: string
  header: ReactNode
  align?: ColumnAlign
  width?: string
  sortable?: boolean
  render?: (row: T, index: number) => ReactNode
}
/** Sticky-header data table with sortable columns, dense mode and a row-actions slot. */
export interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  caption?: ReactNode
  empty?: ReactNode
  dense?: boolean
  sortKey?: string
  sortDir?: SortDir
  onSort?: (key: string) => void
  actions?: (row: T) => ReactNode
  actionsHeader?: ReactNode
  className?: string
}
export declare function DataTable<T>(props: DataTableProps<T>): JSX.Element
