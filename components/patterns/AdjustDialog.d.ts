import type { ReactNode } from 'react'

export interface AdjustRow {
  label: string
  value: number
  step?: number
  unit?: string
  format?: (n: number) => string
  onChange: (next: number) => void
}
/** Modal of −/value/+ nudge rows — used to fine-tune BIM↔GIS alignment offsets. */
export interface AdjustDialogProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  rows: AdjustRow[]
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean }
  cancelLabel?: string
  className?: string
}
export declare function AdjustDialog(props: AdjustDialogProps): JSX.Element
