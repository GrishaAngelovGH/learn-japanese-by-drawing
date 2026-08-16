import { render, act } from "@testing-library/react"
import Home from "./page"

describe("Home Page", () => {
  it("should render the component", async () => {
    let container
    await act(async () => {
      const rendered = render(<Home />)
      container = rendered.container
    })
    expect(container).toMatchSnapshot()
  })
})
