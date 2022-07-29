import { Point } from '@svgdotjs/svg.js'
import { Node } from './node'
import { RegexpNode } from './regexp'
import { Metadata } from './types'

const LABEL_MAP = {
  '?:': '',
  '?=': 'positive lookahead',
  '?!': 'negative lookahead',
}

/**
 * Subexp nodes are for expressions inside of parenthesis. It is rendered as a
 * labeled box around t he contained expression if a label is required.
 */
export class SubexpNode extends Node {
  public readonly capture: Metadata
  public readonly regexp: RegexpNode
  public readonly proxy: RegexpNode | null

  constructor(metadata: Metadata, parent: Node) {
    super(metadata, parent)

    this.capture = metadata.capture
    this.regexp = new RegexpNode(metadata.regexp, this)
    // If there is no need for a label, then proxy to the nested regexp.
    if (this.capture.text === '?:') {
      this.proxy = this.regexp
    }
  }

  protected get anchor() {
    const box = this.regexp.bbox()
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
    // **NOTE:** `this.label()` **MUST** be called here, and before
    // any child nodes are rendered. This is to keep the group numbers in the
    // correct order.
    const label = this.label()
    // Render the contained regexp.
    await this.regexp.render(this.container.group())
    // Create the labeled box around the regexp.
    await this.renderLabeledBox(label, this.regexp, 10)
  }

  /**
   * Returns the label for the subexpression
   */
  private label() {
    const ret = LABEL_MAP[this.capture.text as keyof typeof LABEL_MAP]
    if (ret) {
      return ret
    }
    this.state.groupCounter += 1
    return `group #${this.state.groupCounter}`
  }
}
