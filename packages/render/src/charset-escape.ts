import { EscapeNode } from './escape'
import { CODE_MAPPING } from './escape-util'

/**
 * CharsetEscape nodes are for escape sequences inside of character sets. They
 * differ from other Escape nodes in that `\b` matches a backspace character
 * instead of a word boundary.
 */
export class CharsetEscapeNode extends EscapeNode {
  readonly mapping = {
    ...CODE_MAPPING,
    b: ['backspace', 0x08, true],
  }
}
