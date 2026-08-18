import { render, screen, fireEvent } from "@testing-library/react"
import PracticePage from "./page"
import { speakJapanese } from "@/lib/speech"

vi.mock("@/lib/speech", () => ({
  speakJapanese: vi.fn()
}))

const mockSpeakJapanese = vi.mocked(speakJapanese)

describe("Practice Page", () => {
  beforeEach(() => {
    mockSpeakJapanese.mockClear()
  })

  it("should render the component", () => {
    const { container } = render(<PracticePage />)
    expect(container).toMatchSnapshot()
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
