import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { DailyStreakGraph } from "./DailyStreakGraph"

describe("DailyStreakGraph", () => {
  it("renders empty state when there are no counts", async () => {
    render(
      <DailyStreakGraph counts={{}} />
    )
    await waitFor(() => {
      expect(screen.getByText("Complete a word to start your streak")).toBeInTheDocument()
    })
  })

  it("renders the expected number of cells", async () => {
    const { container } = render(
      <DailyStreakGraph counts={{ "2026-11-01": 1 }} />
    )
    await waitFor(() => {
      // Exactly one year of days (365), like GitHub
      const cells = container.querySelectorAll('[role="gridcell"]')
      expect(cells.length).toBe(365)
    })
  })

  it("renders month labels above the grid", async () => {
    render(
      <DailyStreakGraph
        counts={{ "2026-11-01": 1 }}

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

      />
    )
    await waitFor(() => {
      // GitHub-style: only Mon / Wed / Fri are labelled
      expect(screen.getByText("Mon")).toBeInTheDocument()
      expect(screen.getByText("Wed")).toBeInTheDocument()
      expect(screen.getByText("Fri")).toBeInTheDocument()
      expect(screen.queryByText("Sun")).not.toBeInTheDocument()
    })
  })

  it("colors cells by level", async () => {
    const { container } = render(
      <DailyStreakGraph
        counts={{
          "2026-10-29": 1, // level 1
          "2026-10-30": 3, // level 2
          "2026-10-31": 6, // level 3
        }}

      />
    )
    await waitFor(() => {
      // Check that different levels have different classes
      const cells = container.querySelectorAll('[role="gridcell"]')
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

      />
    )
    await waitFor(() => {
      const cells = container.querySelectorAll('[role="gridcell"]')
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

      />
    )
    await waitFor(() => {
      const cells = container.querySelectorAll('[role="gridcell"]')
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

      />
    )
    await waitFor(() => {
      const cells = container.querySelectorAll('[role="gridcell"]')
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

      />
    )
    await waitFor(() => {
      const emptyCells = container.querySelectorAll('[role="grid"] [aria-hidden="true"]')
      // The grid includes null cells for future dates, which should be aria-hidden
      expect(emptyCells.length).toBeGreaterThan(0)
    })
  })

  it("has visually hidden summary for screen readers", async () => {
    render(
      <DailyStreakGraph
        counts={{ "2026-11-01": 1 }}

      />
    )
    await waitFor(() => {
      const summary = screen.getByRole("region", { name: /Daily streak graph/ })
      expect(summary).toBeInTheDocument()
      expect(summary).toHaveClass("sr-only")
    })
  })

  it("shows the exact word counts for each color in the legend", async () => {
    render(<DailyStreakGraph counts={{ "2026-10-31": 1 }} />)
    await waitFor(() => {
      expect(screen.getByText("Words per day:")).toBeInTheDocument()
      for (const range of ["0", "1–2", "3–5", "6+"]) {
        expect(screen.getByText(range)).toBeInTheDocument()
      }
    })
  })
})