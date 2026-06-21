import { useState } from 'react'
import { Input } from './Input'

export function PasswordInput({ showLabel = 'Show', hideLabel = 'Hide', label = 'Password', ...rest }) {
  const [visible, setVisible] = useState(false)
  return (
    <Input
      label={label}
      type={visible ? 'text' : 'password'}
      autoComplete="current-password"
      addonEnd={
        <button
          type="button"
          className="bp-input__addon-btn"
          onClick={() => setVisible(v => !v)}
          aria-pressed={visible}
          aria-label={visible ? hideLabel : showLabel}
        >
          {visible ? hideLabel : showLabel}
        </button>
      }
      {...rest}
    />
  )
}
