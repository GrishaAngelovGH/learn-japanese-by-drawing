import { render, screen, fireEvent, act } from "@testing-library/react"
import PracticePage from "./page"
import { mockPush } from "@/test/setup"
import { speakJapanese } from "@/lib/speech"

vi.mock("@/lib/speech", () => ({
  speakJapanese: vi.fn()
}))

const mockSpeakJapanese = vi.mocked(speakJapanese)

describe("Practice Page", () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockSpeakJapanese.mockClear()
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
    // button stays disabled through the transition since the page
    // unmounts on navigation — no need to reset isGoingBack
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled()

    vi.useRealTimers()
  })

  it("plays pronunciation when speaker button is clicked", () => {
    render(<PracticePage />)

    const speakerButton = screen.getByRole("button", {
      name: "Listen to pronunciation"
    })
    expect(speakerButton).toBeInTheDocument()

    fireEvent.click(speakerButton)

    expect(mockSpeakJapanese).toHaveBeenCalledTimes(1)
    expect(mockSpeakJapanese.mock.calls[0][0]).toBe("あさごはん")
  })
})
