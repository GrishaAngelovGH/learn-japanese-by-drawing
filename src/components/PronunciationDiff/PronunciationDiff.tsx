import { diffTokens, type DiffSegment } from "@/lib/diff"
import { toMoras } from "@/lib/romaji"

type Props = {
  /** Expected reading (kana). Shown to the learner as romaji. */
  expected: string
  /** What the speech recognizer heard. Shown to the learner as romaji. */
  actual: string
}

function renderSide(
  segments: DiffSegment[],
  side: "expected" | "actual"
) {
  return segments.map((seg, i) => {
    if (side === "expected") {
      if (seg.op === "insert") return null
      const cls = seg.op === "delete"
        ? // expected-only mora: marked for removal (keeps legacy .bg-red-200 for tests)
          "relative inline-block px-1 py-0.5 rounded-lg bg-red-200 text-red-900 dark:bg-red-900/30 dark:text-red-200 underline underline-offset-2 decoration-red-300/60 dark:decoration-red-500/40 font-medium"
        : // matched mora
          "relative inline-block px-1 py-0.5 rounded-lg bg-zinc-100/60 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200"
      return (
        <span key={i} className={cls}>
          {seg.text}
        </span>
      )
    }
    if (seg.op === "delete") return null
    const cls = seg.op === "insert"
      ? // recognized-only mora: marked as addition (keeps legacy .bg-green-200 for tests)
        "relative inline-block px-1 py-0.5 rounded-lg bg-green-200 text-green-900 dark:bg-green-900/30 dark:text-green-200 underline underline-offset-2 decoration-green-300/60 dark:decoration-green-500/40 font-medium"
      : // matched mora
        "relative inline-block px-1 py-0.5 rounded-lg bg-zinc-100/60 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200"
    return (
      <span key={i} className={cls}>
        {seg.text}
      </span>
    )
  })
}

export function PronunciationDiff({ expected, actual }: Props) {
  // Diff whole sounds (morae) but display them as romaji, so the learner never has to
  // compare Japanese characters.
  const segs = diffTokens(
    toMoras(expected),
    toMoras(actual),
    (m) => m.key,
    (m) => m.romaji
  )

  // Pronunciation is correct when every mora matched (no insertions or deletions).
  const isCorrect = segs.length > 0 && segs.every((s) => s.op === "equal")

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        <div className="rounded-l-lg border-r border-r-zinc-200 dark:border-r-zinc-800/60 p-3 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/30 transition-all duration-200">
          <div className="flex items-center gap-1 mb-1.5">
            <span className="flex-shrink-0 h-1 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
            <h3 className="text-[0.7rem] font-semibold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
              Expected
            </h3>
          </div>
          <div className="text-lg font-mono text-zinc-900 dark:text-zinc-100 leading-relaxed select-all">
            {renderSide(segs, "expected")}
          </div>
        </div>
        <div className="border-r border-r-zinc-200 dark:border-r-zinc-800/60 p-3 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-200">
          <div className="flex items-center gap-1 mb-1.5">
            <span className="flex-shrink-0 h-1 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
            <h3 className="text-[0.7rem] font-semibold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
              You said
            </h3>
          </div>
          <div className="text-lg font-mono text-zinc-900 dark:text-zinc-100 leading-relaxed select-all">
            {renderSide(segs, "actual")}
          </div>
        </div>
        {isCorrect ? (
          <div className="rounded-r-lg p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/60 flex flex-col items-center justify-center text-center transition-all duration-200">
            <span className="text-green-600 dark:text-green-400 font-bold text-lg">
              ✓
            </span>
            <span className="text-[0.7rem] font-semibold tracking-widest text-green-600 dark:text-green-400 uppercase mt-1">
              Correct
            </span>
          </div>
        ) : (
          <div className="rounded-r-lg p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 flex flex-col items-center justify-center text-center transition-all duration-200">
            <span className="text-red-600 dark:text-red-400 font-bold text-lg">
              ✗
            </span>
            <span className="text-[0.7rem] font-semibold tracking-widest text-red-600 dark:text-red-400 uppercase mt-1">
              Incorrect
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PronunciationDiff
