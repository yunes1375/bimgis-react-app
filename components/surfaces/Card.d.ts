import type { ReactNode, HTMLAttributes } from 'react'

export type CardVariant = 'default' | 'raised' | 'accent'

/**
 * Surface container with optional header (title/subtitle/action) and footer.
 * 'accent' draws the teal→orange BIM·GIS hairline across the top.
 * @startingPoint section="Surfaces" subtitle="Card — default, raised, accent" viewport="700x150"
 */
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: CardVariant
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  footer?: ReactNode
  dense?: boolean
  children?: ReactNode
}
export declare function Card(props: CardProps): JSX.Element
