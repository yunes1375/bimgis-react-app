import type { InputProps } from './Input'

/** Input with a Show/Hide mono toggle in the end-addon slot. */
export interface PasswordInputProps extends Omit<InputProps, 'type' | 'addonEnd'> {
  showLabel?: string
  hideLabel?: string
}
export declare function PasswordInput(props: PasswordInputProps): JSX.Element
