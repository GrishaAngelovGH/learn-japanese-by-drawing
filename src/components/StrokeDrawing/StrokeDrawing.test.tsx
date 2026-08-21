import { render, screen } from "@testing-library/react"
import { StrokeDrawing } from "./StrokeDrawing"

describe("StrokeDrawing", () => {
  it("renders an empty draw canvas", () => {
    render(<StrokeDrawing characters={["一"]} />)

    const canvas = screen.getByTestId("draw-canvas")
    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveAttribute("viewBox", "0 0 109 109")
  })

  it("has an accessible label", () => {
    render(<StrokeDrawing characters={["一"]} />)

    expect(screen.getByLabelText(/draw the current stroke here/i)).toBeInTheDocument()
  })

  it("shows a faint drawing canvas hint", () => {
    render(<StrokeDrawing characters={["一"]} />)

    expect(screen.getByText(/drawing canvas/i)).toBeInTheDocument()
  })
})
