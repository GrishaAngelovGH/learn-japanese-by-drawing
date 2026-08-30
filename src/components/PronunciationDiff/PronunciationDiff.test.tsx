import { render, screen } from "@testing-library/react"
import { PronunciationDiff } from "./index"

describe("PronunciationDiff", () => {
  it("renders expected and actual", () => {
    render(<PronunciationDiff expected="あさごはん" actual="あさごはん" />)
    expect(screen.getByText("Expected")).toBeInTheDocument()
    expect(screen.getByText("You said")).toBeInTheDocument()
  })

  it("shows romaji, not Japanese characters, and highlights the differing sound", () => {
    const { container } = render(<PronunciationDiff expected="あさごはん" actual="アサコハン" />)
    expect(container.textContent).not.toMatch(/[぀-ヿ一-鿿]/)
    // expected side: "go" is wrong (red); actual side: "ko" (green)
    expect(container.querySelector(".bg-red-200")?.textContent).toBe("go")
    expect(container.querySelector(".bg-green-200")?.textContent).toBe("ko")
  })

  it("shows ? for unresolved kanji instead of the character", () => {
    const { container } = render(<PronunciationDiff expected="みず" actual="水" />)
    expect(container.textContent).not.toMatch(/[一-鿿]/)
    expect(container.querySelector(".bg-green-200")?.textContent).toBe("?")
  })

  it("shows Correct when pronunciation matches expected", () => {
    render(<PronunciationDiff expected="みず" actual="みず" />)
    expect(screen.getByText("Correct")).toBeInTheDocument()
    expect(screen.queryByText("Incorrect")).not.toBeInTheDocument()
  })

  it("shows Incorrect when pronunciation differs from expected", () => {
    render(<PronunciationDiff expected="みず" actual="みな" />)
    expect(screen.getByText("Incorrect")).toBeInTheDocument()
    expect(screen.queryByText("Correct")).not.toBeInTheDocument()
  })
})
