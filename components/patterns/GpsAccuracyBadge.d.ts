export type GpsLevel = 'good' | 'fair' | 'poor' | 'none'

/** Field-survey GPS quality badge: signal bars + metre reading, auto-coloured by accuracy. */
export interface GpsAccuracyBadgeProps {
  accuracy?: number | null
  level?: GpsLevel
  className?: string
  hideValue?: boolean
}
export declare function GpsAccuracyBadge(props: GpsAccuracyBadgeProps): JSX.Element
export declare function deriveGpsLevel(m?: number | null): GpsLevel
