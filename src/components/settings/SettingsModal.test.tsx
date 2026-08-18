import { render, screen, fireEvent } from "@testing-library/react"
import { vi } from "vitest"
import { SettingsModal } from "./SettingsModal"

vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}))

const { useTheme } = await import("next-themes")

describe("SettingsModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders when isOpen is true", () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
      themes: ["light", "dark"],
      resolvedTheme: "light",
    })

    render(<SettingsModal isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText("Settings")).toBeInTheDocument()
    expect(screen.getByText("Dark Mode")).toBeInTheDocument()
  })

  it("does not render when isOpen is false", () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
      themes: ["light", "dark"],
      resolvedTheme: "light",
    })

    const { container } = render(<SettingsModal isOpen={false} onClose={vi.fn()} />)

    expect(container.firstChild).toBeNull()
  })

  it("calls setTheme with 'dark' when toggle is clicked in light mode", () => {
    const setTheme = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme,
      themes: ["light", "dark"],
      resolvedTheme: "light",
    })

    render(<SettingsModal isOpen={true} onClose={vi.fn()} />)

    const toggle = screen.getByRole("button", { name: /dark mode/i })
    fireEvent.click(toggle)

    expect(setTheme).toHaveBeenCalledWith("dark")
  })

  it("calls setTheme with 'light' when toggle is clicked in dark mode", () => {
    const setTheme = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      theme: "dark",
      setTheme,
      themes: ["light", "dark"],
      resolvedTheme: "dark",
    })

    render(<SettingsModal isOpen={true} onClose={vi.fn()} />)

    const toggle = screen.getByRole("button", { name: /dark mode/i })
    fireEvent.click(toggle)

    expect(setTheme).toHaveBeenCalledWith("light")
  })

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
      themes: ["light", "dark"],
      resolvedTheme: "light",
    })

    render(<SettingsModal isOpen={true} onClose={onClose} />)

    const closeButton = screen.getByLabelText("Close settings")
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("calls onClose when ESC key is pressed", () => {
    const onClose = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
      themes: ["light", "dark"],
      resolvedTheme: "light",
    })

    render(<SettingsModal isOpen={true} onClose={onClose} />)

    fireEvent.keyDown(document, { key: "Escape" })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("does not call onClose when other keys are pressed", () => {
    const onClose = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
      themes: ["light", "dark"],
      resolvedTheme: "light",
    })

    render(<SettingsModal isOpen={true} onClose={onClose} />)

    fireEvent.keyDown(document, { key: "Enter" })

    expect(onClose).not.toHaveBeenCalled()
  })
})
