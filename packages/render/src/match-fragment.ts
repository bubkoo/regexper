import { Point, G, create } from '@svgdotjs/svg.js'
import { Node } from './node'
import { AnchorNode } from './anchor'
import { AnyCharacterNode } from './any-character'
import { CharsetNode } from './charset'
import { EscapeNode } from './escape'
import { LiteralNode } from './literal'
import { MatchNode } from './match'
import { RepeatNode } from './repeat'
import { SubexpNode } from './subexp'
import { Metadata } from './types'

/**
 * MatchFragment are part of a MatchNode followed by an optional RepeatNode.
 * If no repeat is applied, then rendering is proxied to the content node.
 */
export class MatchFragment extends Node {
  /**
   * Then content of the fragment
   */
  public readonly content:
    | AnchorNode
    | SubexpNode
    | CharsetNode
    | AnyCharacterNode
    | EscapeNode
    | LiteralNode
  /**
   * The repetition rule for the fragment
   */
  public readonly repeat: RepeatNode
  public readonly proxy: Node | null
  public readonly canMerge: boolean

  constructor(metadata: Metadata, parent: MatchNode) {
    super(metadata, parent)
    this.content = this.createContentNode()
    this.repeat = new RepeatNode(metadata.repeat as Metadata, this)

    if (!this.repeat.hasLoop && !this.repeat.hasSkip) {
      // For fragments without a skip or loop, rendering is proxied to the
      // content. Also set flag indicating that contents can be merged if
      // the content is a literal node.
      this.canMerge = this.content.type === 'literal'
      this.proxy = this.content
    } else {
      // Fragments that have skip or loop lines cannot be merged with others.
      this.canMerge = false
    }
  }

  private createContentNode() {
    const metadata = this.metadata.content as Metadata
    const type = metadata.type as string
    const Ctor =
      type === 'anchor'
        ? AnchorNode
        : type === 'subexp'
        ? SubexpNode
        : type === 'charset'
        ? CharsetNode
        : type === 'any-character'
        ? AnyCharacterNode
        : type === 'escape'
        ? EscapeNode
        : type === 'literal'
        ? LiteralNode
        : null
    if (Ctor) {
      return new Ctor(metadata, this)
    }

    throw new Error(`Unknow match fragment type: "${type}"`)
  }

  protected get anchor() {
    // Default anchor is overridden to apply an transforms from the fragment
    // to its content's anchor. Essentially, the fragment inherits the anchor
    // of its content.
    const box = this.content.bbox()
    const matrix = this.container.matrix()
    const p1 = new Point(box.ax, box.ay).transform(matrix)
    const p2 = new Point(box.ax2, box.ay).transform(matrix)
    return {
      ax: p1.x,
      ax2: p2.x,
      ay: p1.y,
    }
  }

  async renderNode() {
    await this.content.render(this.container.group())
    // Contents must be transformed based on the repeat that is applied.
    const { x, y } = this.repeat.getContentOffset()
    this.content.translate(x, y)
    const box = this.content.bbox()
    // Add skip or repeat paths to the container.
    const paths = [...this.repeat.skipPath(box), ...this.repeat.loopPath(box)]
    this.container.path(paths.join('')).back()
    this.renderLoopLabel()
  }

  /**
   * Renders label for the loop path indicating how many times the content may
   * be matched.
   */
  private renderLoopLabel() {
    const labelStr = this.repeat.getLabel()
    const tooltipStr = this.repeat.getTooltip()
    if (labelStr) {
      const label = this.container.text(labelStr).addClass('repeat-label')
      const labelBox = label.bbox()
      const box = this.bbox()

      if (tooltipStr) {
        const tooltip = create('title') as G
        this.container.text(tooltipStr).addTo(tooltip)
        label.add(tooltip)
      }

      label.translate(
        box.x2 - labelBox.width - (this.repeat.hasSkip ? 5 : 0),
        box.y2 + labelBox.height,
      )
    }
  }
}
