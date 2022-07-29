import { Node } from './node'

/**
 * AnyCharacter nodes are for `*` regular expression syntax.
 * They are rendered as just an "any character" label.
 */
export class AnyCharacterNode extends Node {
  public readonly label: string = 'any character'

  async renderNode() {
    await this.renderLabel(this.label, { round: 3 })
  }
}
