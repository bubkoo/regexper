export type Options = {
  onChange?: (status: { progress: number }) => void
}

/**
 * State tracking for an in-progress parse and render
 */
export class State {
  /**
   * Tracks the number of capture groups in the expression
   */
  public groupCounter: number
  /**
   * Cancels the in-progress render when set to true
   */
  public cancelRender: boolean
  /**
   * Warnings that have been generated while rendering
   */
  public readonly warnings: string[]

  private readonly options: Options
  private renderCounter: number
  private maxCounter: number

  constructor(options: Options = {}) {
    this.groupCounter = 0
    this.cancelRender = false
    this.warnings = []

    this.renderCounter = 0
    this.maxCounter = 0
    this.options = options
  }

  private update(value: number) {
    if (value > this.renderCounter) {
      this.maxCounter = value
    }

    this.renderCounter = value

    if (this.maxCounter && !this.cancelRender) {
      const onChange = this.options.onChange
      if (onChange) {
        const progress =
          100 - Math.round((100 * this.renderCounter) / this.maxCounter)
        onChange({ progress })
      }
    }
  }

  inc() {
    this.update(this.renderCounter + 1)
  }

  dec() {
    this.update(this.renderCounter - 1)
  }
}
