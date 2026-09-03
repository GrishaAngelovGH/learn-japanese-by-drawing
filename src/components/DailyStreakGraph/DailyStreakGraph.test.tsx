import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { DailyStreakGraph } from "./DailyStreakGraph"

describe("DailyStreakGraph", () => {
  it("renders empty state when there are no counts", async () => {
    render(
      <DailyStreakGraph counts={{}} today={new Date("2026-11-01")} />
    )
    await waitFor(() => {
      expect(screen.getByText("Complete a word to start your streak")).toBeInTheDocument()
    })
  })

  it("renders the expected number of cells", async () => {
    const { container } = render(
      <DailyStreakGraph
        counts={{ "2026-11-01": 1 }}
        today={new Date("2026-11-01")}
      />
    )
    await waitFor(() => {
      // Should have 53 weeks × 7 days = 371 cells
      const cells = container.querySelectorAll(".w-3.h-3")
      expect(cells.length).toBe(53 * 7)
    })
  })

  it("renders month labels above the grid", async () => {
    render(
      <DailyStreakGraph
        counts={{ "2026-11-01": 1 }}
        today={new Date("2026-11-01")}
      />
    )
    await waitFor(() => {
      // Should have month labels (abbreviated names)
      expect(screen.getAllByText("Nov").length).toBeGreaterThan(0)
    })
  })

  it("renders weekday labels to the left of the grid", async () => {
    render(
      <DailyStreakGraph
        counts={{ "2026-11-01": 1 }}
        today={new Date("2026-11-01")}
      />
    )
    await waitFor(() => {
      // Should have weekday labels (Sun, Tue, Thu, Sat)
      expect(screen.getByText("Sun")).toBeInTheDocument()
      expect(screen.getByText("Tue")).toBeInTheDocument()
      expect(screen.getByText("Thu")).toBeInTheDocument()
      expect(screen.getByText("Sat")).toBeInTheDocument()
    })
  })

  it("colors cells by level", async () => {
    const { container } = render(
      <DailyStreakGraph
        counts={{
          "2026-11-01": 1, // level 1
          "2026-11-02": 3, // level 2
          "2026-11-03": 6, // level 3
        }}
        today={new Date("2026-11-03")}
      />
    )
    await waitFor(() => {
      // Check that different levels have different classes
      const cells = container.querySelectorAll(".w-3.h-3")
      const hasLightGreen = Array.from(cells).some((cell) =>
        cell.classList.contains("bg-green-200")
      )
      const hasMediumGreen = Array.from(cells).some((cell) =>
        cell.classList.contains("bg-green-400")
      )
      const hasDarkGreen = Array.from(cells).some((cell) =>
        cell.classList.contains("bg-green-600")
      )

      expect(hasLightGreen).toBe(true)
      expect(hasMediumGreen).toBe(true)
      expect(hasDarkGreen).toBe(true)
    })
  })

  it("shows tooltips with count and date", async () => {
    const { container } = render(
      <DailyStreakGraph
        counts={{ "2026-11-01": 5 }}
        today={new Date("2026-11-01")}
      />
    )
    await waitFor(() => {
      const cells = container.querySelectorAll(".w-3.h-3")
      const cellWithCount = Array.from(cells).find(
        (cell) => cell.getAttribute("title")?.includes("2026-11-01")
      )

      expect(cellWithCount).toBeDefined()
      expect(cellWithCount?.getAttribute("title")).toContain("5 words")
    })
  })

  it("applies dark mode classes", async () => {
    const { container } = render(
      <DailyStreakGraph
        counts={{ "2026-11-01": 1 }}
        today={new Date("2026-11-01")}
      />
    )
    await waitFor(() => {
      const cells = container.querySelectorAll(".w-3.h-3")
      const hasDarkModeClass = Array.from(cells).some((cell) =>
        cell.classList.contains("dark:bg-green-900")
      )

      expect(hasDarkModeClass).toBe(true)
    })
  })

  it("adds aria-label to cells for screen readers", async () => {
    const { container } = render(
      <DailyStreakGraph
        counts={{ "2026-11-01": 5 }}
        today={new Date("2026-11-01")}
      />
    )
    await waitFor(() => {
      const cells = container.querySelectorAll(".w-3.h-3")
      const cellWithLabel = Array.from(cells).find(
        (cell) => cell.getAttribute("aria-label")?.includes("5 words")
      )

      expect(cellWithLabel).toBeDefined()
      expect(cellWithLabel?.getAttribute("aria-label")).toContain("2026-11-01")
    })
  })

  it("adds role attributes for semantic markup", async () => {
    const { container } = render(
      <DailyStreakGraph
        counts={{ "2026-11-01": 1 }}
        today={new Date("2026-11-01")}
      />
    )
    await waitFor(() => {
      const grid = container.querySelector('[role="grid"]')
      expect(grid).toBeInTheDocument()
      expect(grid?.getAttribute("aria-label")).toContain("Contribution graph")

      const cells = container.querySelectorAll('[role="gridcell"]')
      expect(cells.length).toBeGreaterThan(0)
    })
  })

  it("hides empty cells from screen readers", async () => {
    const { container } = render(
      <DailyStreakGraph
        counts={{ "2026-11-01": 1 }}
        today={new Date("2026-11-01")}
      />
    )
    await waitFor(() => {
      const emptyCells = container.querySelectorAll('.w-3.h-3[aria-hidden="true"]')
      // The grid includes null cells for future dates, which should be aria-hidden
      expect(emptyCells.length).toBeGreaterThan(0)
    })
  })

  it("has visually hidden summary for screen readers", async () => {
    render(
      <DailyStreakGraph
        counts={{ "2026-11-01": 1 }}
        today={new Date("2026-11-01")}
      />
    )
    await waitFor(() => {
      const summary = screen.getByRole("region", { name: /Daily streak graph/ })
      expect(summary).toBeInTheDocument()
      expect(summary).toHaveClass("sr-only")
    })
  })
})
