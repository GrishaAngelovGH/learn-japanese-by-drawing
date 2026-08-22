import { describe, it, expect } from "vitest"
import { scoreStroke } from "./score"
import { sampleStroke } from "./geometry"

const straight = "M0,0 L100,0"

describe("scoreStroke", () => {
  it("perfect trace scores 100", () => {
    const user = sampleStroke(straight, 40)
    const result = scoreStroke(straight, user)
    expect(result.judgeable).toBe(true)
    expect(result.score).toBe(100)
    expect(result.coverage).toBe(1)
    expect(result.precision).toBe(1)
  })

  it("trace shifted a few units still scores high", () => {
    const user = sampleStroke(straight, 40).map((p) => ({ x: p.x + 2, y: p.y + 2 }))
    const result = scoreStroke(straight, user)
    expect(result.judgeable).toBe(true)
    expect(result.score).toBeGreaterThanOrEqual(90)
  })

  it("trace drawn in reverse direction scores low", () => {
    const forward = sampleStroke(straight, 40)
    const user = [...forward].reverse()
    const result = scoreStroke(straight, user)
    expect(result.judgeable).toBe(true)
    expect(result.score).toBeLessThan(50)
    expect(result.coverage).toBeLessThan(0.5)
  })

  it("scribble over whole canvas scores low (precision)", () => {
    const user = []
    for (let i = 0; i < 100; i++) {
      user.push({ x: Math.random() * 109, y: Math.random() * 109 })
    }
    const result = scoreStroke(straight, user)
    expect(result.judgeable).toBe(true)
    expect(result.score).toBeLessThan(40)
    expect(result.precision).toBeLessThan(0.5)
  })

  it("half a stroke scores about 50 (coverage)", () => {
    const forward = sampleStroke(straight, 40)
    const user = forward.slice(0, 20)
    const result = scoreStroke(straight, user)
    expect(result.judgeable).toBe(true)
    expect(result.score).toBeGreaterThan(30)
    expect(result.score).toBeLessThan(70)
  })

  it("tap with fewer than 3 points is not judgeable", () => {
    const result = scoreStroke(straight, [{ x: 0, y: 0 }, { x: 1, y: 1 }])
    expect(result.judgeable).toBe(false)
    expect(result.score).toBe(0)
  })

  it("empty input is not judgeable", () => {
    const result = scoreStroke(straight, [])
    expect(result.judgeable).toBe(false)
    expect(result.score).toBe(0)
  })

  it("very short total length is not judgeable", () => {
    const user = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]
    const result = scoreStroke(straight, user)
    expect(result.judgeable).toBe(false)
    expect(result.score).toBe(0)
  })

  it("score is always in range 0-100", () => {
    const forward = sampleStroke(straight, 40)
    const cases = [forward, [...forward].reverse(), []]
    for (const user of cases) {
      const result = scoreStroke(straight, user)
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
      expect(result.coverage).toBeGreaterThanOrEqual(0)
      expect(result.coverage).toBeLessThanOrEqual(1)
      expect(result.precision).toBeGreaterThanOrEqual(0)
      expect(result.precision).toBeLessThanOrEqual(1)
    }
  })
})
