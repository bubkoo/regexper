import styled from 'styled-components'

export const Input = styled.input.attrs({
  type: 'text',
  autoFocus: 'autofocus',
  placeholder: 'Enter JavaScript-style regular expression to display',
})`
  font-size: 1em;
  line-height: 1.5em;
  border: 0 none;
  outline: none;
  background: #cbcbba;
  padding: 0.6em 0.8em;
  margin-bottom: 0.25em;
  width: 100%;
  font-family: Consolas, Monaco, Lucida Console, Liberation Mono,
    DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
`
