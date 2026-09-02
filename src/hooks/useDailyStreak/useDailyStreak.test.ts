import { renderHook, act } from "@testing-library/react"
import { useDailyStreak } from "./index"

const STORAGE_KEY = "learn-japanese:daily-streak"

describe("useDailyStreak", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY)
  })

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY)
  })

  it("starts with no counts", () => {
    const { result } = renderHook(() => useDailyStreak())
    expect(result.current.counts).toEqual({})
    expect(result.current.getCount("2026-06-15")).toBe(0)
    expect(result.current.currentStreak).toBe(0)
  })

  it("records a completion for today and persists it", () => {
    const now = () => new Date(2026, 5, 15, 12, 0).getTime() // 2026-06-15
    const { result } = renderHook(() => useDailyStreak({ now }))

    act(() => {
      result.current.recordCompletion()
    })

    expect(result.current.getCount("2026-06-15")).toBe(1)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      "2026-06-15": 1
    })
  })

  it("accumulates multiple completions on the same day", () => {
    const now = () => new Date(2026, 5, 15, 12, 0).getTime()
    const { result } = renderHook(() => useDailyStreak({ now }))

    act(() => {
      result.current.recordCompletion()
      result.current.recordCompletion()
      result.current.recordCompletion()
    })

    expect(result.current.getCount("2026-06-15")).toBe(3)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      "2026-06-15": 3
    })
  })

  it("records completions for a specific date key", () => {
    const now = () => new Date(2026, 5, 15, 12, 0).getTime()
    const { result } = renderHook(() => useDailyStreak({ now }))

    act(() => {
      result.current.recordCompletion("2026-06-14")
      result.current.recordCompletion("2026-06-15")
    })

    expect(result.current.getCount("2026-06-14")).toBe(1)
    expect(result.current.getCount("2026-06-15")).toBe(1)
  })

  it("loads persisted counts across remounts", async () => {
    const now = () => new Date(2026, 5, 15, 12, 0).getTime()
    const { result } = renderHook(() => useDailyStreak({ now }))

    act(() => {
      result.current.recordCompletion()
    })

    // Remount the hook; seed effect is deferred via setTimeout, so flush it.
    const { result: result2 } = renderHook(() => useDailyStreak({ now }))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(result2.current.getCount("2026-06-15")).toBe(1)
  })

  it("calculates current streak from stored counts", () => {
    const now = () => new Date(2026, 5, 15, 12, 0).getTime() // 2026-06-15
    const { result } = renderHook(() => useDailyStreak({ now }))

    act(() => {
      result.current.recordCompletion("2026-06-13")
      result.current.recordCompletion("2026-06-14")
      result.current.recordCompletion("2026-06-15")
    })

    expect(result.current.currentStreak).toBe(3)
  })

  it("streak breaks on a gap", () => {
    const now = () => new Date(2026, 5, 15, 12, 0).getTime() // 2026-06-15
    const { result } = renderHook(() => useDailyStreak({ now }))

    act(() => {
      result.current.recordCompletion("2026-06-14")
      result.current.recordCompletion("2026-06-15")
    })

    expect(result.current.currentStreak).toBe(2)
  })

  it("falls back to yesterday when today has no completions", () => {
    const now = () => new Date(2026, 5, 15, 12, 0).getTime() // 2026-06-15
    const { result } = renderHook(() => useDailyStreak({ now }))

    act(() => {
      result.current.recordCompletion("2026-06-14")
    })

    expect(result.current.currentStreak).toBe(1)
  })

  it("reset clears all counts", () => {
    const now = () => new Date(2026, 5, 15, 12, 0).getTime()
    const { result } = renderHook(() => useDailyStreak({ now }))

    act(() => {
      result.current.recordCompletion("2026-06-15")
      result.current.reset()
    })

    expect(result.current.counts).toEqual({})
    expect(result.current.getCount("2026-06-15")).toBe(0)
    expect(localStorage.getItem(STORAGE_KEY)).toBe("{}")
  })

  it("handles corrupt localStorage gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "not-valid-json")

    const { result } = renderHook(() => useDailyStreak())
    expect(result.current.counts).toEqual({})
    expect(result.current.currentStreak).toBe(0)
  })

  it("initial render returns empty counts (hydration safe)", () => {
    const { result } = renderHook(() => useDailyStreak())
    expect(result.current.counts).toEqual({})
  })
})
