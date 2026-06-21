import type { ReactNode } from 'react'

export type PillTone = 'neutral' | 'bim' | 'gis' | 'ok' | 'warn' | 'error'

/** Uppercase mono status chip. Use 'bim'/'gis' to tag domain, status tones for state. */
export interface PillProps {
  tone?: PillTone
  dot?: boolean
  children: ReactNode
  className?: string
  title?: string
}
export declare function Pill(props: PillProps): JSX.Element
