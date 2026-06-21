import type { SelectHTMLAttributes } from 'react'

export interface SelectOption { value: string; label: string; disabled?: boolean }

/** Native select restyled with the blueprint chevron + dark option menu. */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  fullWidth?: boolean
  options: SelectOption[]
  placeholder?: string
}
export declare function Select(props: SelectProps): JSX.Element
