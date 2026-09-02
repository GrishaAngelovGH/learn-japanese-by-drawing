/**
 * Pure date helpers for streak calculation.
 *
 * All keys are local `YYYY-MM-DD` strings built from local year/month/day
 * parts. We never use `toISOString()` because UTC would shift late-evening
 * local completions onto the wrong calendar day.
 */

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Add `n` days to a `YYYY-MM-DD` key, rolling over month/year boundaries
 * (and leap years) automatically via the Date constructor.
 */
export function addDays(dateKey: string, n: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d + n)
  return toDateKey(date)
}
