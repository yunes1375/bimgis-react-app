import type { ReactNode } from 'react'

export interface BasemapOption { id: string; label: ReactNode; swatchColor?: string; swatchImage?: string }

/** Round map control that opens a swatch list to switch basemap layers. */
export interface BasemapPickerProps {
  value: string
  onChange: (id: string) => void
  options: BasemapOption[]
  ariaLabel?: string
  className?: string
}
export declare function BasemapPicker(props: BasemapPickerProps): JSX.Element
