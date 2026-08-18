import { render, act } from "@testing-library/react"
import Home from "./page"
import { mockPush } from "@/test/setup"

vi.mock("@/lib/view-transition", () => ({
  useViewTransition: () => ({
    push: mockPush
  })
}))

describe("Home Page", () => {
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
})
