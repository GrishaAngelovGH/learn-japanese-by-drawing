import { render, screen, fireEvent } from "@testing-library/react"
import { vi } from "vitest"
import { useSearchParams, ReadonlyURLSearchParams } from "next/navigation"
import PracticePage from "./page"
import { speakJapanese } from "@/lib/speech"
import { getStrokePaths } from "@/lib/kanjivg"

vi.mock("@/lib/speech", () => ({
  speakJapanese: vi.fn()
}))
vi.mock("@/lib/kanjivg", () => ({
  getStrokePaths: vi.fn()
}))

const mockSpeakJapanese = vi.mocked(speakJapanese)
const mockGetStrokePaths = vi.mocked(getStrokePaths)
const mockUseSearchParams = vi.mocked(useSearchParams)

describe("Practice Page", () => {
  beforeEach(() => {
    mockSpeakJapanese.mockClear()
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [{ strokeNumber: 1, d: "M1,1", type: "㇐" }]
    })
    // Small session count so no test iterates the full production dictionary
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?count=3") as ReadonlyURLSearchParams)
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

  it("goes to next word when Next is clicked", () => {
    render(<PracticePage />)
    const nextButton = screen.getByRole("button", { name: "Next" })
    fireEvent.click(nextButton)
    expect(screen.getByRole("heading", { level: 1, name: "ごはん" })).toBeInTheDocument()
  })

  it("goes to previous word when Prev is clicked", () => {
    render(<PracticePage />)
    const nextButton = screen.getByRole("button", { name: "Next" })
    fireEvent.click(nextButton)
    const prevButton = screen.getByRole("button", { name: "Prev" })
    fireEvent.click(prevButton)
    expect(screen.getByRole("heading", { level: 1, name: "朝ご飯" })).toBeInTheDocument()
  })

  it("restarts to first word when Restart is clicked at last word", () => {
    render(<PracticePage />)

    // count=3: index 0 → 1 → 2 (last), then Next becomes Restart
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    const restartButton = screen.getByRole("button", { name: "Restart" })
    fireEvent.click(restartButton)
    expect(screen.getByRole("heading", { level: 1, name: "朝ご飯" })).toBeInTheDocument()
  })

  it("shows Next label then Restart label at the right times", () => {
    render(<PracticePage />)

    // At first word, button says Next (not Restart)
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Restart" })).not.toBeInTheDocument()

    // Navigate to last word (index 2 of count=3)
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    // At last word, button says Restart (not Next)
    expect(screen.getByRole("button", { name: "Restart" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument()

    // Click Restart → back to first word, button says Next again
    fireEvent.click(screen.getByRole("button", { name: "Restart" }))
    expect(screen.getByRole("heading", { level: 1, name: "朝ご飯" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Restart" })).not.toBeInTheDocument()
  })

  it("shows Restart immediately when session has only one word", () => {
    // count=1: index 0 is already the last word (sessionCount - 1 = 0)
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?count=1") as ReadonlyURLSearchParams)

    render(<PracticePage />)

    // Restart button is shown right away; no Next needed
    expect(screen.getByRole("button", { name: "Restart" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Restart" }))
    expect(screen.getByRole("heading", { level: 1, name: "朝ご飯" })).toBeInTheDocument()
  })

  it("toggles the draw canvas with the Learn to draw button", async () => {
    render(<PracticePage />)

    expect(screen.queryByTestId("draw-canvas")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Learn to draw" }))
    expect(await screen.findByTestId("draw-canvas")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Stop drawing" }))
    expect(screen.queryByTestId("draw-canvas")).not.toBeInTheDocument()
  })

  it("switches between preview and draw mode", async () => {
    render(<PracticePage />)

    fireEvent.click(screen.getByRole("button", { name: "Preview stroke order" }))
    expect(screen.queryByTestId("draw-canvas")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Learn to draw" }))
    expect(await screen.findByTestId("draw-canvas")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Stop drawing" }))
    expect(screen.queryByTestId("draw-canvas")).not.toBeInTheDocument()
  })

  it("resets to idle when moving to the next word", async () => {
    render(<PracticePage />)

    fireEvent.click(screen.getByRole("button", { name: "Learn to draw" }))
    expect(await screen.findByTestId("draw-canvas")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.queryByTestId("draw-canvas")).not.toBeInTheDocument()
  })
})
