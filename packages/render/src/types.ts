import { Box } from '@svgdotjs/svg.js'

export interface Metadata {
  readonly type: string
  readonly text: string
  readonly offset: number
  readonly elements: Metadata[]
  [key: string]: any
}

export interface BBox extends Box {
  ax: number
  ax2: number
  ay: number
}
