/**
 * Maps completion counts to intensity levels (0–3) for the streak graph.
 *
 * GitHub-style: higher counts → darker green. Thresholds are named constants
 * for easy tuning.
 */

/** Minimum count for each level (inclusive). */
export const LEVEL_THRESHOLDS = {
  /** Level 0: empty (no completions). */
  0: 0,
  /** Level 1: light green (1–2 words). */
  1: 1,
  /** Level 2: medium green (3–5 words). */
  2: 3,
  /** Level 3: darkest green (6+ words). */
  3: 6,
} as const

export type Level = 0 | 1 | 2 | 3

/**
 * Returns the level for a given completion count.
 *
 * @param count - Number of words completed on a day. Negative or NaN → 0.
 * @returns Level 0–3.
 */
export function getLevel(count: number): Level {
  if (typeof count !== "number" || isNaN(count) || count < 0) {
    return 0
  }
  if (count >= LEVEL_THRESHOLDS[3]) return 3
  if (count >= LEVEL_THRESHOLDS[2]) return 2
  if (count >= LEVEL_THRESHOLDS[1]) return 1
  return 0
}

/**
 * Tailwind classes for each level, with light and dark mode variants.
 *
 * Key: level (0–3)
 * Value: { light: string, dark: string }
 */
export const LEVEL_CLASSES = {
  0: {
    light: "bg-zinc-100",
    dark: "dark:bg-zinc-800",
  },
  1: {
    light: "bg-green-200",
    dark: "dark:bg-green-900",
  },
  2: {
    light: "bg-green-400",
    dark: "dark:bg-green-700",
  },
  3: {
    light: "bg-green-600",
    dark: "dark:bg-green-600",
  },
} as const satisfies Record<Level, { light: string; dark: string }>

/**
 * Human-readable word range for a level, derived from LEVEL_THRESHOLDS so the
 * legend can never drift from the colors: 0 → "0", 1 → "1–2", 2 → "3–5",
 * 3 → "6+".
 */
export function getLevelRange(level: Level): string {
  const min = LEVEL_THRESHOLDS[level]
  if (level === 0) return String(min)
  if (level === 3) return `${min}+`
  const max = LEVEL_THRESHOLDS[(level + 1) as 2 | 3] - 1
  return min === max ? String(min) : `${min}–${max}`
}