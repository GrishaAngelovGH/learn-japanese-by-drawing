import { render, screen, fireEvent, act } from "@testing-library/react"
import PracticePage from "./page"
import { mockPush } from "@/test/setup"

describe("Practice Page", () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it("should render the component", () => {
    const { container } = render(<PracticePage />)
    expect(container).toMatchSnapshot()
  })

  it("resets Back after navigating to the home page", () => {
    vi.useFakeTimers()
    render(<PracticePage />)

    const backButton = screen.getByRole("button", { name: "Back" })
    fireEvent.click(backButton)

    expect(backButton).toBeDisabled()
    expect(mockPush).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(850)
    })

    expect(mockPush).toHaveBeenCalledWith("/")
    expect(screen.getByRole("button", { name: "Back" })).toBeEnabled()

    vi.useRealTimers()
  })
})
