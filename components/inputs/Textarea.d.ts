import type { TextareaHTMLAttributes } from 'react'

/** Multiline field; pass mono for IFC/WKT/code-style content. */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  fullWidth?: boolean
  mono?: boolean
}
export declare function Textarea(props: TextareaProps): JSX.Element
