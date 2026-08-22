import { render, screen, fireEvent } from "@testing-library/react"
import { vi } from "vitest"
import { StrokeDrawing } from "./StrokeDrawing"
import { getStrokePaths } from "@/lib/kanjivg"

vi.mock("@/lib/kanjivg", () => ({
  getStrokePaths: vi.fn()
}))

const mockGetStrokePaths = vi.mocked(getStrokePaths)

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
  })

  it("renders ghost guide strokes for the current character", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M1,1 L10,10"), stroke("M2,2 L20,20")]
    })

    render(<StrokeDrawing characters={["一"]} />)

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

    render(<StrokeDrawing characters={["一"]} />)

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

    render(<StrokeDrawing characters={["一"]} />)

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

    render(<StrokeDrawing characters={["一"]} />)

    const canvas = await screen.findByTestId("draw-canvas")
    const arrow = canvas.querySelector('path[d="M-4,0 L4,-4 L4,4 Z"]')
    expect(arrow).toBeInTheDocument()
  })

  it("shows Stroke counter", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M1,1"), stroke("M2,2")]
    })

    render(<StrokeDrawing characters={["一"]} />)

    expect(await screen.findByText("Stroke 1 / 2")).toBeInTheDocument()
  })

  it("rotates the start arrow along the stroke tangent", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一"]} />)

    const canvas = await screen.findByTestId("draw-canvas")
    const arrow = canvas.querySelector('path[d="M-4,0 L4,-4 L4,4 Z"]')
    expect(arrow).toHaveAttribute("transform", expect.stringMatching(/rotate\(45/))
  })

  it("shows Draw direction arrow above the canvas", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一"]} />)

    await screen.findByText("Draw direction")
    const arrowLine = document.querySelector('line[marker-end="url(#direction-arrow)"]')
    expect(arrowLine).toBeInTheDocument()
  })

  it("captures a pointer trace on the canvas", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M0,0 L10,10")]
    })

    render(<StrokeDrawing characters={["一"]} />)

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

    render(<StrokeDrawing characters={["一"]} />)

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

    render(<StrokeDrawing characters={["一"]} />)

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

    render(<StrokeDrawing characters={["一"]} />)

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

    render(<StrokeDrawing characters={["一"]} />)

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

    render(<StrokeDrawing characters={["一"]} />)

    const canvas = await screen.findByTestId("draw-canvas")
    canvas.getBoundingClientRect = () => mockRect as DOMRect

    expect(() => {
      fireEvent.pointerUp(canvas, { clientX: 10, clientY: 10, pointerId: 1 })
    }).not.toThrow()
  })

  it("shows Loading… while stroke data is being fetched", async () => {
    mockGetStrokePaths.mockImplementation(
      () =>
        new Promise(() => {
          // never resolves -> stays in loading state
        })
    )

    const { findByText } = render(<StrokeDrawing characters={["一"]} />)

    await findByText("Loading…")
  })

  it("shows the plain character and a note when stroke data is missing", async () => {
    mockGetStrokePaths.mockResolvedValue({ ok: false, reason: "missing" })

    const { findByText } = render(<StrokeDrawing characters={["あ"]} />)

    await findByText("あ")
    expect(await findByText(/No stroke data for this character/)).toBeInTheDocument()
  })

  it("shows an error message when stroke loading fails", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    mockGetStrokePaths.mockResolvedValue({ ok: false, reason: "error" })

    const { findByText } = render(<StrokeDrawing characters={["一"]} />)

    expect(await findByText(/Failed to load stroke data/)).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
