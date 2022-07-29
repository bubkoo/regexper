import { Node } from './node'
import { BBox, Metadata } from './types'

function formatTimes(times: number) {
  if (times === 1) {
    return 'once'
  }
  return `${times} times`
}

export interface Repeat {
  specific(): { min: number; max: number }
}

/**
 * Repeat nodes are for the various repetition syntaxes (`a*`, `a+`, `a?`, and
 * `a{1,3}`). It is not rendered directly, but contains data used for the
 * rendering of MatchFragment nodes.
 */
export class RepeatNode extends Node {
  public readonly min: number
  public readonly max: number
  public readonly greedy: boolean
  public readonly hasSkip: boolean
  public readonly hasLoop: boolean

  constructor(metadata: Metadata, parent: Node) {
    super(metadata, parent)

    const spec = metadata.spec as undefined | (Metadata & Repeat)
    const greedy = metadata.greedy as undefined | Metadata
    const { min, max } = spec ? spec.specific() : { min: -1, max: -2 }

    this.greedy = greedy == null || greedy.text === ''
    this.hasSkip = min === 0
    this.hasLoop = max === -1 || max > 1
    this.min = min
    this.max = max
  }

  getContentOffset() {
    // Translation to apply to content to be repeated to account for the loop
    // and skip lines.
    if (this.hasSkip) {
      return { x: 15, y: 10 }
    }
    if (this.hasLoop) {
      return { x: 10, y: 0 }
    }
    return { x: 0, y: 0 }
  }

  // Label to place of loop path to indicate the number of times that path
  // may be followed.
  getLabel() {
    const min = this.min
    const max = this.max

    if (min === max) {
      if (min === 0) {
        return undefined
      }
      return formatTimes(min - 1)
    }

    if (min <= 1 && max >= 2) {
      return `at most ${formatTimes(max - 1)}`
    }

    if (min >= 2) {
      if (max === -1) {
        return `${min - 1}+ times`
      }
      return `${min - 1}\u2026${formatTimes(max - 1)}`
    }
  }

  // Tooltip to place of loop path label to provide further details.
  getTooltip() {
    const min = this.min
    const max = this.max
    let repeatCount: string | undefined
    if (min === max) {
      if (min === 0) {
        repeatCount = undefined
      } else {
        repeatCount = formatTimes(min)
      }
    } else if (min <= 1 && max >= 2) {
      repeatCount = `at most ${formatTimes(max)}`
    } else if (min >= 2) {
      if (max === -1) {
        repeatCount = `${min}+ times`
      } else {
        repeatCount = `${min}\u2026${formatTimes(max)}`
      }
    }
    return repeatCount ? `repeats ${repeatCount} in total` : repeatCount
  }

  // Returns the path spec to render the line that skips over the content for
  // fragments that are optionally matched.
  skipPath(box: BBox) {
    const paths = []

    if (this.hasSkip) {
      const vert = Math.max(0, box.ay - box.y - 10)
      const horiz = box.width - 10

      paths.push(
        `M0,${
          box.ay
        }q10,0 10,-10v${-vert}q0,-10 10,-10h${horiz}q10,0 10,10v${vert}q0,10 10,10`,
      )

      // When the repeat is not greedy, the skip path gets a preference arrow.
      if (!this.greedy) {
        paths.push(`M10,${box.ay - 15}l5,5m-5,-5l-5,5`)
      }
    }

    return paths
  }

  // Returns the path spec to render the line that repeats the content for
  // fragments that are matched more than once.
  loopPath(box: BBox) {
    const paths = []

    if (this.hasLoop) {
      const vert = box.y2 - box.ay - 10

      paths.push(
        `M${box.x},${box.ay}q-10,0 -10,10v${vert}q0,10 10,10h${
          box.width
        }q10,0 10,-10v${-vert}q0,-10 -10,-10`,
      )

      // When the repeat is greedy, the loop path gets the preference arrow.
      if (this.greedy) {
        paths.push(`M${box.x2 + 10},${box.ay + 15}l5,-5m-5,5l-5,-5`)
      }
    }

    return paths
  }
}
