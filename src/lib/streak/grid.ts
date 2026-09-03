/**
 * Builds a GitHub-style week grid for the streak graph.
 *
 * The grid spans approximately 365 days ending on `today`, organized into
 * week columns (Sunday–Saturday rows). The first column may be partial to
 * align with GitHub's layout (weeks always start on Sunday).
 */

import { toDateKey } from "./dates"

export interface Week {
  /** YYYY-MM-DD keys for each day in the week (Sun–Sat). Missing days are null. */
  days: (string | null)[]
}

/**
 * Builds a grid of weeks covering the last ~365 days ending on `today`.
 *
 * The grid is organized as week columns, with rows representing days of the
 * week (Sunday = row 0, Saturday = row 6). The first column may be partial
 * (null values) to align the grid so that weeks always start on Sunday.
 *
 * @param today - Local date as a Date object.
 * @returns Array of weeks, each with 7 days (Sunday–Saturday).
 */
export function buildGrid(today: Date): Week[] {
  const todayKey = toDateKey(today)
  const weeks: Week[] = []

  // Start from the Sunday 52 weeks before today
  // This gives us 53 columns total
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 52 * 7)

  // Find the Sunday on or before startDate
  const startDayOfWeek = startDate.getDay()
  const daysToSunday = startDayOfWeek
  startDate.setDate(startDate.getDate() - daysToSunday)

  // Build the grid column by column (week by week)
  let currentDate = new Date(startDate)
  while (true) {
    const week: Week = { days: [] }

    // Fill the week with 7 days (Sunday–Saturday)
    for (let i = 0; i < 7; i++) {
      const dateKey = toDateKey(currentDate)
      // Only include dates up to today
      if (dateKey <= todayKey) {
        week.days.push(dateKey)
      } else {
        week.days.push(null)
      }
      // Create a new Date for the next day to avoid mutating the object
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
    }

    weeks.push(week)

    // Stop if we've included today
    if (week.days.includes(todayKey)) {
      break
    }
  }

  return weeks
}
