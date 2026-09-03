import { render, screen, fireEvent, act, waitFor } from "@testing-library/react"
import { vi, beforeEach, afterEach } from "vitest"
import { useSearchParams, ReadonlyURLSearchParams } from "next/navigation"
import PracticePage from "./page"
import { speakJapanese } from "@/lib/speech"
import { getStrokePaths } from "@/lib/kanjivg"
import { mockPush } from "@/test/setup"

vi.mock("@/lib/speech", () => ({
  speakJapanese: vi.fn()
}))
vi.mock("@/lib/kanjivg", () => ({
  getStrokePaths: vi.fn()
}))
vi.mock("@/contexts/SettingsContext", () => ({
  useSettings: vi.fn(() => ({
    backgroundImage: "none",
    setBackgroundImage: vi.fn(),
    dailyStreak: true,
    setDailyStreak: vi.fn()
  }))
}))
vi.mock("@/hooks/useDailyStreak", () => ({
  useDailyStreak: vi.fn(() => ({
    recordCompletion: vi.fn(),
    counts: {},
    getCount: vi.fn(() => 0),
    currentStreak: 0,
    today: () => "2026-11-01",
    reset: vi.fn()
  }))
}))

import { useSettings } from "@/contexts/SettingsContext"
import { useDailyStreak } from "@/hooks/useDailyStreak"

const mockUseSettings = vi.mocked(useSettings)
const mockUseDailyStreak = vi.mocked(useDailyStreak)
const mockSpeakJapanese = vi.mocked(speakJapanese)
const mockGetStrokePaths = vi.mocked(getStrokePaths)
const mockUseSearchParams = vi.mocked(useSearchParams)

