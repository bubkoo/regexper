import React, { useState } from 'react'
import { Input } from './style'

export function RegexpInput(props: {
  regexp: string
  onChange: (regexp: string) => void
}) {
  const [regexp, setRegexp] = useState(props.regexp || '')

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    props.onChange(e.target.value)
  }

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.charCode === 13) {
      props.onChange(e.target.value)
    }
  }

  return (
    <div>
      <Input
        value={regexp}
        onBlur={onBlur}
        onKeyPress={onKeyPress}
        onChange={(e) => setRegexp(e.target.value)}
      />
    </div>
  )
}
