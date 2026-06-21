import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Primary action control. Teal "primary" for the main commit action,
 * "danger" for destructive, "ghost" for low-emphasis / cancel.
 * @startingPoint section="Inputs" subtitle="Buttons — every variant & size" viewport="700x150"
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children?: ReactNode
}
export declare function Button(props: ButtonProps): JSX.Element
