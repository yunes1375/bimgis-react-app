import type { ReactNode } from 'react'

export type ToastTone = 'info' | 'success' | 'warn' | 'error'

/** Notification with tone bar, icon, optional action + dismiss. */
export interface ToastProps {
  tone?: ToastTone
  title: ReactNode
  description?: ReactNode
  action?: { label: string; onClick: () => void }
  onClose?: () => void
  className?: string
  icon?: ReactNode
}
export declare function Toast(props: ToastProps): JSX.Element
/** Fixed bottom-right stacking region for Toasts. */
export declare function ToastStack(props: { children: ReactNode }): JSX.Element
