import { render, screen, fireEvent } from "@testing-library/react"
import { vi } from "vitest"
import { SettingsModal } from "./SettingsModal"
import { SettingsProvider } from "@/contexts/SettingsContext"
import { BACKGROUND_OPTIONS } from "@/data/background-images"

vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}))
vi.mock("@/contexts/SettingsContext", () => ({
  useSettings: vi.fn(),
  SettingsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const { useTheme } = await import("next-themes")
const { useSettings } = await import("@/contexts/SettingsContext")

const setup = (
  theme: "light" | "dark" = "light",
  backgroundImage = "none",
  setBackgroundImage = vi.fn(),
  dailyStreak = true,
  setDailyStreak = vi.fn(),
  onClose = vi.fn()
) => {
  vi.mocked(useTheme).mockReturnValue({
    theme,
    setTheme: vi.fn(),
    themes: ["light", "dark"],
    resolvedTheme: theme,
  })
  vi.mocked(useSettings).mockReturnValue({
    backgroundImage,
    setBackgroundImage,
    dailyStreak,
    setDailyStreak,
  })

  render(
    <SettingsProvider>
      <SettingsModal isOpen={true} onClose={onClose} />
    </SettingsProvider>
  )

  return { setBackgroundImage, setDailyStreak, onClose }
}

describe("SettingsModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders when isOpen is true", () => {
    setup()

    expect(screen.getByText("Settings")).toBeInTheDocument()
    expect(screen.getByText("Dark Mode")).toBeInTheDocument()
    expect(screen.getByText("Background Image")).toBeInTheDocument()
  })

  it("does not render when isOpen is false", () => {
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
    vi.mocked(useSettings).mockReturnValue({
      backgroundImage: "none",
      setBackgroundImage: vi.fn(),
      dailyStreak: true,
      setDailyStreak: vi.fn(),
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
    vi.mocked(useSettings).mockReturnValue({
      backgroundImage: "none",
      setBackgroundImage: vi.fn(),
      dailyStreak: true,
      setDailyStreak: vi.fn(),
    })

    render(<SettingsModal isOpen={true} onClose={vi.fn()} />)

    const toggle = screen.getByRole("button", { name: /dark mode/i })
    fireEvent.click(toggle)

    expect(setTheme).toHaveBeenCalledWith("light")
  })

  it("calls setBackgroundImage with a pexels url when enabling background while disabled", () => {
    const { setBackgroundImage } = setup("light", "none")

    const toggle = screen.getByRole("button", { name: /background image/i })
    fireEvent.click(toggle)

    expect(setBackgroundImage).toHaveBeenCalledWith(expect.stringContaining("pexels.com"))
  })

  it("calls setBackgroundImage with 'none' when disabling background while enabled", () => {
    const url = "https://images.pexels.com/example.jpg"
    const { setBackgroundImage } = setup("light", url)

    const toggle = screen.getByRole("button", { name: /background image/i })
    fireEvent.click(toggle)

    expect(setBackgroundImage).toHaveBeenCalledWith("none")
  })

  it("updates background image when a button option is clicked", () => {
    const { setBackgroundImage } = setup("light", "https://images.pexels.com/example.jpg")
    const option = BACKGROUND_OPTIONS.find((o) => o.id === "ninenzaka")!

    fireEvent.click(screen.getByText(option.label))

    expect(setBackgroundImage).toHaveBeenCalledWith(option.url)
  })

  it("shows a preview image when background is enabled", () => {
    const url = "https://images.pexels.com/example.jpg"
    setup("light", url)

    expect(screen.getByRole("button", { name: /background image/i })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByAltText("")).toHaveAttribute("src", url)
  })

  it("toggles daily streak off when it is on", () => {
    const { setDailyStreak } = setup("light", "none", vi.fn(), true)

    const toggle = screen.getByRole("button", { name: /daily streak/i })
    expect(toggle).toHaveAttribute("aria-pressed", "true")

    fireEvent.click(toggle)

    expect(setDailyStreak).toHaveBeenCalledWith(false)
  })

  it("toggles daily streak on when it is off", () => {
    const { setDailyStreak } = setup("light", "none", vi.fn(), false)

    const toggle = screen.getByRole("button", { name: /daily streak/i })
    expect(toggle).toHaveAttribute("aria-pressed", "false")

    fireEvent.click(toggle)

    expect(setDailyStreak).toHaveBeenCalledWith(true)
  })

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn()
    setup("light", "none", vi.fn(), true, vi.fn(), onClose)

    const closeButton = screen.getByLabelText("Close settings")
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("calls onClose when ESC key is pressed", () => {
    const onClose = vi.fn()
    setup("light", "none", vi.fn(), true, vi.fn(), onClose)

    fireEvent.keyDown(document, { key: "Escape" })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("does not call onClose when other keys are pressed", () => {
    const onClose = vi.fn()
    setup("light", "none", vi.fn(), true, vi.fn(), onClose)

    fireEvent.keyDown(document, { key: "Enter" })

    expect(onClose).not.toHaveBeenCalled()
  })
})
