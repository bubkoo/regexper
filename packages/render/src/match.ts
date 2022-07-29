import { Point } from '@svgdotjs/svg.js'
import { Node } from './node'
import { MatchFragment } from './match-fragment'
import { normalizeBBox, spaceHorizontal } from './util'
import { BBox, Metadata } from './types'
import { RegexpNode } from './regexp'
import { LiteralNode } from './literal'

/**
 * Match nodes are used for the parts of a regular expression between `|`
 * symbols. Optional `^` and `$` symbols are also allowed at the beginning and
 * end of the Match.
 */
export class MatchNode extends Node {
  public readonly fragments: MatchFragment[]
  public readonly proxy: MatchFragment | null
  public start: Node
  public end: Node

  constructor(metadata: Metadata, parent: RegexpNode) {
    super(metadata, parent)
    const parts = this.metadata.parts as Metadata
    // Merged list of MatchFragments to be rendered.
    this.fragments = []
    const fragments = this.fragments

    parts.elements.forEach((node) => {
      const last = fragments[fragments.length - 1]
      const frag = new MatchFragment(node, this)
      if (last && last.canMerge && frag.canMerge) {
        // Merged the content of `node` into `last` when possible.
        ;(last.content as LiteralNode).merge(frag.content as LiteralNode)
      } else {
        // `node` cannot be merged with the previous node, so it is added to
        // the list of parts.
        fragments.push(frag)
      }
    })

    // When there is only one part, then proxy to the part.
    if (fragments.length === 1) {
      this.proxy = fragments[0]
    }
  }

  /**
   * Default anchor is overridden to attach the left point of the anchor to
   * the first element, and the right point to the last element.
   */
  protected get anchor() {
    const start = normalizeBBox(this.start.bbox())
    const end = normalizeBBox(this.end.bbox())
    const matrix = this.container.matrix()
    const p1 = new Point(start.ax, start.ay).transform(matrix)
    const p2 = new Point(end.ax2, end.ay).transform(matrix)
    return {
      ax: p1.x,
      ax2: p2.x,
      ay: p1.y,
    }
  }

  async renderNode() {
    // Render each of the match fragments.
    const items = this.fragments.map((frag) =>
      frag.render(this.container.group()),
    )

    // Handle the situation where a regular expression of `()` is rendered.
    // This leads to a Match node with no fragments. Something must be rendered
    // so that the anchor can be calculated based on it.
    //
    // Furthermore, the content rendered must have height and width or else the
    // anchor calculations fail.
    if (items.length === 0) {
      items.push(this.container.group().path('M0,0h10') as any)
    }

    return Promise.all(items).then((frags: Node[]) => {
      // Find SVG elements to be used when calculating the anchor.
      this.start = frags[0]
      this.end = frags[frags.length - 1]

      spaceHorizontal(frags, 10)
      // Add lines between each item.
      this.container.path(this.connectorPaths(frags).join('')).back()
    })
  }

  /**
   * Returns an array of SVG path strings between each item.
   */
  private connectorPaths(nodes: Node[]) {
    let prev = normalizeBBox(nodes[0].bbox())
    let next: BBox

    return nodes.slice(1).map((node) => {
      next = normalizeBBox(node.bbox())
      const path = `M${prev.ax2},${prev.ay}H${next.ax}`
      prev = next
      return path
    })
  }
}
