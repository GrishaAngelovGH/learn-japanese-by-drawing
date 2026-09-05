import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { setTourSeen, useTourSeen } from "./useTourSeen"

describe("useTourSeen", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("is not seen until marked", () => {
    const { result } = renderHook(() => useTourSeen("t-unseen"))
    expect(result.current.seen).toBe(false)
  })

  it("persists once marked and updates subscribers", () => {
    const { result } = renderHook(() => useTourSeen("t-mark"))
    act(() => result.current.markSeen())
    expect(result.current.seen).toBe(true)
    expect(localStorage.getItem("learn-japanese:tour:t-mark")).toBe("1")
  })

  it("reads an existing flag from localStorage", () => {
    localStorage.setItem("learn-japanese:tour:t-existing", "1")
    const { result } = renderHook(() => useTourSeen("t-existing"))
    expect(result.current.seen).toBe(true)
  })

  it("tracks tours independently", () => {
    const a = renderHook(() => useTourSeen("t-a"))
    const b = renderHook(() => useTourSeen("t-b"))
    act(() => a.result.current.markSeen())
    expect(a.result.current.seen).toBe(true)
    expect(b.result.current.seen).toBe(false)
  })

  it("setTourSeen can clear a seen flag", () => {
    const { result } = renderHook(() => useTourSeen("t-clear"))
    act(() => setTourSeen("t-clear", true))
    expect(result.current.seen).toBe(true)
    act(() => setTourSeen("t-clear", false))
    expect(result.current.seen).toBe(false)
    expect(localStorage.getItem("learn-japanese:tour:t-clear")).toBeNull()
  })
})
