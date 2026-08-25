import { render, screen } from "@testing-library/react"
import { PronunciationDiff } from "./index"

describe("PronunciationDiff", () => {
  it("renders expected and actual", () => {
    render(<PronunciationDiff expected="kana" actual="kanna" />)
    expect(screen.getByText("Expected")).toBeInTheDocument()
    expect(screen.getByText("You said")).toBeInTheDocument()
  })
})
