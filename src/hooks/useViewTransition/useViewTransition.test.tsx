import { renderHook, act } from "@testing-library/react"
import { vi } from "vitest"
import useViewTransition from "./index"
import { mockPush } from "@/test/setup"

const mockStartViewTransition = vi.fn((callback: () => void) => callback())

describe("useViewTransition", () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockStartViewTransition.mockClear()
    document.startViewTransition = mockStartViewTransition as unknown as Document["startViewTransition"]
    delete document.documentElement.dataset.vtDirection
    document.documentElement.classList.remove("vt-forward", "vt-back")
  })

  afterEach(() => {
    delete document.documentElement.dataset.vtDirection
    document.documentElement.classList.remove("vt-forward", "vt-back")
  })

  it("calls router.push with href when startViewTransition is available", () => {
    const { result } = renderHook(() => useViewTransition())

    act(() => {
      result.current.push("/practice?count=5", "forward")
    })

    expect(mockPush).toHaveBeenCalledWith("/practice?count=5")
  })

  it("sets vt-forward class on html element for forward navigation", () => {
    const { result } = renderHook(() => useViewTransition())

    act(() => {
      result.current.push("/practice?count=5", "forward")
    })

    expect(document.documentElement.classList.contains("vt-forward")).toBe(true)
  })

  it("sets vt-back class on html element for back navigation", () => {
    const { result } = renderHook(() => useViewTransition())

    act(() => {
      result.current.push("/", "back")
    })

    expect(document.documentElement.classList.contains("vt-back")).toBe(true)
  })

  it("falls back to router.push when startViewTransition is not available", () => {
    document.startViewTransition = undefined as unknown as Document["startViewTransition"]

    const { result } = renderHook(() => useViewTransition())

    act(() => {
      result.current.push("/practice?count=5", "forward")
    })

    expect(mockPush).toHaveBeenCalledWith("/practice?count=5")
    expect(mockStartViewTransition).not.toHaveBeenCalled()
  })

  it("invokes startViewTransition callback when available", () => {
    const { result } = renderHook(() => useViewTransition())

    act(() => {
      result.current.push("/practice?count=5", "forward")
    })

    expect(mockStartViewTransition).toHaveBeenCalledTimes(1)
  })
})
