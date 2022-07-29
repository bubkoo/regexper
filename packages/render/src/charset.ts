import { G, Point } from '@svgdotjs/svg.js'
import { CharsetEscapeNode } from './charset-escape'
import { CharsetRangeNode } from './charset-range'
import { LiteralNode } from './literal'
import { Node } from './node'
import { Metadata } from './types'
import { bboxWithTransform, spaceVertical } from './util'

/**
 * Charset nodes are used for `[abc1-9]` regular expression syntax. It is
 * rendered as a labeled box with each literal, escape, and range rendering
 * handled by the nested node(s).
 */
export class CharsetNode extends Node {
  public readonly label: string
  public readonly parts: (CharsetRangeNode | CharsetEscapeNode | LiteralNode)[]
  public partContainer: G

  constructor(metadata: Metadata, parent: Node) {
    super(metadata, parent)

    const parts = metadata.parts as Metadata
    const invert = metadata.invert as Metadata
    // The label for the charset will be:
    // - "One of:" for charsets of the form: `[abc]`.
    // - "None of:" for charsets of the form: `[^abc]`.
    this.label = invert.text === '^' ? 'None of:' : 'One of:'

    // Removes any duplicate parts from the charset. This is based on the type
    // and text value of the part, so `[aa]` will have only one item, but
    // `[a\x61]` will contain two since the first matches "a" and the second
    // matches 0x61 (even though both are an "a").
    const keys: string[] = []
    const uniqs: Metadata[] = []
    parts.elements.forEach((part) => {
      const key = `${part.type}:${part.text}`
      if (!keys.includes(key)) {
        keys.push(key)
        uniqs.push(part)
      }
    })

    this.parts = uniqs.map((metadata) => this.createPartNode(metadata))

    // Include a warning for charsets that attempt to match `\c` followed by
    // any character other than A-Z (case insensitive). Charsets like `[\c@]`
    // behave differently in different browsers. Some match the character
    // reference by the control charater escape, others match "\", "c", or "@",
    // and some do not appear to match anything.
    if (this.text.match(/\\c[^a-zA-Z]/)) {
      this.state.warnings.push(
        `The character set "${this.text}" contains the \\c escape followed by a character other than A-Z. This can lead to different behavior depending on browser. The representation here is the most common interpretation.`,
      )
    }
  }

  protected get anchor() {
    // Default anchor is overridden to move it down so that it connects at
    // the middle of the box that wraps all of the charset parts, instead of
    // the middle of the container, which would take the label into account.
    const matrix = this.container.matrix()
    const bbox = bboxWithTransform(this.partContainer)
    const p = new Point(0, bbox.cy).transform(matrix)
    return { ay: p.y }
  }

  private createPartNode(metadata: Metadata) {
    const type = metadata.type
    const Ctor =
      type === 'charset-range'
        ? CharsetRangeNode
        : type === 'charset-escape'
        ? CharsetEscapeNode
        : type === 'literal'
        ? LiteralNode
        : null
    if (Ctor) {
      return new Ctor(metadata, this)
    }
    throw new Error(`Unknown node type: "${type}"`)
  }

  async renderNode() {
    this.partContainer = this.container.group()

    // Renders each part of the charset into the part container.
    await Promise.all(
      this.parts.map((part) => part.render(this.partContainer.group())),
    )

    // Space the parts of the charset vertically in the part container.
    spaceVertical(this.parts, 5)

    // Label the part container.
    await this.renderLabeledBox(this.label, this.partContainer, 5)
  }
}
