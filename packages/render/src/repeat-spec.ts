import { Repeat } from './repeat'

/**
 * RepeatSpec nodes are used for `a{m,n}` regular expression syntax. It is not
 * rendered directly; it just indicates how many times the Repeat node loops.
 */
export const RepeatSpec: Repeat = {
  specific() {
    const min = this.min ? +this.min.text : this.exact ? +this.exact.text : 0
    const max = this.max ? +this.max.text : this.exact ? +this.exact.text : -1

    // Report invalid repeat when the minimum is larger than the maximum.
    if (min > max && max !== -1) {
      throw new Error(`Numbers out of order: ${this.text}`)
    }

    return {
      min,
      max,
    }
  },
}
