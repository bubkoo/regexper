import { Node } from './node'
import { Metadata } from './types'

/**
 * Literal nodes are for plain strings in the regular expression. They are
 * rendered as labels with the value of the literal quoted.
 */
export class LiteralNode extends Node {
  public label: string
  public readonly order: number

  constructor(metadata: Metadata, parent: Node) {
    super(metadata, parent)
    const literal = metadata.literal as Metadata

    this.label = literal.text
    // Order value of the literal for use in CharsetRangeNode.
    this.order = this.label.charCodeAt(0)
  }

  async renderNode() {
    const text = ['\u201c', this.label, '\u201d']
    const g = await this.renderLabel(text, { round: 3 })
    const spans = g.find('tspan')

    // The quote marks get some styling to lighten their color so they are
    // distinct from the actual literal value.
    spans[0].addClass('quote')
    spans[2].addClass('quote')
  }

  /**
   * Merges this literal with another. Literals come back as single characters
   * during parsing, and must be post-processed into multi-character literals
   * for rendering. This processing is done in MatchNode.
   */
  merge(other: LiteralNode) {
    this.label += other.label
  }
}
