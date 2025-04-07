import { CharsetEscapeNode } from './charset-escape'
import { LiteralNode } from './literal'
import { Node } from './node'
import { Metadata } from './types'
import { spaceHorizontal } from './util'

/**
 * CharsetRange nodes are used for `[a-z]` regular expression syntax. The two
 * literal or escape nodes are rendered with a hyphen between them.
 */
export class CharsetRangeNode extends Node {
  public readonly first: LiteralNode | CharsetEscapeNode
  public readonly last: LiteralNode | CharsetEscapeNode

  constructor(metadata: Metadata, parent: Node) {
    super(metadata, parent)
    this.first = this.createTerminalNode(metadata.first as Metadata)
    this.last = this.createTerminalNode(metadata.last as Metadata)

    // Report invalid expression when extents of the range are out of order.
    if (this.first instanceof LiteralNode && this.last instanceof LiteralNode) {
      if (this.first.order > this.last.order) {
        throw new Error(`Range out of order in character class: ${this.text}`)
      }
    }
  }

  private createTerminalNode(metadata: Metadata) {
    return metadata.type === 'charset-escape'
      ? new CharsetEscapeNode(metadata, this)
      : new LiteralNode(metadata, this)
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
