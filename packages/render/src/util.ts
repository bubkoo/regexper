import { Box, Element } from '@svgdotjs/svg.js'
import { Node } from './node'
import { BBox } from './types'

export function bboxWithTransform(node: Element) {
  const bbox = node.bbox()
  const matrix = node.matrix()
  return bbox.transform(matrix)
}

/**
 * Creates a Promise that will be resolved after a specified delay.
 * @param ms Time in milliseconds to wait before resolving promise.
 */
export function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Creates a Promise that will be resolved after 0 milliseconds. This is used
 * to create a short delay that allows the browser to address any pending tasks
 * while the JavaScript VM is not active.
 */
export function tick() {
  return wait(0)
}

export function normalizeBBox(box: Box | BBox) {
  const bbox = box as BBox
  if (bbox.ax == null) {
    bbox.ax = box.x
  }
  if (bbox.ax2 == null) {
    bbox.ax2 = box.x2
  }
  if (bbox.ay == null) {
    bbox.ay = box.cy
  }
  return bbox
}

/**
 * Positions a collection of nodes with their axis points aligned along a
 * horizontal line. This leads to the nodes being spaced horizontally and
 * effectively centered vertically.
 * @param nodes Array of nodes to be positioned
 * @param padding Number of pixels to leave between items
 */
export function spaceHorizontal(nodes: (Node | Element)[], padding: number) {
  const values = nodes.map((node) => ({
    bbox: normalizeBBox(node.bbox()),
    node,
  }))

  // Calculate where the axis points should be positioned vertically.
  const verticalCenter = values.reduce(
    (center, { bbox }) => Math.max(center, bbox.ay),
    0,
  )

  // Position items with padding between them and aligned their axis points.
  values.reduce((offset, { node, bbox }) => {
    node.translate(offset, verticalCenter - bbox.ay)
    return offset + padding + bbox.width
  }, 0)
}

/**
 * Positions a collection of nodes centered horizontally in a vertical stack.
 * @param nodes Array of nodes to be positioned
 * @param padding Number of pixels to leave between items
 */
export function spaceVertical(nodes: (Node | Element)[], padding: number) {
  const values = nodes.map((node) => ({
    bbox: node.bbox(),
    node,
  }))

  // Calculate where the center of each item should be positioned horizontally.
  const horizontalCenter = values.reduce(
    (center, { bbox }) => Math.max(center, bbox.cx),
    0,
  )

  // Position items with padding between them and align their centers.
  values.reduce((offset, { node, bbox }) => {
    node.translate(horizontalCenter - bbox.cx, offset)
    return offset + padding + bbox.height
  }, 0)
}
