import { Repeat } from './repeat'

/**
 * RepeatAny nodes are used for `a*` regular expression syntax. It is not
 * rendered directly; it just indicates that the Repeat node loops zero or more
 * times.
 */
export const RepeatAny: Repeat = {
  specific() {
    return {
      min: 0,
      max: -1,
    }
  },
}
