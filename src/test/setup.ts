import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"

export const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn()
  }),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: () => "/"
}))

// Mock canvas-confetti so jsdom (no Canvas API) doesn't throw on animation frames
vi.mock("canvas-confetti", () => ({
  __esModule: true,
  default: vi.fn()
}))

// Mock document.startViewTransition for testing
Object.defineProperty(document, "startViewTransition", {
  value: vi.fn((callback: () => void) => callback()),
  writable: true
})
