import { Code, CODE_MAPPING, getCodeData, toHex } from './escape-util'
import { Node } from './node'
import { Metadata } from './types'

/**
 * Escape nodes are used for escape sequences. It is rendered as a label
 * with the description of the escape and the numeric code it matches when
 * appropriate.
 */
export class EscapeNode extends Node {
  public readonly mapping = CODE_MAPPING
  /**
   * The escape code. For an escape such as `\b` it would be "b".
   */
  public readonly code: Code
  /**
   * The argument. For an escape such as `\xab` it would be "ab".
   */
  public readonly arg: string
  public readonly label: string
  public readonly ordinal: number

  constructor(metadata: Metadata, parent: Node) {
    super(metadata, parent)

    const esc = metadata.esc as Metadata & { code: Metadata; arg: Metadata }
    this.code = esc.code.text as Code
    this.arg = esc.arg.text

    // Retrieves the label, ordinal value, an flag to control adding hex value
    // from the escape code mappings
    const ret = getCodeData(this.mapping, this.code, this.arg)

    this.label = ret[0] as string
    this.ordinal = ret[1] as number
    const hex = ret[2] as boolean

    // When requested, add hex code to the label.
    if (hex) {
      this.label = `${this.label} ${toHex(this.ordinal)}`
    }
  }

  async renderNode() {
    await this.renderLabel(this.label, { round: 3 })
  }
}
