import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { TOURS } from "./tours"

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.tsx$/.test(name) && !/\.test\.tsx$/.test(name) ? [path] : []
  })
}

const allSource = sourceFiles(join(process.cwd(), "src"))
  .map((file) => readFileSync(file, "utf8"))
  .join("\n")

describe("TOURS", () => {
  const tours = Object.values(TOURS)

  it("has unique tour ids", () => {
    const ids = tours.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("only chains to tours that exist", () => {
    const ids = new Set(tours.map((t) => t.id))
    for (const tour of tours) {
      if (tour.next) expect(ids.has(tour.next)).toBe(true)
    }
  })

  it("gives every step a title and content", () => {
    for (const tour of tours) {
      for (const step of tour.steps) {
        expect(step.title).toBeTruthy()
        expect(step.content).toBeTruthy()
      }
    }
  })

  it("only targets data-tour attributes that exist in the app", () => {
    for (const tour of tours) {
      for (const step of tour.steps) {
        const match = /^\[data-tour="([^"]+)"\]$/.exec(String(step.target))
        expect(match, `unexpected target ${String(step.target)}`).not.toBeNull()
        expect(allSource, `missing data-tour="${match![1]}"`).toContain(
          `data-tour="${match![1]}"`
        )
      }
    }
  })
})
