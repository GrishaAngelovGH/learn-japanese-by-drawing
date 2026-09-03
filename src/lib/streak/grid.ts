/**
 * Builds a GitHub-style week grid for the streak graph.
 *
 * Shows exactly one year: the 365 days ending on `today`, arranged in week
 * columns (Sunday–Saturday rows). The first column is partial (days before
 * the window are null) and so is the last (days after today are null).
 */

import { addDays, toDateKey } from "./dates"

export interface Week {
  /** YYYY-MM-DD keys for each day in the week (Sun–Sat). Missing days are null. */
  days: (string | null)[]
}

/** Number of days shown, including today. */
export const DAYS_SHOWN = 365

/**
 * Builds the week columns covering the last 365 days ending on `today`.
 *
 * Rows are days of the week (Sunday = row 0, Saturday = row 6). Dates are
 * stepped with calendar arithmetic (not +24h) so DST changes can never skip
 * or repeat a day.
 *
 * @param today - Local date as a Date object.
 */
export function buildGrid(today: Date): Week[] {
  const todayKey = toDateKey(today)
  const startKey = addDays(todayKey, -(DAYS_SHOWN - 1))

  // Sunday on or before the first shown day, to the Sunday of today's week.
  const [sy, sm, sd] = startKey.split("-").map(Number)
  const startDow = new Date(sy, sm - 1, sd).getDay()
  const firstSunday = addDays(startKey, -startDow)
  const lastSunday = addDays(todayKey, -today.getDay())

  const weeks: Week[] = []
  for (let sunday = firstSunday; sunday <= lastSunday; sunday = addDays(sunday, 7)) {
    const days: (string | null)[] = []
    for (let d = 0; d < 7; d++) {
      const key = addDays(sunday, d)
      days.push(key >= startKey && key <= todayKey ? key : null)
    }
    weeks.push({ days })
  }
  return weeks
}

/**
 * Month label per week column, GitHub-style: a month's name sits above the
 * first column whose first day (Sunday) falls in that month. So the square at
 * the top of a labelled column is always in the labelled month.
 *
 * Returns the month index (0–11) per column, or -1 for no label. The first
 * column's label is dropped when the next label is closer than `minGap`
 * columns, so labels never overlap.
 */
export function getMonthLabels(weeks: Week[], minGap = 3): number[] {
  let prevMonth = -1
  const labels = weeks.map((week) => {
    const first = week.days.find((d) => d !== null)
    if (!first) return -1
    const month = parseInt(first.substring(5, 7), 10) - 1
    if (month === prevMonth) return -1
    prevMonth = month
    return month
  })

  const next = labels.findIndex((l, i) => i > 0 && l !== -1)
  if (labels[0] !== -1 && next !== -1 && next < minGap) labels[0] = -1
  return labels
}
