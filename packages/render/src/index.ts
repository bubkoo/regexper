import parser from '@regexper/parser'
import { SVG } from '@svgdotjs/svg.js'
import { style } from './style'
import { Metadata } from './types'
import { RootNode } from './root'
import { Options, State } from './state'
import { getExtensions } from './extensions.js'

export async function render(
  regex: string | RegExp,
  container: SVGSVGElement | SVGGElement,
  options: Options = {},
) {
  const state = new State(options)
  const extensions = getExtensions()
  const regexString = typeof regex === 'string' ? regex : regex.toString()
  const tree = parser.parse(regexString, { types: extensions }) as Metadata
  const root = new RootNode(tree, state)
  const svg = SVG(container)

  svg
    .defs()
    .style()
    .add(document.createTextNode(style) as any)

  await root.render(svg.group())
  const bbox = root.bbox()
  root.translate(10 - bbox.x, 10 - bbox.y)
  svg.size(bbox.width + 20, bbox.height + 20)
  return root
}
