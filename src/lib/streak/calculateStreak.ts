import { addDays } from './dates'

export type StreakCounts = Record<string, number>

/**
 * Consecutive counting days ending today (or yesterday if today has 0).
 *
 * A day "counts" when its stored count is >= 1. We walk backward from the
 * starting day until we hit a day with 0 or no completions.
 */
export function calculateStreak(counts: StreakCounts, today: string): number {
  let streak = 0
  let dateKey = today

  // If today has no completions, the streak can only extend back from yesterday.
  if ((counts[dateKey] ?? 0) < 1) {
    dateKey = addDays(dateKey, -1)
  }

  while ((counts[dateKey] ?? 0) >= 1) {
    streak++
    dateKey = addDays(dateKey, -1)
  }

  return streak
}
