import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { useSpeechRecognition } from "./index"

const instances: unknown[] = []

class FakeRecognition {
  lang = ""
  interimResults = false
  continuous = false
  onstart: (() => void) | null = null
  onresult: ((e: unknown) => void) | null = null
  onerror: ((e: unknown) => void) | null = null
  onend: (() => void) | null = null
  start = vi.fn(() => {
    this.onstart?.()
  })
  stop = vi.fn(() => {
    this.onend?.()
  })
  abort = vi.fn()
  constructor() {
    instances.push(this)
  }
}

beforeEach(() => {
  instances.length = 0
  ;(window as unknown as Record<string, unknown>).SpeechRecognition = FakeRecognition
  delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition
})

afterEach(() => {
  delete (window as unknown as Record<string, unknown>).SpeechRecognition
})

describe("useSpeechRecognition", () => {
  it("reports supported and idle initially", () => {
    const { result } = renderHook(() => useSpeechRecognition())
    expect(result.current.isSupported).toBe(true)
    expect(result.current.status).toBe("idle")
  })

  it("starts listening", () => {
    const { result } = renderHook(() => useSpeechRecognition())
    act(() => result.current.start())
    expect(result.current.status).toBe("listening")
  })

  it("captures transcript from results", () => {
    const { result } = renderHook(() => useSpeechRecognition())
    act(() => result.current.start())
    const rec = instances[0] as { onresult?: (e: unknown) => void; onerror?: (e: unknown) => void; onend?: () => void }
    act(() => {
      rec.onresult?.({
        resultIndex: 0,
        results: [{ 0: { transcript: "hello" }, length: 1 }],
        length: 1,
      })
    })
    expect(result.current.transcript).toContain("hello")
  })

  it("reports error", () => {
    const { result } = renderHook(() => useSpeechRecognition())
    act(() => result.current.start())
    const rec = instances[0] as { onresult?: (e: unknown) => void; onerror?: (e: unknown) => void; onend?: () => void }
    act(() => {
      rec.onerror?.({ error: "no-speech" })
    })
    expect(result.current.status).toBe("error")
    expect(result.current.error).toBe("no-speech")
  })

  it("reports unsupported when no ctor", () => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition
    const { result } = renderHook(() => useSpeechRecognition())
    expect(result.current.isSupported).toBe(false)
    expect(result.current.status).toBe("unsupported")
  })

  it("reset clears transcript", () => {
    const { result } = renderHook(() => useSpeechRecognition())
    act(() => result.current.start())
    const rec = instances[0] as { onresult?: (e: unknown) => void; onerror?: (e: unknown) => void; onend?: () => void }
    act(() => {
      rec.onresult?.({
        resultIndex: 0,
        results: [{ 0: { transcript: "hi" }, length: 1 }],
        length: 1,
      })
      rec.onend?.()
    })
    act(() => result.current.reset())
    expect(result.current.transcript).toBe("")
    expect(result.current.status).toBe("idle")
  })
})
