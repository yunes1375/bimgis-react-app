import type { InputHTMLAttributes, ReactNode } from 'react'

/** Labelled text field with optional hint, error and end-addon slot. */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  fullWidth?: boolean
  addonEnd?: ReactNode
}
export declare function Input(props: InputProps): JSX.Element
