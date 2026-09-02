import { describe, it, expect } from "vitest"
import { getLevel, LEVEL_THRESHOLDS, LEVEL_CLASSES } from "./levels"

describe("levels", () => {
  describe("getLevel", () => {
    it("returns 0 for 0 completions", () => {
      expect(getLevel(0)).toBe(0)
    })

    it("returns 1 for 1–2 completions", () => {
      expect(getLevel(1)).toBe(1)
      expect(getLevel(2)).toBe(1)
    })

    it("returns 2 for 3–5 completions", () => {
      expect(getLevel(3)).toBe(2)
      expect(getLevel(4)).toBe(2)
      expect(getLevel(5)).toBe(2)
    })

    it("returns 3 for 6+ completions", () => {
      expect(getLevel(6)).toBe(3)
      expect(getLevel(10)).toBe(3)
      expect(getLevel(100)).toBe(3)
    })

    it("treats negative numbers as 0", () => {
      expect(getLevel(-1)).toBe(0)
      expect(getLevel(-100)).toBe(0)
    })

    it("treats NaN as 0", () => {
      expect(getLevel(NaN)).toBe(0)
    })

    it("treats non-numbers as 0", () => {
      expect(getLevel(undefined as unknown as number)).toBe(0)
      expect(getLevel(null as unknown as number)).toBe(0)
      expect(getLevel("5" as unknown as number)).toBe(0)
    })
  })

  describe("LEVEL_THRESHOLDS", () => {
    it("has correct threshold values", () => {
      expect(LEVEL_THRESHOLDS[0]).toBe(0)
      expect(LEVEL_THRESHOLDS[1]).toBe(1)
      expect(LEVEL_THRESHOLDS[2]).toBe(3)
      expect(LEVEL_THRESHOLDS[3]).toBe(6)
    })
  })

  describe("LEVEL_CLASSES", () => {
    it("has classes for all four levels", () => {
      expect(LEVEL_CLASSES[0]).toBeDefined()
      expect(LEVEL_CLASSES[1]).toBeDefined()
      expect(LEVEL_CLASSES[2]).toBeDefined()
      expect(LEVEL_CLASSES[3]).toBeDefined()
    })

    it("has light and dark mode variants for each level", () => {
      Object.values(LEVEL_CLASSES).forEach((classes) => {
        expect(classes.light).toBeDefined()
        expect(classes.dark).toBeDefined()
        expect(typeof classes.light).toBe("string")
        expect(typeof classes.dark).toBe("string")
      })
    })

    it("uses green shades that darken with level", () => {
      expect(LEVEL_CLASSES[1].light).toContain("green-200")
      expect(LEVEL_CLASSES[2].light).toContain("green-400")
      expect(LEVEL_CLASSES[3].light).toContain("green-600")
    })
  })
})
