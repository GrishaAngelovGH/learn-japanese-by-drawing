"use client"

import { useEffect, useRef, useState } from "react"
import {
  buildGrid,
  getLevel,
  getLevelRange,
  getMonthLabels,
  LEVEL_CLASSES,
  type Level,
} from "@/lib/streak"

interface DailyStreakGraphProps {
  /** Per-day completion counts from useDailyStreak. */
  counts: Record<string, number>
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

/** Like GitHub, only label Mon / Wed / Fri; other rows stay blank. */
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]

/** Width of the weekday label column; wide enough for "Mon" at text-xs. */
const LABEL_COL_PX = 32
/** Height of the month label row; fits one text-xs line (16px). */
const MONTH_ROW_PX = 16
/** Cells stretch to fill the card but never shrink below this; narrower
 *  screens scroll horizontally instead (starting at the latest week). */
const MIN_CELL_PX = 10
const GAP_PX = 4

export function DailyStreakGraph({ counts }: DailyStreakGraphProps) {
  // Defer computing today until after mount to avoid prerendering with
  // Date.now() (Next.js unstable value warning).
  const [today, setToday] = useState<Date | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setToday(new Date()), 0)
    return () => clearTimeout(timeout)
  }, [])

  if (!today) {
    return null
  }

  return <Graph today={today} counts={counts} />
}

interface GraphProps {
  today: Date
  counts: Record<string, number>
}

function Graph({ today, counts }: GraphProps) {
  const grid = buildGrid(today)
  const scrollRef = useRef<HTMLDivElement>(null)

  // On narrow screens start at the most recent week.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  // If there are no counts at all, show empty state
  const hasData = Object.keys(counts).length > 0

  if (!hasData) {
    return (
      <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm py-8">
        Complete a word to start your streak
      </div>
    )
  }

  // Month name above the first week that starts in that month (like GitHub).
  const monthLabels = getMonthLabels(grid)

  return (
    <div className="flex flex-col gap-2">
      {/* Visually hidden summary for screen readers */}
      <div className="sr-only" role="region" aria-label="Daily streak graph">
        Your streak graph shows {Object.keys(counts).length} days of activity
      </div>

      {/* Single grid: everything aligned together. Cells share the width. */}
      <div ref={scrollRef} className="overflow-x-auto pr-4">
        <div
          className="grid"
          style={{
            columnGap: GAP_PX,
            rowGap: GAP_PX,
            gridTemplateColumns: `${LABEL_COL_PX}px repeat(${grid.length}, minmax(${MIN_CELL_PX}px, 1fr))`,
            gridTemplateRows: `${MONTH_ROW_PX}px repeat(7, auto)`,
            minWidth: LABEL_COL_PX + grid.length * (MIN_CELL_PX + GAP_PX),
          }}
          role="grid"
          aria-label="Contribution graph showing daily word completions"
        >
          {/* Top-left empty corner */}
          <div style={{ gridColumn: 1, gridRow: 1 }} aria-hidden="true" />

          {/* Month labels row. Left-aligned so the name starts at its column and
            may overflow to the right into the (empty) cells' header row. */}
          {monthLabels.map((month, weekIndex) =>
            month === -1 ? null : (
              <div
                key={weekIndex}
                className="text-xs leading-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400"
                style={{ gridColumn: weekIndex + 2, gridRow: 1 }}
              >
                {MONTH_NAMES[month]}
              </div>
            )
          )}

          {/* Weekday labels column (column 1, rows 2 to 8). Centered on the
            12px row, so line-height is pinned to the row height. */}
          {WEEKDAY_LABELS.map((label, dayIndex) =>
            label ? (
              <div
                key={dayIndex}
                className="sticky left-0 z-10 bg-white dark:bg-zinc-800 text-xs leading-none text-zinc-500 dark:text-zinc-400 flex items-center"
                style={{ gridColumn: 1, gridRow: dayIndex + 2 }}
              >
                {label}
              </div>
            ) : null
          )}

          {/* Squares grid (columns 2 to 54, rows 2 to 8) */}
          {grid.map((week, weekIndex) =>
            week.days.map((day, dayIndex) => {
              if (day === null) {
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-full aspect-square"
                    aria-hidden="true"
                    style={{
                      gridColumn: weekIndex + 2,
                      gridRow: dayIndex + 2,
                    }}
                  />
                )
              }

              const count = counts[day] ?? 0
              const level = getLevel(count)
              const classes = LEVEL_CLASSES[level]
              const tooltipText =
                count > 0
                  ? `${count} word${count === 1 ? '' : 's'} on ${day}`
                  : day

              return (
                <div
                  key={day}
                  className={`w-full aspect-square rounded ${classes.light} ${classes.dark}`}
                  title={tooltipText}
                  aria-label={tooltipText}
                  role="gridcell"
                  style={{
                    gridColumn: weekIndex + 2,
                    gridRow: dayIndex + 2,
                  }}
                />
              )
            })
          )}
        </div>
      </div>

      {/* Legend: exact word counts per color, from the same thresholds as the cells */}
      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-1 whitespace-nowrap text-xs leading-4 text-zinc-500 dark:text-zinc-400"
        aria-label="Legend: words completed per day"
      >
        <span>Words per day:</span>
        {([0, 1, 2, 3] as Level[]).map((level) => (
          <span key={level} className="inline-flex items-center gap-1.5">
            <span
              className={`w-3 h-3 shrink-0 rounded ${LEVEL_CLASSES[level].light} ${LEVEL_CLASSES[level].dark}`}
              aria-hidden="true"
            />
            <span className="shrink-0">{getLevelRange(level)}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
