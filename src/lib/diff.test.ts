import { describe, expect, it } from "vitest"
import { diffChars } from "./diff"

describe("diffChars", () => {
  it("returns a single equal segment for identical input", () => {
    expect(diffChars("abc", "abc")).toEqual([{ op: "equal", text: "abc" }])
  })

  it("marks missing and extra characters", () => {
    expect(diffChars("kana", "kanna")).toEqual([
      { op: "equal", text: "kan" },
      { op: "insert", text: "n" },
      { op: "equal", text: "a" }
    ])
  })
})
