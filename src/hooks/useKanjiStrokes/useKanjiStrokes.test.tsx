import { StrictMode } from "react"
import { renderHook, act } from "@testing-library/react"
import { vi } from "vitest"
import { useKanjiStrokes } from "./index"
import { getStrokePaths } from "@/lib/kanjivg"

vi.mock("@/lib/kanjivg", () => ({
  getStrokePaths: vi.fn()
}))

const mockGetStrokePaths = vi.mocked(getStrokePaths)

const stroke = (d: string) => ({ strokeNumber: 1, d, type: "㇐" })

describe("useKanjiStrokes", () => {
  beforeEach(() => {
    mockGetStrokePaths.mockReset()
  })

  it("loads strokes for a character and reports ready status", async () => {
    mockGetStrokePaths.mockResolvedValue({ ok: true, strokes: [stroke("M1,1")] })

    const { result } = renderHook(() => useKanjiStrokes(["一"]))

    expect(result.current.statusByChar["一"]).toBe("loading")

    // Flush the async fetch + state update so strokesByChar is populated
    await act(async () => { })

    expect(mockGetStrokePaths).toHaveBeenCalledTimes(1)
    expect(result.current.strokesByChar["一"]).toEqual([stroke("M1,1")])
    expect(result.current.statusByChar["一"]).toBe("ready")
  })

  it("does not refetch a character already loaded", async () => {
    mockGetStrokePaths.mockResolvedValue({ ok: true, strokes: [stroke("M1,1")] })

    const { result, rerender } = renderHook(
      ({ chars }) => useKanjiStrokes(chars),
      { initialProps: { chars: ["一"] } }
    )

    await act(async () => { })
    expect(mockGetStrokePaths).toHaveBeenCalledTimes(1)

    rerender({ chars: ["一"] })

    // Flush async fetch + state update after rerender
    await act(async () => { })

    expect(mockGetStrokePaths).toHaveBeenCalledTimes(1)
    expect(result.current.strokesByChar["一"]).toEqual([stroke("M1,1")])
  })

  it("reports missing status for characters without stroke data", async () => {
    mockGetStrokePaths.mockResolvedValue({ ok: false, reason: "missing" })

    const { result } = renderHook(() => useKanjiStrokes(["あ"]))

    // Flush async fetch so statusByChar is set to "missing"
    await act(async () => { })

    expect(result.current.statusByChar["あ"]).toBe("missing")
    expect(result.current.strokesByChar["あ"]).toBeUndefined()
  })

  it("reports error status and retries on a later render", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => { })

    mockGetStrokePaths
      .mockResolvedValueOnce({ ok: false, reason: "error" })
      .mockResolvedValue({ ok: true, strokes: [stroke("M1,1")] })

    const { result, rerender } = renderHook(
      ({ chars }) => useKanjiStrokes(chars),
      { initialProps: { chars: ["一"] } }
    )

    // Flush async fetch so statusByChar is set to "error"
    await act(async () => { })

    expect(result.current.statusByChar["一"]).toBe("error")
    expect(mockGetStrokePaths).toHaveBeenCalledTimes(1)

    rerender({ chars: ["一"] })

    // Flush async fetch + state update after retry
    await act(async () => { })

    expect(mockGetStrokePaths).toHaveBeenCalledTimes(2)
    expect(result.current.statusByChar["一"]).toBe("ready")
    expect(result.current.strokesByChar["一"]).toEqual([stroke("M1,1")])

    vi.restoreAllMocks()
  })

  it("loads and caches under React Strict Mode", async () => {
    mockGetStrokePaths.mockResolvedValue({ ok: true, strokes: [stroke("M1,1")] })

    const { result } = renderHook(() => useKanjiStrokes(["一"]), {
      wrapper: StrictMode
    })

    // Flush async fetch under Strict Mode double-effects
    await act(async () => { })

    expect(mockGetStrokePaths).toHaveBeenCalledTimes(1)
    expect(result.current.statusByChar["一"]).toBe("ready")
  })
})
