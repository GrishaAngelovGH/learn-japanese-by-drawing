import { render, act, screen, fireEvent } from "@testing-library/react"
import StreakPage from "./page"
import { mockPush } from "@/test/setup"

const mockBack = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: mockBack
  }),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: () => "/"
}))

vi.mock("@/lib/view-transition", () => ({
  useViewTransition: () => ({
    push: mockPush
  })
}))

vi.mock("@/contexts/SettingsContext", () => ({
  useSettings: vi.fn(() => ({
    dailyStreak: true,
    setDailyStreak: vi.fn()
  }))
}))

vi.mock("@/hooks/useDailyStreak", () => ({
  useDailyStreak: vi.fn(() => ({
    counts: {},
    currentStreak: 0,
    reset: vi.fn()
  }))
}))

vi.mock("@/hooks/useCompletedWords", () => ({
  useCompletedWords: vi.fn(() => ({
    isCompleted: vi.fn(() => false)
  }))
}))

describe("Streak Page", () => {
  it("should render the component", () => {
    const qmSpy = vi
      .spyOn(globalThis, "queueMicrotask")
      .mockImplementation((cb: () => void) => cb())
    try {
      let container
      act(() => {
        const rendered = render(<StreakPage />)
        container = rendered.container
      })
      expect(container).toMatchSnapshot()
    } finally {
      qmSpy.mockRestore()
    }
  })

  it("back button navigates to home when no history", () => {
    mockPush.mockClear()
    const qmSpy = vi
      .spyOn(globalThis, "queueMicrotask")
      .mockImplementation((cb: () => void) => cb())
    try {
      act(() => {
        render(<StreakPage />)
      })
      const back = screen.getByText("Back")
      fireEvent.click(back)
      expect(mockPush).toHaveBeenCalledWith("/")
    } finally {
      qmSpy.mockRestore()
    }
  })

  it("back uses router.back when history exists", () => {
    window.history.pushState({}, "", "/prev")
    mockBack.mockClear()
    mockPush.mockClear()
    const qmSpy = vi
      .spyOn(globalThis, "queueMicrotask")
      .mockImplementation((cb: () => void) => cb())
    try {
      act(() => {
        render(<StreakPage />)
      })
      const back = screen.getByText("Back")
      fireEvent.click(back)
      expect(mockBack).toHaveBeenCalled()
    } finally {
      qmSpy.mockRestore()
    }
  })
})
