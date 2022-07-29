import { Node } from './node'

export class AnchorNode extends Node {
  public readonly label: string =
    this.text === '^' ? 'Start of line' : 'End of line'

  async renderNode() {
    await this.renderLabel(this.label, { className: this.type, round: 3 })
  }
}
