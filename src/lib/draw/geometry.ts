import { svgPathProperties } from "svg-path-properties"

export type Point = { x: number; y: number }

/**
 * Sample a path into `count` points evenly spaced by arc length, including
 * both endpoints. Returns at least the start point when `count >= 1`.
 */
export function sampleStroke(d: string, count: number): Point[] {
  if (count < 1) return []
  const props = new svgPathProperties(d)
  const total = props.getTotalLength()
  const points: Point[] = []
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1)
    points.push(props.getPointAtLength(t * total))
  }
  return points
}

/**
 * Return the start point of a path and its initial tangent angle in degrees
 * (0° = pointing right, positive = clockwise).
 */
export function startDirection(d: string): { point: Point; angleDeg: number } {
  const props = new svgPathProperties(d)
  const point = props.getPointAtLength(0)
  const tangent = props.getTangentAtLength(0)
  const angleDeg = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI
  return { point, angleDeg }
}

/** Euclidean distance between two points. */
export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

/** Sum of segment lengths between consecutive points. */
export function pathLength(points: Point[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += distance(points[i - 1], points[i])
  }
  return total
}

/**
 * Insert intermediate points between consecutive samples so that no gap
 * exceeds `maxGap`. Returns a copy of the input when it has fewer than 2
 * points or every gap is already within `maxGap`.
 */
export function densify(points: Point[], maxGap: number): Point[] {
  if (points.length < 2) return points.slice()
  const result: Point[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1]
    const to = points[i]
    const segLen = distance(from, to)
    if (segLen <= maxGap || segLen === 0) {
      result.push(to)
      continue
    }
    const steps = Math.ceil(segLen / maxGap)
    for (let s = 1; s <= steps; s++) {
      const t = s / steps
      result.push({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      })
    }
  }
  return result
}
