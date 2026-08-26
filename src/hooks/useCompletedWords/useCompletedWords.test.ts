import { renderHook, act } from "@testing-library/react"
import { useCompletedWords } from "./index"

const STORAGE_KEY = "learn-japanese:completed-words"

describe("useCompletedWords", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY)
  })

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY)
  })

  it("starts with no actions completed", () => {
    const { result } = renderHook(() => useCompletedWords())
    expect(result.current.completed).toEqual(new Set())
    expect(result.current.isCompleted("breakfast")).toBe(false)
    expect(result.current.isHeard("breakfast")).toBe(false)
    expect(result.current.isWritten("breakfast")).toBe(false)
    expect(result.current.isPronounced("breakfast")).toBe(false)
  })

  it("marks each action independently and completes only when all three are done", () => {
    const { result } = renderHook(() => useCompletedWords())

    act(() => {
      result.current.markWritten("breakfast")
    })
    expect(result.current.isWritten("breakfast")).toBe(true)
    expect(result.current.isCompleted("breakfast")).toBe(false)

    act(() => {
      result.current.markHeard("breakfast")
    })
    expect(result.current.isCompleted("breakfast")).toBe(false)

    act(() => {
      result.current.markPronounced("breakfast")
    })
    expect(result.current.isCompleted("breakfast")).toBe(true)

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      breakfast: { heard: true, written: true, pronounced: true }
    })
  })

  it("persists across hook re-mounts", async () => {
    const { result } = renderHook(() => useCompletedWords())

    act(() => {
      result.current.markPronounced("rice")
    })

    // Remount the hook; seed effect is deferred via setTimeout, so flush it.
    const { result: result2 } = renderHook(() => useCompletedWords())
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(result2.current.isPronounced("rice")).toBe(true)
    expect(result2.current.isCompleted("rice")).toBe(false)
  })

  it("is idempotent", () => {
    const { result } = renderHook(() => useCompletedWords())

    act(() => {
      result.current.markHeard("tea")
      result.current.markHeard("tea")
    })

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      tea: { heard: true, written: false, pronounced: false }
    })
  })

  it("handles multiple completed words independently", () => {
    const { result } = renderHook(() => useCompletedWords())

    act(() => {
      result.current.markHeard("breakfast")
      result.current.markWritten("breakfast")
      result.current.markPronounced("breakfast")
      result.current.markWritten("rice")
    })

    expect(result.current.isCompleted("breakfast")).toBe(true)
    expect(result.current.isCompleted("rice")).toBe(false)
    expect(result.current.isWritten("rice")).toBe(true)
    expect(Array.from(result.current.completed)).toEqual(["breakfast"])
  })

  it("handles corrupt localStorage gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "not-valid-json")

    const { result } = renderHook(() => useCompletedWords())
    expect(result.current.completed).toEqual(new Set())
    expect(result.current.isCompleted("breakfast")).toBe(false)
  })
})
