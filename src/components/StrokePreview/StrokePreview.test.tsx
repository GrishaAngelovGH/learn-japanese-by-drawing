import { StrictMode } from "react"
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

  it("animates one character's strokes one by one", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M1,1"), stroke("M2,2")]
    })
    const { container, findByText } = render(
      <StrokePreview characters={["一"]} strokeDelayMs={400} />
    )

    await findByText("Stroke 1 / 2")
    // 2 faint guide paths + 2 animated ink paths.
    const ink = container.querySelectorAll('svg path[stroke="#f97316"]')
    expect(container.querySelectorAll("svg path")).toHaveLength(4)
    expect(ink).toHaveLength(2)
    // Strokes are traced via dashoffset (an actual animation), not toggled.
    expect(ink[0]).toHaveAttribute("stroke-dashoffset", "0")
    expect(ink[1]).toHaveAttribute("stroke-dashoffset", "1")
    expect((ink[0] as SVGPathElement).style.transition).toContain(
      "stroke-dashoffset"
    )

    const replay = await findByText("Replay")
    await act(async () => {
      fireEvent.click(replay)
    })
    expect(await findByText("Stroke 1 / 2")).toBeInTheDocument()
  })

  it("still loads and animates under React Strict Mode (dev double-effects)", async () => {
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [stroke("M1,1"), stroke("M2,2")]
    })
    const { container, findByText } = render(
      <StrictMode>
        <StrokePreview characters={["一"]} strokeDelayMs={400} />
      </StrictMode>
    )
    await findByText("Stroke 1 / 2")
    expect(container.querySelectorAll('svg path[stroke="#f97316"]')).toHaveLength(2)
  })

  it("navigates between characters with Prev/Next", async () => {
    mockGetStrokePaths.mockImplementation((char) =>
      Promise.resolve({
        ok: true,
        strokes: char === "一" ? [stroke("M1,1")] : [stroke("M2,2")]
      })
    )
    const { findByText, findByRole } = render(
      <StrokePreview characters={["一", "二"]} strokeDelayMs={10} />
    )

    expect(await findByText("Character 1 of 2")).toBeInTheDocument()
    // Animation starts at 0 strokes; wait for it to reach "Complete".
    expect(await findByText("Complete")).toBeInTheDocument()

    const next = await findByRole("button", { name: "Next ›" })
    await act(async () => {
      fireEvent.click(next)
    })
    expect(await findByText("Character 2 of 2")).toBeInTheDocument()
    expect(await findByText("Complete")).toBeInTheDocument()
  })
})