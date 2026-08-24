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

  it("starts with empty completed set", () => {
    const { result } = renderHook(() => useCompletedWords())
    expect(result.current.completed).toEqual(new Set())
    expect(result.current.isCompleted("breakfast")).toBe(false)
  })

  it("marks a word as completed and persists it", () => {
    const { result } = renderHook(() => useCompletedWords())

    act(() => {
      result.current.markCompleted("breakfast")
    })

    expect(result.current.isCompleted("breakfast")).toBe(true)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(["breakfast"])
  })

  it("persists across hook re-mounts", () => {
    const { result } = renderHook(() => useCompletedWords())

    act(() => {
      result.current.markCompleted("rice")
    })

    // Remount the hook
    const { result: result2 } = renderHook(() => useCompletedWords())
    expect(result2.current.isCompleted("rice")).toBe(true)
  })

  it("does not duplicate completed words", () => {
    const { result } = renderHook(() => useCompletedWords())

    act(() => {
      result.current.markCompleted("breakfast")
      result.current.markCompleted("breakfast")
    })

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(["breakfast"])
  })

  it("handles multiple completed words", () => {
    const { result } = renderHook(() => useCompletedWords())

    act(() => {
      result.current.markCompleted("breakfast")
      result.current.markCompleted("rice")
      result.current.markCompleted("water")
    })

    expect(result.current.isCompleted("breakfast")).toBe(true)
    expect(result.current.isCompleted("rice")).toBe(true)
    expect(result.current.isCompleted("water")).toBe(true)
    expect(result.current.isCompleted("tea")).toBe(false)
  })

  it("handles corrupt localStorage gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "not-valid-json")

    const { result } = renderHook(() => useCompletedWords())
    expect(result.current.completed).toEqual(new Set())
  })
})
