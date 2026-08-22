/**
 * Constants for stroke-accuracy scoring (D6).
 * All distances are in viewBox units (109 × 109 KanjiVG space).
 */

export const VIEWBOX = 109

/**
 * Max distance at which a user point "matches" the ideal stroke.
 * Tunable starting value; adjusted in step 8 against real fixtures.
 */
export const TOLERANCE = 9

/** Ideal stroke is sampled into this many points evenly by arc length. */
export const IDEAL_SAMPLES = 40

/** Denser set of ideal samples used for precision checks. */
export const DENSE_SAMPLES = 120

/** Fewer than this many user points → not judgeable (tap/near-zero). */
export const MIN_TRACE_POINTS = 3

/** Total path length under this → not judgeable. */
export const MIN_TRACE_LENGTH = 3

/** Default acceptance threshold (percent). Made configurable in step 12. */
export const DEFAULT_THRESHOLD = 90
