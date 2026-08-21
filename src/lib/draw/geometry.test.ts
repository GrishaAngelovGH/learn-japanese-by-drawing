import { describe, it, expect } from "vitest"
import { sampleStroke, startDirection, distance, pathLength, densify } from "./geometry"

describe("sampleStroke", () => {
  it("returns both endpoints for a straight line", () => {
    const pts = sampleStroke("M0,0 L10,0", 5)
    expect(pts).toHaveLength(5)
    expect(pts[0]).toEqual({ x: 0, y: 0 })
    expect(pts[4]).toEqual({ x: 10, y: 0 })
  })

  it("spaces points evenly by arc length", () => {
    const pts = sampleStroke("M0,0 L10,0", 5)
    const xs = pts.map((p) => p.x)
    expect(xs).toEqual([0, 2.5, 5, 7.5, 10])
  })

  it("returns a single start point for count 1", () => {
    const pts = sampleStroke("M0,0 L10,0", 1)
    expect(pts).toHaveLength(1)
    expect(pts[0]).toEqual({ x: 0, y: 0 })
  })

  it("handles a relative cubic curve", () => {
    const pts = sampleStroke("M0,0 c 10,10 20,-10 30,0", 3)
    expect(pts).toHaveLength(3)
    expect(pts[0]).toEqual({ x: 0, y: 0 })
    expect(pts[2].x).toBeCloseTo(30)
    expect(pts[2].y).toBeCloseTo(0)
  })
})

describe("startDirection", () => {
  it("returns the start point and angle for a horizontal line", () => {
    const dir = startDirection("M0,0 L10,0")
    expect(dir.point).toEqual({ x: 0, y: 0 })
    expect(dir.angleDeg).toBeCloseTo(0)
  })

  it("returns 45 degrees for a diagonal going up-right", () => {
    const dir = startDirection("M0,0 L10,10")
    expect(dir.angleDeg).toBeCloseTo(45)
  })

  it("returns the initial tangent angle of a curve", () => {
    const dir = startDirection("M0,0 C10,10 20,-10 30,0")
    expect(dir.point).toEqual({ x: 0, y: 0 })
    expect(dir.angleDeg).toBeCloseTo(45)
  })
})

describe("distance", () => {
  it("computes euclidean distance", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5)
    expect(distance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBeCloseTo(0)
  })
})

describe("pathLength", () => {
  it("sums segment lengths", () => {
    expect(
      pathLength([
        { x: 0, y: 0 },
        { x: 3, y: 4 },
        { x: 3, y: 0 },
      ])
    ).toBeCloseTo(9) // 5 + 4
  })

  it("returns 0 for a single point", () => {
    expect(pathLength([{ x: 0, y: 0 }])).toBeCloseTo(0)
  })
})

describe("densify", () => {
  it("leaves short segments untouched", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]
    expect(densify(pts, 1)).toEqual(pts)
  })

  it("splits long segments so no gap exceeds maxGap", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]
    const out = densify(pts, 3)
    // 10 units split into gaps of at most 3 -> 4 segments (3.33... each)
    expect(out).toHaveLength(5)
    for (let i = 1; i < out.length; i++) {
      expect(distance(out[i - 1], out[i])).toBeLessThanOrEqual(3 + 1e-9)
    }
    expect(out[0]).toEqual({ x: 0, y: 0 })
    expect(out[out.length - 1]).toEqual({ x: 10, y: 0 })
  })

  it("returns a copy for empty / single input", () => {
    expect(densify([], 1)).toEqual([])
    expect(densify([{ x: 1, y: 2 }], 1)).toEqual([{ x: 1, y: 2 }])
  })
})
