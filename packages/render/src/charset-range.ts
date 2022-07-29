import { Node } from './node'
import { LiteralNode } from './literal'
import { spaceHorizontal } from './util'
import { Metadata } from './types'

/**
 * CharsetRange nodes are used for `[a-z]` regular expression syntax. The two
 * literal or escape nodes are rendered with a hyphen between them.
 */
export class CharsetRangeNode extends Node {
  public readonly first: LiteralNode
  public readonly last: LiteralNode

  constructor(metadata: Metadata, parent: Node) {
    super(metadata, parent)
    this.first = new LiteralNode(metadata.first, this)
    this.last = new LiteralNode(metadata.last, this)

    // Report invalid expression when extents of the range are out of order.
    if (this.first.order > this.last.order) {
      throw new Error(`Range out of order in character class: ${this.text}`)
    }
  }

  async renderNode() {
    const contents = [this.first, this.container.text('-'), this.last]

    // Render the nodes of the range.
    await Promise.all([
      this.first.render(this.container.group()),
      this.last.render(this.container.group()),
    ])

    // Space the nodes and hyphen horizontally.
    spaceHorizontal(contents, 5)
  }
}
