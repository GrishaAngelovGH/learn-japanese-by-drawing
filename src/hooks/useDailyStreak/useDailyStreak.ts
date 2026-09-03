/**
 * Tracks per-day whole-word completion counts in localStorage.
 *
 * A day's count is incremented each time a word transitions to complete
 * (heard + written + pronounced) on that local calendar day.
 *
 * Key: `learn-japanese:daily-streak`
 * Value: JSON object mapping `YYYY-MM-DD` -> number of words completed that day.
 */
import { useCallback, useEffect, useMemo, useState } from "react"
import { calculateStreak, toDateKey } from "@/lib/streak"

const STORAGE_KEY = "learn-japanese:daily-streak"

type Options = {
  /** Injectable clock (ms since epoch) for deterministic tests. Defaults to Date.now. */
  now?: () => number
}

function loadCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {}
    }
    const counts: Record<string, number> = {}
    for (const [key, value] of Object.entries(
      parsed as Record<string, unknown>
    )) {
      const count = typeof value === "number" ? value : 0
      counts[String(key)] = count
    }
    return counts
  } catch {
    // Silently ignore corrupt localStorage
    return {}
  }
}

function persist(counts: Record<string, number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts))
  } catch {
    // Silently ignore if localStorage is unavailable
  }
}

export function useDailyStreak(options: Options = {}) {
  const { now: nowOption } = options
  const now = useMemo(
    () => nowOption ?? (() => Date.now()),
    [nowOption]
  )

  // Defer reading localStorage until after hydration so the server and
  // client render identical initial HTML (empty counts).
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [currentStreakValue, setCurrentStreakValue] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => {
      setCounts(loadCounts())
    }, 0)
    return () => clearTimeout(id)
  }, [])

  const today = useCallback((): string => toDateKey(new Date(now())), [now])

  // Recompute streak after mount so Date.now() is not evaluated during
  // prerender (Next.js unstable value warning).
  useEffect(() => {
    const id = setTimeout(() => {
      setCurrentStreakValue(calculateStreak(counts, today()))
    }, 0)
    return () => clearTimeout(id)
  }, [counts, today])

  const recordCompletion = useCallback(
    (dateKey?: string) => {
      const key = dateKey ?? today()
      setCounts((prev) => {
        const next = { ...prev, [key]: (prev[key] ?? 0) + 1 }
        persist(next)
        return next
      })
    },
    [today]
  )

  const getCount = useCallback(
    (dateKey: string): number => counts[dateKey] ?? 0,
    [counts]
  )

  const reset = useCallback(() => {
    setCounts({})
    persist({})
  }, [])

  return {
    counts,
    getCount,
    currentStreak: currentStreakValue,
    today,
    recordCompletion,
    reset
  }
}
