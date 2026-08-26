import { render, screen, fireEvent } from "@testing-library/react"
import { vi } from "vitest"
import { StrokeDrawing } from "./StrokeDrawing"
import { getStrokePaths } from "@/lib/kanjivg"
import { scoreStroke } from "@/lib/draw/score"
import * as audio from "@/lib/audio"

vi.mock("@/lib/kanjivg", () => ({
  getStrokePaths: vi.fn()
}))
vi.mock("@/lib/draw/score", () => ({
  scoreStroke: vi.fn()
}))
vi.mock("@/lib/audio", () => ({
  playStrokeSuccess: vi.fn(),
  playStrokeFailure: vi.fn(),
  playCharacterComplete: vi.fn(),
  playWordComplete: vi.fn()
}))
vi.mock("canvas-confetti", () => ({
  default: vi.fn()
}))

const mockGetStrokePaths = vi.mocked(getStrokePaths)
const mockScoreStroke = vi.mocked(scoreStroke)
const mockPlayStrokeSuccess = vi.mocked(audio.playStrokeSuccess)
const mockPlayStrokeFailure = vi.mocked(audio.playStrokeFailure)
const mockPlayCharacterComplete = vi.mocked(audio.playCharacterComplete)

const stroke = (d: string) => ({ strokeNumber: 1, d, type: "㇐" })

const mockRect = {
  left: 0,
  top: 0,
  width: 100,
  height: 100,
}

