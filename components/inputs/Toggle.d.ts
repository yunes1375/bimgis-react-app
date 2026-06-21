import type { InputHTMLAttributes, ReactNode } from 'react'

/** Switch-style boolean toggle with optional label + hint. */
export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  hint?: ReactNode
}
export declare function Toggle(props: ToggleProps): JSX.Element
