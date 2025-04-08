import { Text } from '@svgdotjs/svg.js'
import { Node } from './node'
import { RegexpNode } from './regexp'
import { State } from './state'
import { Metadata } from './types'

const FLAG_LABELS = {
  i: 'Ignore Case',
  g: 'Global',
  m: 'Multiline',
  y: 'Sticky',
  u: 'Unicode',
}

/**
 * Root nodes contain the top-level regexp node.
 * Any flags and a few decorative elements are rendered by the root node.
 */
export class RootNode extends Node {
  public readonly regexp: RegexpNode

  public get flags() {
    return this.metadata.flags as Metadata
  }

  constructor(metadata: Metadata, state: State) {
    super(metadata, state)
    this.regexp = new RegexpNode(this.metadata.regexp as Metadata, this)
  }

  async renderNode() {
    const chars: string[] = []
    this.flags.text.split('').forEach((c) => {
      if (!chars.includes(c)) {
        chars.push(c)
      }
    })

    const flags = chars
      .sort()
      .map((flag) => FLAG_LABELS[flag as keyof typeof FLAG_LABELS])

    // Render a label for any flags that have been set of the expression.
    let flagText: Text | undefined
    if (flags.length > 0) {
      flagText = this.container.text(`Flags: ${flags.join(', ')}`)
    }

    // Render the content of the regular expression.
    await this.regexp.render(this.container.group())

    // Move rendered regexp to account for flag label and to allow for
    // decorative elements.
    const tx = 10
    const ty = flagText ? flagText.bbox().height : 0
    this.regexp.translate(tx, ty)

    const box = this.regexp.bbox()
    const margin = 10

    // Render decorative elements.
    this.container.path(
      `M${box.ax},${box.ay}H0M${box.ax2},${box.ay}H${box.x2 + margin}`,
    )
    this.container.circle(10).center(0, box.ay)
    this.container.circle(10).center(box.x2 + margin, box.ay)
  }
}
