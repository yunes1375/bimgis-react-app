import type { ReactNode } from 'react'

export type KpiTone = 'default' | 'ok' | 'warn' | 'error' | 'empty'
export type KpiTrend = 'up' | 'down' | 'flat'

/** Compact mono metric tile with optional trend line. */
export interface KpiTileProps {
  label: string
  value: ReactNode
  tone?: KpiTone
  trend?: { dir: KpiTrend; text: string }
  className?: string
}
export declare function KpiTile(props: KpiTileProps): JSX.Element
