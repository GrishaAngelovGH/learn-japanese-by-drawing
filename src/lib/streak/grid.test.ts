import { describe, it, expect } from "vitest"
import { buildGrid } from "./grid"

describe("grid", () => {
  describe("buildGrid", () => {
    it("returns 53 weeks by default", () => {
      const today = new Date("2026-11-01") // Sunday
      const grid = buildGrid(today)
      expect(grid.length).toBe(53)
    })

    it("ends on today regardless of day of week", () => {
      const today = new Date("2026-11-05") // Wednesday
      const grid = buildGrid(today)
      const lastWeek = grid[grid.length - 1]
      // Today should be in the last week
      expect(lastWeek.days).toContain("2026-11-05")
    })

    it("has 7 days per week", () => {
      const today = new Date("2026-11-01")
      const grid = buildGrid(today)
      grid.forEach((week) => {
        expect(week.days).toHaveLength(7)
      })
    })

    it("starts approximately 52 weeks before today", () => {
      const today = new Date("2026-11-01") // Sunday
      const grid = buildGrid(today)
      const firstWeek = grid[0]
      const firstDay = firstWeek.days[0]
      // Should be ~364 days before today
      const firstDate = new Date(firstDay!)
      const diffDays = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
      expect(diffDays).toBe(364) // 52 weeks * 7 days
    })

    it("handles Sunday as today (no alignment needed)", () => {
      const today = new Date("2026-11-01") // Sunday
      const grid = buildGrid(today)
      const lastWeek = grid[grid.length - 1]
      // Today should be in the last week
      expect(lastWeek.days).toContain("2026-11-01")
    })

    it("handles Monday as today (aligns to previous Sunday)", () => {
      const today = new Date("2026-11-02") // Monday
      const grid = buildGrid(today)
      const lastWeek = grid[grid.length - 1]
      // Today should be in the last week
      expect(lastWeek.days).toContain("2026-11-02")
    })

    it("handles Saturday as today (aligns to previous Sunday)", () => {
      const today = new Date("2026-11-07") // Saturday
      const grid = buildGrid(today)
      const lastWeek = grid[grid.length - 1]
      // Today should be in the last week
      expect(lastWeek.days).toContain("2026-11-07")
    })

    it("crosses month boundaries correctly", () => {
      const today = new Date("2026-12-15") // Wednesday
      const grid = buildGrid(today)
      // Check that we have dates from different months
      const firstWeek = grid[0]
      const lastWeek = grid[grid.length - 1]
      expect(firstWeek.days[0]).toContain("2025-12") // Started in December 2025
      // Today should be in the last week
      expect(lastWeek.days).toContain("2026-12-15")
    })

    it("handles leap year correctly", () => {
      const today = new Date("2024-03-01") // Friday (leap year)
      const grid = buildGrid(today)
      // Should include February 29, 2024
      const hasLeapDay = grid.some((week) =>
        week.days.some((day) => day === "2024-02-29")
      )
      expect(hasLeapDay).toBe(true)
    })

    it("produces sequential dates within each week", () => {
      const today = new Date("2026-11-01")
      const grid = buildGrid(today)
      const firstWeek = grid[0]
      for (let i = 0; i < 6; i++) {
        const current = new Date(firstWeek.days[i]!)
        const next = new Date(firstWeek.days[i + 1]!)
        const diffDays = (next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
        expect(diffDays).toBe(1)
      }
    })

    it("produces sequential dates between weeks", () => {
      const today = new Date("2026-11-01")
      const grid = buildGrid(today)
      for (let i = 0; i < grid.length - 1; i++) {
        const lastDayOfWeek = new Date(grid[i].days[6]!)
        const firstDayOfNextWeek = new Date(grid[i + 1].days[0]!)
        const diffDays = (firstDayOfNextWeek.getTime() - lastDayOfWeek.getTime()) / (1000 * 60 * 60 * 24)
        expect(diffDays).toBe(1)
      }
    })

    it("has correct total cell count (53 weeks × 7 days)", () => {
      const today = new Date("2026-11-01")
      const grid = buildGrid(today)
      const totalCells = grid.reduce((sum, week) => sum + week.days.length, 0)
      expect(totalCells).toBe(53 * 7)
    })
  })
})
