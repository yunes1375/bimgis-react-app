import type { ReactNode } from 'react'

export interface TabItem {
  value: string
  label: ReactNode
  count?: number | string
  disabled?: boolean
  content?: ReactNode
}
/** Underline tabs with optional count badges. Controlled or uncontrolled. */
export interface TabsProps {
  items: TabItem[]
  value?: string
  defaultValue?: string
  onChange?: (next: string) => void
  className?: string
  ariaLabel?: string
}
export declare function Tabs(props: TabsProps): JSX.Element
