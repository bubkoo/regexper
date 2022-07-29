import { Repeat } from './repeat'

/**
 * RepeatRequired nodes are used for `a+` regular expression syntax. It is not
 * rendered directly; it just indicates that the Repeat node loops one or more
 * times.
 */
export const RepeatRequired: Repeat = {
  specific() {
    return {
      min: 1,
      max: -1,
    }
  },
}
