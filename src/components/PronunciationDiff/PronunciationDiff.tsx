import { diffChars, type DiffSegment } from "@/lib/diff"

type Props = {
  expected: string
  actual: string
}

function renderSide(segments: DiffSegment[], side: "expected" | "actual") {
  return segments.map((seg, i) => {
    if (side === "expected") {
      if (seg.op === "insert") return null
      const cls = seg.op === "delete" ? "bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-200" : ""
      return (
        <span key={i} className={cls}>
          {seg.text}
        </span>
      )
    }
    if (seg.op === "delete") return null
    const cls = seg.op === "insert" ? "bg-green-200 text-green-900 dark:bg-green-900/40 dark:text-green-200" : ""
    return (
      <span key={i} className={cls}>
        {seg.text}
      </span>
    )
  })
}

export function PronunciationDiff({ expected, actual }: Props) {
  const segs = diffChars(expected, actual)
  return (
    <div className="grid grid-cols-2 gap-4 text-sm font-mono">
      <div className="rounded border border-zinc-200 dark:border-zinc-700 p-3">
        <div className="text-xs text-zinc-500 mb-1">Expected</div>
        <div>{renderSide(segs, "expected")}</div>
      </div>
      <div className="rounded border border-zinc-200 dark:border-zinc-700 p-3">
        <div className="text-xs text-zinc-500 mb-1">You said</div>
        <div>{renderSide(segs, "actual")}</div>
      </div>
    </div>
  )
}

export default PronunciationDiff
