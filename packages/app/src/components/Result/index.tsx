import React, { useRef, useEffect, useState } from 'react'
import { render } from '@regexper/render'
import {
  ResultContainer,
  ErrorContainer,
  WarningContainer,
  VisContainer,
} from './styles'

type Props = { regexp: string | RegExp }
type State = { error: Error | null; warnings: string[] | null }

export function Result(props: Props) {
  const svgRef = useRef(null)
  const [{ error, warnings }, setResult] = useState<State>({
    error: null,
    warnings: null,
  })

  const empty = () => {
    const svg = svgRef.current! as SVGSVGElement
    while (svg.firstChild) {
      svg.removeChild(svg.lastChild!)
    }
    svg.removeAttribute('width')
    svg.removeAttribute('height')
  }

  useEffect(() => {
    const svg = svgRef.current! as SVGSVGElement
    empty()

    if (props.regexp) {
      render(props.regexp, svg)
        .then((root) => {
          setResult({ error: null, warnings: root.state.warnings })
        })
        .catch((error: Error) => {
          setResult({ error, warnings: null })
          throw error
        })
    } else {
      setResult({ error: null, warnings: null })
    }
  }, [props.regexp])

  return (
    <ResultContainer>
      <VisContainer>
        <svg ref={svgRef} />
      </VisContainer>
      {error && (
        <ErrorContainer>{error.message || error.toString()}</ErrorContainer>
      )}
      {warnings && warnings.length && (
        <WarningContainer>
          {warnings.map((warning, index) => (
            <li key={`${index}-${warning}`}>{warning}</li>
          ))}
        </WarningContainer>
      )}
    </ResultContainer>
  )
}
