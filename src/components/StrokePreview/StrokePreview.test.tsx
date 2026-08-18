import { render, fireEvent, act } from "@testing-library/react"
import { StrokePreview } from "./StrokePreview"
import { getStrokePaths } from "@/lib/kanjivg"

vi.mock("@/lib/kanjivg", () => ({
  getStrokePaths: vi.fn()
}))

const mockGetStrokePaths = vi.mocked(getStrokePaths)

const stroke = (d: string) => ({ strokeNumber: 1, d, type: "㇐" })

describe("StrokePreview", () => {
  beforeEach(() => {
    mockGetStrokePaths.mockReset()
  })

  it("renders plain-text fallback for characters without stroke data", async () => {
    mockGetStrokePaths.mockResolvedValue({ ok: false, reason: "missing" })
    const { findByText } = render(<StrokePreview characters={["あ"]} />)
    expect(await findByText("あ")).toBeInTheDocument()
  })

  it("renders strokes and reveals them one by one", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M1,1"), stroke("M2,2")]
    })
    const { container, findByText } = render(
      <StrokePreview characters={["一"]} strokeDelayMs={10} />
    )

    await findByText("Stroke 1 / 2")
    const paths = container.querySelectorAll("svg path")
    expect(paths).toHaveLength(2)
    expect(paths[0]).toHaveAttribute("stroke", "#f97316")
    expect(paths[1]).toHaveAttribute("stroke", "#e5e7eb")

    const replay = await findByText("Replay")
    await act(async () => {
      fireEvent.click(replay)
    })
    expect(await findByText("Stroke 1 / 2")).toBeInTheDocument()
  })
})
