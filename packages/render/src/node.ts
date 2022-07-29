import { G, Svg } from '@svgdotjs/svg.js'
import { State } from './state'
import { BBox, Metadata } from './types'
import { bboxWithTransform, normalizeBBox, tick } from './util'

export abstract class Node implements Metadata {
  public readonly state: State

  public get type() {
    return this.metadata.type
  }

  public get text() {
    return this.metadata.text
  }

  public get offset() {
    return this.metadata.offset
  }

  public get elements() {
    return this.metadata.elements
  }

  public readonly proxy?: Node | null
  public container: G | Svg

  constructor(public readonly metadata: Metadata, parent: Node | State) {
    this.state = parent instanceof Node ? parent.state : parent
  }

  protected get anchor():
    | { ax: number; ax2: number; ay: number }
    | { ay: number }
    | Record<string, never> {
    return {}
  }

  getAnchor():
    | { ax: number; ax2: number; ay: number }
    | { ay: number }
    | Record<string, never> {
    if (this.proxy) {
      return this.proxy.getAnchor()
    }
    return this.anchor
  }

  /**
   * Returns the bounding box of the container with the anchor included
   */
  bbox() {
    const bbox = bboxWithTransform(this.container)
    const anchor = this.getAnchor()
    return Object.assign(normalizeBBox(bbox), anchor) as BBox
  }

  translate(tx: number, ty: number) {
    return this.container.translate(tx, ty)
  }

  /**
   * Returns a Promise that will be resolved with the provided value. If the
   * render is cancelled before the Promise is resolved, then an exception will
   * be thrown to halt any rendering.
   * @param value Value to resolve the returned promise with.
   * @returns A Promise resolved with the provided value.
   */
  async defer<T>(value?: T) {
    await tick()
    if (this.state.cancelRender) {
      throw new Error('Render cancelled')
    }
    return value
  }

  /**
   * Render this node.
   * @param container Optional element to render this node into. A container
   * must be specified, but if it has already been set, then it does not
   * need to be provided to render.
   */
  async render(container: G | Svg): Promise<Node> {
    if (container) {
      this.container = container
      this.container.addClass(this.type)
    }

    // For nodes that proxy to a child node, just render the child.
    if (this.proxy) {
      return this.proxy.render(this.container)
    }

    this.state.inc()
    await this.renderNode()
    this.state.dec()
    return this
  }

  async renderNode() {}

  /**
   * Renders a label centered within a rectangle which can be styled.
   * @param text String or array of strings to render as a label.
   * @returns A Promise which will be resolved with the SVG group the rect and
   * text are rendered in.
   */
  async renderLabel(
    text: string | string[],
    options: {
      round?: number
      className?: string
    } = {},
  ) {
    const group = this.container.group().addClass('label')
    const rect = group.rect()
    const label = this.renderText(group, text)

    if (options.className) {
      group.addClass(options.className)
    }

    await this.defer()

    const bbox = label.bbox()
    const margin = 5

    label.translate(margin, bbox.height / 2 + 2 * margin)

    rect.attr({
      width: bbox.width + 2 * margin,
      height: bbox.height + 2 * margin,
    })

    if (options.round) {
      rect.attr({ rx: options.round, ry: options.round })
    }

    return group
  }

  /**
   * Renders a labeled box around another SVG element.
   * @param text String or array of strings to label the box with.
   * @param content SVG element to wrap in the box.
   * @param padding Pixels of padding to place between the content and the box.
   */
  async renderLabeledBox(
    text: string | string[],
    content: Node | G,
    padding = 0,
  ) {
    const label = this.renderText(this.container, text)
    const rect = this.container.rect().attr({ rx: 3, ry: 3 })

    label.addClass(`${this.type}-label`).back()
    rect.addClass(`${this.type}-box`).back()

    await this.defer()
    const labelBox = label.bbox()
    const contentBox = content.bbox()
    const boxWidth = Math.max(contentBox.width + padding * 2, labelBox.width)
    const boxHeight = contentBox.height + padding * 2

    label.translate(0, labelBox.height)
    rect.translate(0, labelBox.height).attr({
      width: boxWidth,
      height: boxHeight,
    })

    content.translate(boxWidth / 2 - contentBox.cx, labelBox.height + padding)
  }

  renderText(container: G | Svg, text: string | string[]) {
    const lines = Array.isArray(text) ? text : [text]
    return container.text((block) => {
      lines.forEach((line) => block.tspan(line))
    })
  }
}
