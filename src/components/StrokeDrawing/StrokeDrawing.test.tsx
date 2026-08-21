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

  it("renders exactly one orange-outlined current stroke", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M1,1 L10,10"), stroke("M2,2 L20,20")]
    })

    render(<StrokeDrawing characters={["一"]} />)

    const canvas = await screen.findByTestId("draw-canvas")
    const orange = canvas.querySelectorAll('path[stroke="#f97316"]')
    expect(orange).toHaveLength(1)
  })

  it("renders ghost paths for not-yet-reached strokes", async () => {
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

  it("renders a dashed orange outline for the current stroke", async () => {
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
})
