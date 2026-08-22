import { sampleStroke, densify, distance, pathLength, type Point } from "./geometry"
import {
  TOLERANCE,
  IDEAL_SAMPLES,
  DENSE_SAMPLES,
  MIN_TRACE_POINTS,
  MIN_TRACE_LENGTH
} from "./config"

export type ScoreResult = {
  score: number
  coverage: number
  precision: number
  judgeable: boolean
}

/**
 * Score how well `userPoints` matches the ideal stroke `idealD`.
 *
 * Implements D6 exactly:
 * - Coverage (ordered): walk ideal points forward with a cursor into the
 *   user points. Each ideal point covered advances the cursor past the
 *   matched user point, so each user point is used once. Backwards or
 *   mid-way strokes score low.
 * - Precision: fraction of user points within TOLERANCE of any dense
 *   ideal sample. Stops scribble-everything from scoring high.
 * - score = round(100 * coverage * precision), range 0–100.
 * - Taps / near-zero-length input → judgeable: false.
 */
export function scoreStroke(idealD: string, userPoints: Point[]): ScoreResult {
  if (!userPoints || userPoints.length < MIN_TRACE_POINTS) {
    return { score: 0, coverage: 0, precision: 0, judgeable: false }
  }

  const len = pathLength(userPoints)
  if (len < MIN_TRACE_LENGTH) {
    return { score: 0, coverage: 0, precision: 0, judgeable: false }
  }

  const idealPoints = sampleStroke(idealD, IDEAL_SAMPLES)
  const denseIdeal = sampleStroke(idealD, DENSE_SAMPLES)
  const denseUser = densify(userPoints, 1)

  // Coverage (ordered): walk ideal points in order with forward-only cursor j.
  // Ideal point i counts as covered if some user point at index >= j lies
  // within TOLERANCE; then advance j past that matched user point.
  let covered = 0
  let j = 0
  for (let i = 0; i < idealPoints.length; i++) {
    const idealPt = idealPoints[i]
    let found = -1
    for (let k = j; k < denseUser.length; k++) {
      if (distance(idealPt, denseUser[k]) <= TOLERANCE) {
        found = k
        break
      }
    }
    if (found >= 0) {
      covered++
      j = found + 1
    }
  }
  const coverage = covered / idealPoints.length

  // Precision: fraction of user points within TOLERANCE of any dense ideal sample.
  let preciseCount = 0
  for (const userPt of denseUser) {
    for (const idealPt of denseIdeal) {
      if (distance(userPt, idealPt) <= TOLERANCE) {
        preciseCount++
        break
      }
    }
  }
  const precision = preciseCount / denseUser.length

  const score = Math.round(100 * coverage * precision)

  return { score, coverage, precision, judgeable: true }
}
