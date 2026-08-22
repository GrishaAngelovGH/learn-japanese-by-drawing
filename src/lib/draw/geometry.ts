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
 * Return the start point of a path and its overall direction angle in degrees
 * (0° = pointing right, positive = clockwise).
 *
 * Computes the angle from the path's start point to its end point — this is
 * the overall direction a human perceives for the stroke, and it's reliable
 * even for curved KanjiVG strokes where the instantaneous tangent at the start
 * can be misleading.
 */
export function startDirection(d: string): { point: Point; angleDeg: number } {
  const props = new svgPathProperties(d)
  const point = props.getPointAtLength(0)
  const total = props.getTotalLength()
  const endPoint = total > 0 ? props.getPointAtLength(total) : point
  const angleDeg =
    (Math.atan2(endPoint.y - point.y, endPoint.x - point.x) * 180) / Math.PI
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

/**
 * Minimal pointer-event shape needed for viewBox conversion. Accepts both
 * the global `PointerEvent` and React's `PointerEvent<T>`.
 */
type PointerLike = { clientX: number; clientY: number }

/**
 * Convert a pointer event to a point in the 109 × 109 viewBox space
 * (D4). Returns null when the SVG element isn't available.
 */
export function toViewBoxPoint(
  event: PointerLike,
  svgElement: SVGSVGElement | null
): Point | null {
  if (!svgElement) return null
  const rect = svgElement.getBoundingClientRect()
  const x = Math.round(((event.clientX - rect.left) / rect.width) * 109 * 100) / 100
  const y = Math.round(((event.clientY - rect.top) / rect.height) * 109 * 100) / 100
  return { x, y }
}
