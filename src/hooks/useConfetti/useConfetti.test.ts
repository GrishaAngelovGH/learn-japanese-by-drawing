import { renderHook, act } from "@testing-library/react"
import { vi } from "vitest"
import { useConfetti } from "./index"

vi.mock("canvas-confetti", () => ({
  default: vi.fn()
}))

const mockConfettiDefault = vi.fn()

vi.mock("canvas-confetti", () => ({
  default: mockConfettiDefault
}))

describe("useConfetti", () => {
  beforeEach(() => {
    mockConfettiDefault.mockReset()
  })

  it("triggers confetti burst via dynamic import", async () => {
    const { result } = renderHook(() => useConfetti())

    await act(async () => {
      result.current.triggerConfetti()
    })

    // Allow the dynamic import to resolve
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(mockConfettiDefault).toHaveBeenCalledWith({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#f97316", "#fbbf24", "#fcd34d", "#f59e0b"],
      disableForReducedMotion: true,
      zIndex: 9999
    })
  })

  it("creates a canvas element and removes it after animation", async () => {
    const { result } = renderHook(() => useConfetti())

    await act(async () => {
      result.current.triggerConfetti()
    })

    await new Promise((resolve) => setTimeout(resolve, 0))

    const canvas = document.querySelector("canvas")
    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveStyle("position: fixed")
    expect(canvas).toHaveStyle("top: 0")
    expect(canvas).toHaveStyle("z-index: 9999")

    await new Promise((resolve) => setTimeout(resolve, 3100))

    expect(document.querySelector("canvas")).not.toBeInTheDocument()
  })
})
