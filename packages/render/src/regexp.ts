import { MatchNode } from './match'
import { Node } from './node'
import { BBox, Metadata } from './types'
import { normalizeBBox, spaceVertical } from './util'

export class RegexpNode extends Node {
  public readonly matches: MatchNode[]
  public readonly proxy?: MatchNode | null

  constructor(metadata: Metadata, parent: Node) {
    super(metadata, parent)

    const alternates = this.metadata.alternates as Metadata
    // Merge all the match nodes into one array.
    this.matches = [this.metadata.match as Metadata]
      .concat(alternates.elements.map((e) => e.match as Metadata))
      .map((match) => new MatchNode(match, this))

    // When there is only one match node to render, proxy to it.
    this.proxy = alternates.elements.length === 0 ? this.matches[0] : null
  }

  async renderNode() {
    const matchContainer = this.container
      .group()
      .addClass(`${this.type}-matches`)
      .translate(20, 0)
    const matches = this.matches

    // Renders each match into the match container.
    await Promise.all(
      matches.map((match) => match.render(matchContainer.group())),
    )

    // Space matches vertically in the match container.
    spaceVertical(matches, 5)

    let containerBox = this.bbox()

    // Creates the curves from the side lines for each match.
    const paths: string[] = []
    matches.forEach((match) =>
      paths.push(...this.makeCurve(containerBox, match)),
    )

    // Add side lines to the list of paths.
    paths.push(...this.makeSide(containerBox, matches[0])!)
    paths.push(...this.makeSide(containerBox, matches[matches.length - 1])!)

    // Render connector paths.
    this.container.path(paths.join('')).back()

    containerBox = normalizeBBox(matchContainer.bbox())

    // Create connections from side lines to each match and render into
    // the match container.
    const connectorPaths = matches.map((match) =>
      this.makeConnector(containerBox, match),
    )
    matchContainer.path(connectorPaths.join('')).back()
  }

  /**
   * Returns an array of SVG path strings to draw the vertical lines on the
   * left and right of the node.
   * @param containerBox Bounding box of the container.
   * @param match Match node that the line will be drawn to.
   */
  private makeSide(containerBox: BBox, match: MatchNode) {
    const box = match.bbox()
    const distance = Math.abs(box.ay - containerBox.cy)

    // Only need to draw side lines if the match is more than 15 pixels from
    // the vertical center of the rendered regexp. Less that 15 pixels will be
    // handled by the curve directly.
    if (distance >= 15) {
      const shift = box.ay > containerBox.cy ? 10 : -10
      const edge = box.ay - shift

      return [
        `M0,${containerBox.cy}q10,0 10,${shift}V${edge}`,
        `M${containerBox.width + 40},${
          containerBox.cy
        }q-10,0 -10,${shift}V${edge}`,
      ]
    }
  }

  /**
   * Returns an array of SVG path strings to draw the curves from the
   * sidelines up to the anchor of the match node.
   * @param containerBox Bounding box of the container.
   * @param match Match node that the line will be drawn to.
   */
  private makeCurve(containerBox: BBox, match: MatchNode) {
    const box = match.bbox()
    const distance = Math.abs(box.ay - containerBox.cy)

    if (distance >= 15) {
      // For match nodes more than 15 pixels from the center of the regexp, a
      // quarter-circle curve is used to connect to the sideline.
      const curve = box.ay > containerBox.cy ? 10 : -10

      return [
        `M10,${box.ay - curve}q0,${curve} 10,${curve}`,
        `M${containerBox.width + 30},${box.ay - curve}q0,${curve} -10,${curve}`,
      ]
    }
    // For match nodes less than 15 pixels from the center of the regexp, a
    // slightly curved line is used to connect to the sideline.
    const anchor = box.ay - containerBox.cy

    return [
      `M0,${containerBox.cy}c10,0 10,${anchor} 20,${anchor}`,
      `M${containerBox.width + 40},${
        containerBox.cy
      }c-10,0 -10,${anchor} -20,${anchor}`,
    ]
  }

  /**
   * Returns an array of SVG path strings to draw the connection from the
   * curve to match node.
   * @param containerBox Bounding box of the container.
   * @param match Match node that the line will be drawn to.
   */
  private makeConnector(containerBox: BBox, match: MatchNode) {
    const box = match.bbox()
    return `M0,${box.ay}h${box.ax}M${box.ax2},${box.ay}H${containerBox.width}`
  }
}
