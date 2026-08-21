import { render, screen } from "@testing-library/react"
import { vi } from "vitest"
import { StrokeDrawing } from "./StrokeDrawing"
import { getStrokePaths } from "@/lib/kanjivg"

vi.mock("@/lib/kanjivg", () => ({
  getStrokePaths: vi.fn()
}))

const mockGetStrokePaths = vi.mocked(getStrokePaths)

const stroke = (d: string) => ({ strokeNumber: 1, d, type: "㇐" })

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

  it("has an accessible label", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M1,1")]
    })

    render(<StrokeDrawing characters={["一"]} />)

    await screen.findByLabelText(/draw the current stroke here/i)
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
    mockGetStrokePaths.mockResolvedValue({ ok: false, reason: "error" })

    const { findByText } = render(<StrokeDrawing characters={["一"]} />)

    expect(await findByText(/Failed to load stroke data/)).toBeInTheDocument()
  })
})
