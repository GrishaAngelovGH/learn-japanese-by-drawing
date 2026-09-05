import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { EventData, Props } from "react-joyride"

let pathname = "/"
let joyrideProps: Props

vi.mock("next/navigation", () => ({ usePathname: () => pathname }))
vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "light" }) }))
vi.mock("react-joyride", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-joyride")>()),
  Joyride: (props: Props) => {
    joyrideProps = props
    return null
  }
}))

import { setTourSeen } from "@/hooks/useTourSeen"
import { AppTour } from "./AppTour"

const KEY = (id: string) => `learn-japanese:tour:${id}`

function endTour(status: "finished" | "skipped") {
  act(() => {
    joyrideProps.onEvent?.(
      { type: "tour:end", status } as EventData,
      {} as never
    )
  })
}

describe("AppTour", () => {
  beforeEach(() => {
    // Clear both the persisted and the in-memory "seen" flags.
    ;["home-v1", "practice-v1"].forEach((id) => setTourSeen(id, false))
    localStorage.clear()
    pathname = "/"
  })

  it("renders nothing on routes without a tour", () => {
    pathname = "/streak"
    const { container } = render(<AppTour />)
    expect(container).toBeEmptyDOMElement()
  })

  it("auto-runs the tour on the first visit", () => {
    render(<AppTour />)
    expect(joyrideProps.run).toBe(true)
    expect(joyrideProps.steps.length).toBeGreaterThan(0)
  })

  it("does not auto-run once the tour has been seen", () => {
    localStorage.setItem(KEY("home-v1"), "1")
    render(<AppTour />)
    expect(joyrideProps.run).toBe(false)
  })

  it("marks the tour as seen when it ends", () => {
    render(<AppTour />)
    endTour("finished")
    expect(localStorage.getItem(KEY("home-v1"))).toBe("1")
    expect(joyrideProps.run).toBe(false)
  })

  it("replays the tour from the help button", () => {
    localStorage.setItem(KEY("home-v1"), "1")
    render(<AppTour />)
    fireEvent.click(screen.getByLabelText("Show the guided tour"))
    expect(joyrideProps.run).toBe(true)
    endTour("finished")
    expect(joyrideProps.run).toBe(false)
  })

  it("re-arms the next tour when the home tour is finished", () => {
    localStorage.setItem(KEY("practice-v1"), "1")
    render(<AppTour />)
    endTour("finished")
    expect(localStorage.getItem(KEY("practice-v1"))).toBeNull()
  })

  it("dismisses the next tour when the home tour is skipped", () => {
    render(<AppTour />)
    endTour("skipped")
    expect(localStorage.getItem(KEY("practice-v1"))).toBe("1")
  })

  it("ignores events other than tour end", () => {
    render(<AppTour />)
    act(() => {
      joyrideProps.onEvent?.(
        { type: "step:after", action: "next", status: "running" } as EventData,
        {} as never
      )
    })
    expect(localStorage.getItem(KEY("home-v1"))).toBeNull()
    expect(joyrideProps.run).toBe(true)
  })

  it("switches tour when the route changes", () => {
    const { rerender } = render(<AppTour />)
    const homeSteps = joyrideProps.steps
    pathname = "/practice"
    rerender(<AppTour />)
    expect(joyrideProps.steps).not.toBe(homeSteps)
    expect(joyrideProps.run).toBe(true)
  })
})
