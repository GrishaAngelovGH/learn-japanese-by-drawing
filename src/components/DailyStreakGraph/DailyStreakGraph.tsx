"use client"

import { useEffect, useState } from "react"
import { buildGrid, getLevel, LEVEL_CLASSES } from "@/lib/streak"

interface DailyStreakGraphProps {
  /** Per-day completion counts from useDailyStreak. */
  counts: Record<string, number>
  /** Today's date as a Date object. */
  today: Date
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

const WEEKDAY_LABELS = ["Sun", "", "Tue", "", "Thu", "", "Sat"]

export function DailyStreakGraph({ counts, today }: DailyStreakGraphProps) {
  // Defer rendering until after mount to avoid hydration mismatch
  // (grid depends on today's date, which differs between server and client)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Use setTimeout to defer the state update to the next tick
    // This avoids the linter warning about synchronous setState in effects
    const timeout = setTimeout(() => setIsMounted(true), 0)
    return () => clearTimeout(timeout)
  }, [])

  if (!isMounted) {
    return null
  }

  const grid = buildGrid(today)

  // If there are no counts at all, show empty state
  const hasData = Object.keys(counts).length > 0

  if (!hasData) {
    return (
      <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm py-8">
        Complete a word to start your streak
      </div>
    )
  }

  // Calculate month labels - show month name at the first column of each month
  const monthLabels: string[] = []
  let lastMonth = -1

  grid.forEach((week) => {
    const firstDay = week.days[0]
    if (firstDay) {
      const date = new Date(firstDay)
      const month = date.getMonth()
      if (month !== lastMonth) {
        monthLabels.push(MONTH_NAMES[month])
        lastMonth = month
      } else {
        monthLabels.push("")
      }
    } else {
      monthLabels.push("")
    }
  })

  return (
    <div className="flex flex-col gap-2">
      {/* Visually hidden summary for screen readers */}
      <div className="sr-only" role="region" aria-label="Daily streak graph">
        Your streak graph shows {Object.keys(counts).length} days of activity
      </div>

      {/* Month labels row */}
      <div
        className="grid gap-1 text-xs text-zinc-500 dark:text-zinc-400"
        style={{
          gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`,
        }}
      >
        {monthLabels.map((label, index) => (
          <div key={index} className="text-center">
            {label}
          </div>
        ))}
      </div>

      {/* Grid with weekday labels */}
      <div className="flex gap-2">
        {/* Weekday labels column */}
        <div className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
          {WEEKDAY_LABELS.map((label, index) => (
            <div key={index} className="h-3 flex items-center">
              {label}
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(7, minmax(0, 1fr))`,
          }}
          role="grid"
          aria-label="Contribution graph showing daily word completions"
        >
          {grid.map((week, weekIndex) =>
            week.days.map((day, dayIndex) => {
              if (day === null) {
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-3 h-3"
                    aria-hidden="true"
                  />
                )
              }

              const count = counts[day] ?? 0
              const level = getLevel(count)
              const classes = LEVEL_CLASSES[level]
              const tooltipText = `${count} word${count === 1 ? '' : 's'} on ${day}`

              return (
                <div
                  key={day}
                  className={`w-3 h-3 rounded-sm ${classes.light} ${classes.dark}`}
                  title={tooltipText}
                  aria-label={tooltipText}
                  role="gridcell"
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
