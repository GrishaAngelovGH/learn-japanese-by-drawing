import { render, screen, fireEvent, act } from "@testing-library/react"
import Home from "./page"
import { mockPush } from "@/test/setup"

describe("Home Page", () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it("should render the component", () => {
    // Base UI's SliderThumb uses queueMicrotask inside a layout effect to compute
    // thumb position, which defers state updates to after act() returns.
    // Mock queueMicrotask synchronously so those updates happen inside act().
    const qmSpy = vi
      .spyOn(globalThis, "queueMicrotask")
      .mockImplementation((cb: () => void) => cb())
    try {
      // Wrap render in act() so all Slider state updates (root + thumb) are flushed
      // within the act() scope and don't trigger React warnings.
      let container
      act(() => {
        const rendered = render(<Home />)
        container = rendered.container
      })
      expect(container).toMatchSnapshot()
    } finally {
      qmSpy.mockRestore()
    }
  })

  it("resets Start Practice after navigating to the practice page", () => {
    vi.useFakeTimers()
    // Same queueMicrotask mock as above — SliderThumb defers state updates via
    // queueMicrotask which would fire outside act() otherwise.
    const qmSpy = vi
      .spyOn(globalThis, "queueMicrotask")
      .mockImplementation((cb: () => void) => cb())
    try {
      act(() => {
        render(<Home />)
      })
    } finally {
      qmSpy.mockRestore()
    }

    fireEvent.click(screen.getByRole("button", { name: "Start Practice" }))

    expect(screen.getByRole("button", { name: "Start Practice" })).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(850)
    })

    expect(mockPush).toHaveBeenCalledWith("/practice?count=1")

    vi.useRealTimers()
  })
})
