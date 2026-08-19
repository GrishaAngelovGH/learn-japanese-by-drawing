/**
 * KanjiVG stroke-order helper (on-demand fetch, no bundled data).
 *
 * Data source: https://github.com/KanjiVG/kanjivg (CC BY-SA 3.0)
 * - Index:  https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kvg-index.json
 * - SVG:    https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/<hexcodepoint>.svg
 *
 * Only characters that are actually displayed are ever fetched.
 */

export type Stroke = {
  strokeNumber: number
  d: string
  type: string
}

const INDEX_URL =
  "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kvg-index.json"
const SVG_BASE =
  "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/"

let indexPromise: Promise<Record<string, string[]>> | null = null

function loadIndex(): Promise<Record<string, string[]>> {
  if (!indexPromise) {
    indexPromise = fetch(INDEX_URL).then(async (res) => {
      if (!res.ok) throw new Error(`KanjiVG index fetch failed: ${res.status}`)
      return (await res.json()) as Record<string, string[]>
    })
  }
  return indexPromise
}

/** Pick the canonical SVG filename for a character from the index entry. */
function pickFile(entry: string[]): string | null {
  if (entry.length === 0) return null
  // Prefer the plain "<hex>.svg"; variants are suffixed like "-Kaisho.svg".
  const plain = entry.find((f) => /^[0-9a-f]+\.svg$/.test(f))
  return plain ?? entry[0]
}

export type GetStrokesResult =
  | { ok: true; strokes: Stroke[] }
  | { ok: false; reason: "missing" | "error"; error?: unknown }

/**
 * Fetch and parse the ordered strokes for a single character.
 * Returns null-like result when the character is not in the KanjiVG dataset.
 */
export async function getStrokePaths(
  char: string
): Promise<GetStrokesResult> {
  if (!char) return { ok: false, reason: "missing" }
  try {
    const index = await loadIndex()
    const entry = index[char]
    if (!entry) return { ok: false, reason: "missing" }
    const file = pickFile(entry)
    if (!file) return { ok: false, reason: "missing" }

    const res = await fetch(`${SVG_BASE}${file}`)
    if (!res.ok) return { ok: false, reason: "error", error: `HTTP ${res.status}` }
    const svg = await res.text()

    const strokes = parseStrokePaths(svg)
    return { ok: true, strokes }
  } catch (error) {
    return { ok: false, reason: "error", error }
  }
}

/**
 * Parse the `kvg:StrokePaths_*` group out of a KanjiVG SVG, returning
 * strokes in their declared (stroke-order) sequence.
 */
function parseStrokePaths(svg: string): Stroke[] {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml")
  const paths = Array.from(
    doc.querySelectorAll('g[id^="kvg:StrokePaths"] path')
  ) as SVGPathElement[]
  return paths
    .map((p, i) => ({
      strokeNumber: Number(p.getAttribute("id")?.replace(/^kvg:[^:]+-s/, "")) || i + 1,
      d: p.getAttribute("d") ?? "",
      type: p.getAttribute("kvg:type") ?? ""
    }))
    .filter((s) => s.d.length > 0)
    .sort((a, b) => a.strokeNumber - b.strokeNumber)
}
