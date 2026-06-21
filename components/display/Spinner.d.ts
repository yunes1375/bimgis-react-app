/** Teal ring spinner. Inherits currentColor, so set color to recolor. */
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}
export declare function Spinner(props: SpinnerProps): JSX.Element
