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
  useSearchParams: () => new URLSearchParams()
}))
