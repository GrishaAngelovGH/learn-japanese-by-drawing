import { render } from "@testing-library/react"
import Soundwave from "./Soundwave"

describe("Soundwave", () => {
  it("renders 5 animated bars", () => {
    const { container } = render(<Soundwave />)
    expect(container).toMatchSnapshot()
    const bars = container.querySelectorAll("div.w-2")
    expect(bars).toHaveLength(5)
  })
})
