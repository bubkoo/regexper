import React, { useState } from 'react'
import { GlobalStyle } from './styles/GlobalStyle'
import { RegexpInput } from './components/RegexpInput'
import { Result } from './components/Result'

export function App() {
  const [regexp, setRegexp] = useState('')

  return (
    <>
      <GlobalStyle />
      <RegexpInput regexp={regexp} onChange={(regexp) => setRegexp(regexp)} />
      <Result regexp={regexp} />
    </>
  )
}
