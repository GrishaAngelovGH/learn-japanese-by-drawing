import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { KanjiVGAttribution } from "./KanjiVGAttribution"

describe("KanjiVGAttribution", () => {
  it("credits KanjiVG and links the CC BY-SA 3.0 license", () => {
    render(<KanjiVGAttribution />)
    expect(screen.getByRole("link", { name: "KanjiVG" })).toHaveAttribute(
      "href",
      "https://kanjivg.tagaini.net"
    )
    expect(screen.getByRole("link", { name: "CC BY-SA 3.0" })).toHaveAttribute(
      "href",
      "https://creativecommons.org/licenses/by-sa/3.0/"
    )
    expect(screen.getByText(/Ulrich Apel/)).toBeInTheDocument()
  })

  it("states how the data is used", () => {
    render(<KanjiVGAttribution />)
    expect(screen.getByText(/not otherwise changed/)).toBeInTheDocument()
  })
})