describe("Practice Page", () => {
  beforeEach(() => {
    mockSpeakJapanese.mockClear()
    mockGetStrokePaths.mockResolvedValue({
      ok: true,
      strokes: [{ strokeNumber: 1, d: "M1,1", type: "㇐" }]
    })
    mockPush.mockClear()
    // Small session count so no test iterates the full production dictionary
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?count=3") as ReadonlyURLSearchParams)
    // Reset hooks to default values
    mockUseSettings.mockReturnValue({
      backgroundImage: "none",
      setBackgroundImage: vi.fn(),
      dailyStreak: true,
      setDailyStreak: vi.fn()
    })
    mockUseDailyStreak.mockReturnValue({
      recordCompletion: vi.fn(),
      counts: {},
      getCount: vi.fn(() => 0),
      currentStreak: 0,
      today: () => "2026-11-01",
      reset: vi.fn()
    })
  })

  afterEach(() => {
    mockPush.mockClear()
    localStorage.removeItem("learn-japanese:completed-words")
  })

  it("should render the component", () => {
    const { container } = render(<PracticePage />)
    expect(container).toMatchSnapshot()
  })

  it("plays pronunciation when speaker button is clicked", () => {
    render(<PracticePage />)

    const speakerButton = screen.getByRole("button", {
      name: "Listen to pronunciation"
    })
    expect(speakerButton).toBeInTheDocument()

    fireEvent.click(speakerButton)

    expect(mockSpeakJapanese).toHaveBeenCalledTimes(1)
    expect(mockSpeakJapanese.mock.calls[0][0]).toBe("あさごはん")
  })

  it("disables the listen button while speaking", () => {
    render(<PracticePage />)

    const listenButton = screen.getByRole("button", {
      name: "Listen to pronunciation"
    })
    expect(listenButton).not.toBeDisabled()

    fireEvent.click(listenButton)

    // handleSpeak sets isSpeaking(true) synchronously; the mocked speakJapanese
    // never invokes onEnd, so the button stays disabled until it re-enables.
    expect(listenButton).toBeDisabled()
  })

  it("does not replay pronunciation when listen button is clicked while speaking", () => {
    render(<PracticePage />)

    const listenButton = screen.getByRole("button", {
      name: "Listen to pronunciation"
    })

    fireEvent.click(listenButton)
    fireEvent.click(listenButton)
    fireEvent.click(listenButton)

    expect(mockSpeakJapanese).toHaveBeenCalledTimes(1)
  })

  it("goes to next word when Next is clicked", () => {
    render(<PracticePage />)
    const nextButton = screen.getByRole("button", { name: "Next" })
    fireEvent.click(nextButton)
    expect(screen.getByRole("heading", { level: 1, name: "ごはん" })).toBeInTheDocument()
  })

  it("goes to previous word when Prev is clicked", () => {
    render(<PracticePage />)
    const nextButton = screen.getByRole("button", { name: "Next" })
    fireEvent.click(nextButton)
    const prevButton = screen.getByRole("button", { name: "Prev" })
    fireEvent.click(prevButton)
    expect(screen.getByRole("heading", { level: 1, name: "朝ご飯" })).toBeInTheDocument()
  })

  it("restarts to first word when Restart is clicked at last word", () => {
    render(<PracticePage />)

    // count=3: index 0 → 1 → 2 (last), then Next becomes Restart
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    const restartButton = screen.getByRole("button", { name: "Restart" })
    fireEvent.click(restartButton)
    expect(screen.getByRole("heading", { level: 1, name: "朝ご飯" })).toBeInTheDocument()
  })

  it("shows Next label then Restart label at the right times", () => {
    render(<PracticePage />)

    // At first word, button says Next (not Restart)
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Restart" })).not.toBeInTheDocument()

    // Navigate to last word (index 2 of count=3)
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    // At last word, button says Restart (not Next)
    expect(screen.getByRole("button", { name: "Restart" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument()

    // Click Restart → back to first word, button says Next again
    fireEvent.click(screen.getByRole("button", { name: "Restart" }))
    expect(screen.getByRole("heading", { level: 1, name: "朝ご飯" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Restart" })).not.toBeInTheDocument()
  })

  it("shows Restart immediately when session has only one word", () => {
    // count=1: index 0 is already the last word (sessionCount - 1 = 0)
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?count=1") as ReadonlyURLSearchParams)

    render(<PracticePage />)

    // Restart button is shown right away; no Next needed
    expect(screen.getByRole("button", { name: "Restart" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Restart" }))
    expect(screen.getByRole("heading", { level: 1, name: "朝ご飯" })).toBeInTheDocument()
  })

  it("toggles the draw canvas with the Learn to draw button", async () => {
    render(<PracticePage />)

    expect(screen.queryByTestId("draw-canvas")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Learn to draw" }))
    expect(await screen.findByTestId("draw-canvas")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Stop drawing" }))
    expect(screen.queryByTestId("draw-canvas")).not.toBeInTheDocument()
  })

  it("switches between preview and draw mode", async () => {
    render(<PracticePage />)

    fireEvent.click(screen.getByRole("button", { name: "Preview stroke order" }))
    expect(screen.queryByTestId("draw-canvas")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Learn to draw" }))
    expect(await screen.findByTestId("draw-canvas")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Stop drawing" }))
    expect(screen.queryByTestId("draw-canvas")).not.toBeInTheDocument()
  })

  it("resets to idle when moving to the next word", async () => {
    render(<PracticePage />)

    fireEvent.click(screen.getByRole("button", { name: "Learn to draw" }))
    expect(await screen.findByTestId("draw-canvas")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.queryByTestId("draw-canvas")).not.toBeInTheDocument()
  })

  describe("pronunciation diff", () => {
    type Handlers = {
      onresult: ((e: unknown) => void) | null
      onerror: ((e: unknown) => void) | null
      onend: (() => void) | null
    }
    const instances: Handlers[] = []
    const rec = {
      get current() {
        return instances[instances.length - 1]
      }
    }
    const win = window as unknown as Record<string, unknown>

    class FakeRecognition {
      onstart: (() => void) | null = null
      onresult: ((e: unknown) => void) | null = null
      onerror: ((e: unknown) => void) | null = null
      onend: (() => void) | null = null
      start = () => this.onstart?.()
      stop = () => this.onend?.()
      abort = () => { }
      constructor() {
        instances.push(this)
      }
    }

    const say = (transcript: string) =>
      act(() => {
        rec.current.onresult!({ resultIndex: 0, results: { length: 1, 0: { 0: { transcript } } } })
        rec.current.onend!()
      })

    beforeEach(() => {
      instances.length = 0
      win.SpeechRecognition = FakeRecognition
    })
    afterEach(() => {
      delete win.SpeechRecognition
    })

    it("shows the diff in romaji, with no Japanese characters, after speaking", () => {
      render(<PracticePage />)
      fireEvent.click(screen.getByRole("button", { name: "Speak" }))
      say("朝ごはん")

      expect(screen.getByText("Expected")).toBeInTheDocument()
      const diff = screen.getByText("You said").parentElement!.parentElement!
      expect(diff.textContent).toContain("asagohan")
      expect(diff.textContent).not.toMatch(/[\u3040-\u30ff\u4e00-\u9fff?]/)
    })

    it("highlights wrong sounds in romaji", () => {
      render(<PracticePage />)
      fireEvent.click(screen.getByRole("button", { name: "Speak" }))
      say("みず")

      expect(document.querySelector(".bg-red-200")).toBeInTheDocument()
      expect(document.querySelector(".bg-green-200")?.textContent).toMatch(/mizu|miz|zu|mi/)
    })

    it("clears the diff when moving to the next word", () => {
      render(<PracticePage />)
      fireEvent.click(screen.getByRole("button", { name: "Speak" }))
      say("みず")
      expect(screen.getByText("You said")).toBeInTheDocument()
      expect(screen.getByText("mizu")).toBeInTheDocument()

      fireEvent.click(screen.getByRole("button", { name: "Next" }))
      expect(screen.queryByText("mizu")).not.toBeInTheDocument()
    })

    it("shows a message when recognition fails", () => {
      render(<PracticePage />)
      fireEvent.click(screen.getByRole("button", { name: "Speak" }))
      act(() => rec.current.onerror!({ error: "not-allowed" }))
      expect(screen.getByText(/not-allowed/)).toBeInTheDocument()
    })

    it("disables the Speak button while listening", () => {
      render(<PracticePage />)

      const speakButton = screen.getByRole("button", { name: "Speak" })
      expect(speakButton).not.toBeDisabled()

      fireEvent.click(speakButton)

      expect(speakButton).toBeDisabled()
    })
  })

  it("shows an unsupported message when the browser has no speech recognition", () => {
    render(<PracticePage />)
    expect(screen.getByText(/isn't supported in this browser/)).toBeInTheDocument()
  })

  describe("word index persistence", () => {
    it("updates the URL index when navigating", async () => {
      render(<PracticePage />)

      // Start at first word
      expect(screen.getByRole("heading", { level: 1, name: "朝ご飯" })).toBeInTheDocument()

      // Move to second word
      fireEvent.click(screen.getByRole("button", { name: "Next" }))
      expect(screen.getByRole("heading", { level: 1, name: "ごはん" })).toBeInTheDocument()
      expect(mockPush).toHaveBeenCalledWith("?count=3&index=1")

      // Move to third word
      fireEvent.click(screen.getByRole("button", { name: "Next" }))
      expect(screen.getByRole("heading", { level: 1, name: "みず" })).toBeInTheDocument()
      expect(mockPush).toHaveBeenCalledWith("?count=3&index=2")
    })

    it("resumes on the index from the URL on refresh", async () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams("?count=3&index=2") as ReadonlyURLSearchParams
      )

      render(<PracticePage />)

      expect(screen.getByRole("heading", { level: 1, name: "みず" })).toBeInTheDocument()
    })

    it("resumes at the first incomplete word on reload when no index is given", async () => {
      // Complete the first two words (breakfast, rice); water is next
      localStorage.setItem(
        "learn-japanese:completed-words",
        JSON.stringify({
          breakfast: { heard: true, written: true, pronounced: true, celebrated: false },
          rice: { heard: true, written: true, pronounced: true, celebrated: false },
        })
      )

      render(<PracticePage />)

      // Statuses load asynchronously after mount, so we start on the first
      // word and resume at the first incomplete one once they are ready.
      await waitFor(() =>
        expect(screen.getByRole("heading", { level: 1, name: "みず" })).toBeInTheDocument()
      )
    })

    it("resets the URL index to 0 on restart", async () => {
      render(<PracticePage />)

      // Navigate to last word so Restart button shows
      fireEvent.click(screen.getByRole("button", { name: "Next" }))
      fireEvent.click(screen.getByRole("button", { name: "Next" }))
      expect(screen.getByRole("heading", { level: 1, name: "みず" })).toBeInTheDocument()

      fireEvent.click(screen.getByRole("button", { name: "Restart" }))
      expect(screen.getByRole("heading", { level: 1, name: "朝ご飯" })).toBeInTheDocument()
      expect(mockPush).toHaveBeenCalledWith("?count=3&index=0")
    })
  })

  describe("arrow key navigation", () => {
    it("goes to previous word on ArrowLeft", async () => {
      render(<PracticePage />)

      expect(screen.getByRole("heading", { level: 1, name: "朝ご飯" })).toBeInTheDocument()

      fireEvent.click(screen.getByRole("button", { name: "Next" }))
      expect(screen.getByRole("heading", { level: 1, name: "ごはん" })).toBeInTheDocument()

      fireEvent.keyDown(window, { key: "ArrowLeft" })
      expect(screen.getByRole("heading", { level: 1, name: "朝ご飯" })).toBeInTheDocument()
      expect(mockPush).toHaveBeenCalledWith("?count=3&index=0")
    })

    it("goes to next word on ArrowRight", async () => {
      render(<PracticePage />)

      expect(screen.getByRole("heading", { level: 1, name: "朝ご飯" })).toBeInTheDocument()

      fireEvent.keyDown(window, { key: "ArrowRight" })
      expect(screen.getByRole("heading", { level: 1, name: "ごはん" })).toBeInTheDocument()
      expect(mockPush).toHaveBeenCalledWith("?count=3&index=1")
    })

    it("restarts to first word on ArrowRight at last word", async () => {
      render(<PracticePage />)

      // Navigate to last word (index 2)
      fireEvent.keyDown(window, { key: "ArrowRight" })
      fireEvent.keyDown(window, { key: "ArrowRight" })
      expect(screen.getByRole("heading", { level: 1, name: "みず" })).toBeInTheDocument()

      fireEvent.keyDown(window, { key: "ArrowRight" })
      expect(screen.getByRole("heading", { level: 1, name: "朝ご飯" })).toBeInTheDocument()
      expect(mockPush).toHaveBeenCalledWith("?count=3&index=0")
    })

    it("does not toggle preview or draw mode with arrow keys", async () => {
      render(<PracticePage />)

      expect(screen.queryByTestId("draw-canvas")).not.toBeInTheDocument()

      fireEvent.keyDown(window, { key: "ArrowRight" })
      expect(screen.queryByTestId("draw-canvas")).not.toBeInTheDocument()
      expect(screen.getByRole("heading", { level: 1, name: "ごはん" })).toBeInTheDocument()
    })
  })

  describe("daily streak", () => {
    it("records completion when a word is completed and daily streak is enabled", async () => {
      const mockRecordCompletion = vi.fn()
      mockUseSettings.mockReturnValue({
        backgroundImage: "none",
        setBackgroundImage: vi.fn(),
        dailyStreak: true,
        setDailyStreak: vi.fn()
      })
      mockUseDailyStreak.mockReturnValue({
        recordCompletion: mockRecordCompletion,
        counts: {},
        getCount: vi.fn(() => 0),
        currentStreak: 0,
        today: () => "2026-11-01",
        reset: vi.fn()
      })

      render(<PracticePage />)

      // Complete the word by setting all three statuses in localStorage
      // The celebration effect will trigger recordCompletion
      localStorage.setItem(
        "learn-japanese:completed-words",
        JSON.stringify({
          breakfast: { heard: true, written: true, pronounced: true, celebrated: false }
        })
      )

      // Wait for the effect to run
      await waitFor(() => {
        expect(mockRecordCompletion).toHaveBeenCalledTimes(1)
      })
    })

    it("does not record completion when daily streak is disabled", async () => {
      const mockRecordCompletion = vi.fn()
      mockUseSettings.mockReturnValue({
        backgroundImage: "none",
        setBackgroundImage: vi.fn(),
        dailyStreak: false,
        setDailyStreak: vi.fn()
      })
      mockUseDailyStreak.mockReturnValue({
        recordCompletion: mockRecordCompletion,
        counts: {},
        getCount: vi.fn(() => 0),
        currentStreak: 0,
        today: () => "2026-11-01",
        reset: vi.fn()
      })

      render(<PracticePage />)

      // Complete the word
      localStorage.setItem(
        "learn-japanese:completed-words",
        JSON.stringify({
          breakfast: { heard: true, written: true, pronounced: true, celebrated: false }
        })
      )

      await waitFor(() => {
        expect(mockRecordCompletion).not.toHaveBeenCalled()
      })
    })
  })
})
