import { describe, it, expect } from "vitest"
import { buildGrid, getMonthLabels, DAYS_SHOWN } from "./grid"

const local = (y: number, m: number, d: number) => new Date(y, m - 1, d)
const keysOf = (today: Date) =>
  buildGrid(today).flatMap((w) => w.days).filter((d): d is string => d !== null)

describe("grid", () => {
  describe("buildGrid", () => {
    it("shows exactly one year (365 days) ending on today", () => {
      for (const today of [
        local(2026, 11, 1), // Sun
        local(2026, 11, 2), // Mon
        local(2026, 11, 7), // Sat
        local(2026, 12, 15),
      ]) {
        const keys = keysOf(today)
        expect(keys).toHaveLength(DAYS_SHOWN)
        expect(keys[keys.length - 1]).toBe(
          `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
        )
      }
    })

    it("has 7 rows per week and at most 54 columns", () => {
      const grid = buildGrid(local(2026, 11, 2))
      grid.forEach((w) => expect(w.days).toHaveLength(7))
      expect(grid.length).toBeLessThanOrEqual(54)
    })

    it("puts every day in the row of its weekday", () => {
      buildGrid(local(2026, 11, 2)).forEach((w) =>
        w.days.forEach((key, row) => {
          if (!key) return
          const [y, m, d] = key.split("-").map(Number)
          expect(new Date(y, m - 1, d).getDay()).toBe(row)
        })
      )
    })

    it("first column is partial when the year starts mid-week, last when today is", () => {
      // Mon 2 Nov 2026 -> window starts Mon 3 Nov 2025 (row 1)
      const grid = buildGrid(local(2026, 11, 2))
      expect(grid[0].days).toEqual([
        null, "2025-11-03", "2025-11-04", "2025-11-05", "2025-11-06", "2025-11-07", "2025-11-08",
      ])
      expect(grid[grid.length - 1].days).toEqual([
        "2026-11-01", "2026-11-02", null, null, null, null, null,
      ])
    })

    it("has no skipped or repeated days (DST safe, leap year included)", () => {
      const keys = keysOf(local(2024, 3, 1))
      expect(new Set(keys).size).toBe(keys.length)
      expect(keys).toContain("2024-02-29")
    })
  })

  describe("getMonthLabels", () => {
    it("labels a month above the first week that starts in it (Jan 2026 -> Sun 4 Jan)", () => {
      const grid = buildGrid(local(2026, 11, 2))
      const col = getMonthLabels(grid).indexOf(0)
      expect(grid[col].days[0]).toBe("2026-01-04")
    })

    it("the top square of every labelled column is in the labelled month", () => {
      const grid = buildGrid(local(2026, 11, 2))
      getMonthLabels(grid).forEach((m, i) => {
        if (m === -1) return
        const first = grid[i].days.find(Boolean)!
        expect(parseInt(first.substring(5, 7), 10) - 1).toBe(m)
      })
    })

    it("never places two labels closer than 3 columns", () => {
      for (let day = 1; day <= 31; day++) {
        const labels = getMonthLabels(buildGrid(local(2026, 10, day)))
        const cols = labels.flatMap((l, i) => (l === -1 ? [] : [i]))
        for (let i = 1; i < cols.length; i++) {
          expect(cols[i] - cols[i - 1]).toBeGreaterThanOrEqual(3)
        }
      }
    })
  })
})