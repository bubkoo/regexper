import { Repeat } from './repeat'

/**
 * RepeatOptional nodes are used for `a?` regular expression syntax. It is not
 * rendered directly; it just indicates that the Repeat node loops zero or one
 * times.
 */
export const RepeatOptional: Repeat = {
  specific() {
    return {
      min: 0,
      max: 1,
    }
  },
}