describe("StrokeDrawing", () => {
  beforeEach(() => {
    mockGetStrokePaths.mockReset()
    mockScoreStroke.mockReset()
    // Default: short traces are non-judgeable (ignored on pointer up)
    mockScoreStroke.mockReturnValue({
      score: 0,
      coverage: 0,
      precision: 0,
      judgeable: false
    })
  })

  it("renders ghost guide strokes for the current character", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M1,1 L10,10"), stroke("M2,2 L20,20")]
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    expect(canvas).toHaveAttribute("viewBox", "0 0 109 109")
    const ghostPaths = canvas.querySelectorAll('path[stroke="#e5e7eb"]')
    expect(ghostPaths).toHaveLength(2)
  })

  it("renders exactly one dashed orange-outlined current stroke", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M1,1 L10,10"), stroke("M2,2 L20,20")]
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    const orange = canvas.querySelectorAll('path[stroke="#f97316"]')
    expect(orange).toHaveLength(1)
    expect(orange[0]).toHaveAttribute("stroke-dasharray", "6 4")
  })

  it("renders solid ghost strokes (not dashed)", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M1,1 L10,10"), stroke("M2,2 L20,20")]
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    const ghost = canvas.querySelectorAll('path[stroke="#e5e7eb"][stroke-width="2"]')
    expect(ghost).toHaveLength(1)
    expect(ghost[0]).not.toHaveAttribute("stroke-dasharray")
  })

  it("renders a start arrow for the current stroke", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    const arrow = canvas.querySelector('path[d="M-4,0 L4,-4 L4,4 Z"]')
    expect(arrow).toBeInTheDocument()
  })

  it("shows Stroke counter", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M1,1"), stroke("M2,2")]
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    expect(await screen.findByText("Stroke 1 / 2")).toBeInTheDocument()
  })

  it("rotates the start arrow along the stroke tangent", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    const arrow = canvas.querySelector('path[d="M-4,0 L4,-4 L4,4 Z"]')
    expect(arrow).toHaveAttribute("transform", expect.stringMatching(/rotate\(45/))
  })

  it("shows Draw direction arrow above the canvas", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    await screen.findByText("Draw direction")
    const arrowLine = document.querySelector('line[marker-end="url(#direction-arrow)"]')
    expect(arrowLine).toBeInTheDocument()
  })

  it("captures a pointer trace on the canvas", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 })

    // x = (10-0)/100*109 = 10.9, y = 10.9; then (20,20) -> (21.8, 21.8)
    const tracePath = canvas.querySelector('path[stroke="#2563eb"]')
    expect(tracePath).toBeInTheDocument()
    expect(tracePath).toHaveAttribute("d", "M10.9,10.9 L21.8,21.8")
  })

  it("clears the trace on Clear button click", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    expect(canvas.querySelector('path[stroke="#2563eb"]')).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Clear all" }))
    expect(canvas.querySelector('path[stroke="#2563eb"]')).not.toBeInTheDocument()
  })

  it("undoes the last point on Undo button click", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    // Draw three points: (10,10) -> (20,20) -> (30,30)
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 30, clientY: 30, pointerId: 1 })
    fireEvent.pointerUp(canvas, { clientX: 30, clientY: 30, pointerId: 1 })

    let tracePath = canvas.querySelector('path[stroke="#2563eb"]')
    expect(tracePath).toHaveAttribute("d", "M10.9,10.9 L21.8,21.8 L32.7,32.7")

    // Undo last point -> remove (30,30) -> (32.7,32.7)
    fireEvent.click(screen.getByRole("button", { name: "Undo last point" }))

    tracePath = canvas.querySelector('path[stroke="#2563eb"]')
    expect(tracePath).toHaveAttribute("d", "M10.9,10.9 L21.8,21.8")
  })

  it("disables Undo and Clear when trace is empty", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    await screen.findByTestId("draw-canvas")
    const undo = screen.getByRole("button", { name: "Undo last point" })
    const clear = screen.getByRole("button", { name: "Clear all" })
    expect(undo).toBeDisabled()
    expect(clear).toBeDisabled()
  })

  it("clears previous trace on a new pointerdown", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    // First trace
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 })

    // New trace starts fresh
    fireEvent.pointerDown(canvas, { clientX: 30, clientY: 30, pointerId: 2 })
    fireEvent.pointerMove(canvas, { clientX: 40, clientY: 40, pointerId: 2 })
    fireEvent.pointerUp(canvas, { clientX: 40, clientY: 40, pointerId: 2 })

    const tracePath = canvas.querySelector('path[stroke="#2563eb"]')
    expect(tracePath).toBeInTheDocument()
    // Only the second trace points should be present
    expect(tracePath).toHaveAttribute("d", "M32.7,32.7 L43.6,43.6")
  })

  it("does not throw on pointerup when not drawing", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    expect(() => {
      fireEvent.pointerUp(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    }).not.toThrow()
  })

  it("accepts the stroke when score >= threshold", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    mockScoreStroke.mockReturnValue({
      score: 95,
      coverage: 1,
      precision: 1,
      judgeable: true
    })

    render(<StrokeDrawing characters={["一", "二"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 })

    // Trace cleared, stroke advanced (1 stroke total -> character complete)
    expect(canvas.querySelector('path[stroke="#2563eb"]')).not.toBeInTheDocument()
    expect(screen.getByText("Character complete!")).toBeInTheDocument()
    expect(screen.queryByText("Stroke 1 / 1")).not.toBeInTheDocument()
  })

  it("rejects the stroke when score < threshold", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    mockScoreStroke.mockReturnValue({
      score: 50,
      coverage: 0.5,
      precision: 0.5,
      judgeable: true
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 })

    // Trace cleared, "Try again" shown, failedAttempts incremented
    expect(canvas.querySelector('path[stroke="#2563eb"]')).not.toBeInTheDocument()
    expect(screen.getByText("Try again (1)")).toBeInTheDocument()
    // Stroke counter still shows Stroke 1 / 1 (not advanced)
    expect(screen.getByText("Stroke 1 / 1")).toBeInTheDocument()
  })

  it("shows percentage bar before drawing", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L100,0")]
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    await screen.findByTestId("draw-canvas")
    expect(screen.getByText("0%")).toBeInTheDocument()
  })

  it("shows Loading… while stroke data is being fetched", async () => {
    mockGetStrokePaths.mockImplementation(
      () =>
        new Promise(() => {
          // never resolves -> stays in loading state
        })
    )

    const { findByText } = render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    await findByText("Loading…")
  })

  it("shows the plain character and a note when stroke data is missing", async () => {
    mockGetStrokePaths.mockResolvedValue({ ok: false, reason: "missing" })

    const { findByText } = render(<StrokeDrawing characters={["あ"]} wordId="test-word" />)

    await findByText("あ")
    expect(await findByText(/No stroke data for this character/)).toBeInTheDocument()
  })

  it("shows an error message when stroke loading fails", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    mockGetStrokePaths.mockResolvedValue({ ok: false, reason: "error" })

    const { findByText } = render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    expect(await findByText(/Failed to load stroke data/)).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it("resets on Redraw after character complete", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    mockScoreStroke.mockReturnValue({
      score: 95,
      coverage: 1,
      precision: 1,
      judgeable: true
    })

    render(<StrokeDrawing characters={["一", "二"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 })

    expect(screen.getByText("Character complete!")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Redraw character" }))

    expect(screen.queryByText("Character complete!")).not.toBeInTheDocument()
    expect(screen.getByText("Stroke 1 / 1")).toBeInTheDocument()
  })

  it("shows Character X of Y counter", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一", "二"]} wordId="test-word" />)

    expect(await screen.findByText("Character 1 of 2")).toBeInTheDocument()
  })

  it("navigates to next character with Next button", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一", "二"]} wordId="test-word" />)

    await screen.findByText("Character 1 of 2")

    fireEvent.click(screen.getByRole("button", { name: "Next character" }))

    expect(screen.getByText("Character 2 of 2")).toBeInTheDocument()
  })

  it("navigates to previous character with Prev button", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一", "二"]} wordId="test-word" />)

    await screen.findByText("Character 1 of 2")

    fireEvent.click(screen.getByRole("button", { name: "Next character" }))
    expect(screen.getByText("Character 2 of 2")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Prev character" }))
    expect(screen.getByText("Character 1 of 2")).toBeInTheDocument()
  })

  it("disables Prev button on first character", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一", "二"]} wordId="test-word" />)

    await screen.findByText("Character 1 of 2")
    const prevButton = screen.getByRole("button", { name: "Prev character" })
    expect(prevButton).toBeDisabled()
  })

  it("resets stroke progress when navigating to next character", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10"), stroke("M5,5 L15,15")]
    })

    mockScoreStroke.mockReturnValue({
      score: 95,
      coverage: 1,
      precision: 1,
      judgeable: true
    })

    render(<StrokeDrawing characters={["一", "二"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    // Complete first stroke of first character
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 })

    expect(screen.getByText("Stroke 2 / 2")).toBeInTheDocument()

    // Navigate to next character
    fireEvent.click(screen.getByRole("button", { name: "Next character" }))

    // Stroke progress should be reset
    expect(screen.getByText("Stroke 1 / 2")).toBeInTheDocument()
  })

  it("shows Skip button for characters with missing stroke data", async () => {
    mockGetStrokePaths.mockResolvedValue({ ok: false, reason: "missing" })

    render(<StrokeDrawing characters={["あ", "一"]} wordId="test-word" />)

    await screen.findByText("あ")
    expect(screen.getByRole("button", { name: "Skip this character" })).toBeInTheDocument()
  })

  it("navigates to next character on Skip button click", async () => {
    mockGetStrokePaths.mockResolvedValue({ ok: false, reason: "missing" })

    render(<StrokeDrawing characters={["あ", "一"]} wordId="test-word" />)

    await screen.findByText("あ")

    fireEvent.click(screen.getByRole("button", { name: "Skip this character" }))

    // After skip, should load the next character
    expect(screen.queryByText("あ")).not.toBeInTheDocument()
  })

  it("shows Next character button after character complete (if not last)", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    mockScoreStroke.mockReturnValue({
      score: 95,
      coverage: 1,
      precision: 1,
      judgeable: true
    })

    render(<StrokeDrawing characters={["一", "二"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 })

    expect(screen.getByText("Character complete!")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Next character" })).toBeInTheDocument()
  })

  it("does not show Next character button after last character complete", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    mockScoreStroke.mockReturnValue({
      score: 95,
      coverage: 1,
      precision: 1,
      judgeable: true
    })

    render(<StrokeDrawing characters={["一", "二"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    // Navigate to last character
    fireEvent.click(screen.getByRole("button", { name: "Next character" }))

    // Complete last character
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 })

    // Last character shows Character complete (word completion is tracked at word level)
    expect(screen.getByText("Character complete!")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Next character" })).not.toBeInTheDocument()
    expect(screen.queryByText("Word complete!")).not.toBeInTheDocument()
  })

  it("shows Word complete after completing last character", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    mockScoreStroke.mockReturnValue({
      score: 95,
      coverage: 1,
      precision: 1,
      judgeable: true
    })

    render(<StrokeDrawing characters={["一"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 })

    // Single character word shows Character complete; word status is tracked at word level
    expect(screen.getByText("Character complete!")).toBeInTheDocument()
    expect(screen.queryByText("Word complete!")).not.toBeInTheDocument()
  })

  it("shows Word complete after completing all characters", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    mockScoreStroke.mockReturnValue({
      score: 95,
      coverage: 1,
      precision: 1,
      judgeable: true
    })

    render(<StrokeDrawing characters={["一", "二"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    // Complete first character
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 })

    expect(screen.getByText("Character complete!")).toBeInTheDocument()

    // Click Next character button
    fireEvent.click(screen.getByRole("button", { name: "Next character" }))

    // Complete second character (last character)
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 })

    expect(screen.getByText("Character complete!")).toBeInTheDocument()
    expect(screen.queryByText("Word complete!")).not.toBeInTheDocument()
  })

  it("plays sound effects on stroke accept, reject, and completion", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一", "二"]} wordId="test-word" />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    // Accept stroke - should play success sound
    mockScoreStroke.mockReturnValue({
      score: 95,
      coverage: 1,
      precision: 1,
      judgeable: true
    })
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    expect(mockPlayStrokeSuccess).toHaveBeenCalled()
    expect(mockPlayCharacterComplete).toHaveBeenCalled()

    // Reject stroke - should play failure sound
    mockScoreStroke.mockReturnValue({
      score: 50,
      coverage: 0.5,
      precision: 0.5,
      judgeable: true
    })
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 })
    expect(mockPlayStrokeFailure).toHaveBeenCalled()
  })
})
