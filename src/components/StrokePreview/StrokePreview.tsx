"use client"

import { useEffect, useState } from "react"
import { useKanjiStrokes } from "@/hooks/useKanjiStrokes"
import { type Stroke } from "@/lib/kanjivg"
import { KanjiVGAttribution } from "./KanjiVGAttribution"
import { ArrowLeft, ArrowRight } from "lucide-react"

type Props = {
  characters: string[]
  /** Optional per-character meanings, parallel to `characters`. */
  characterMeanings?: string[]
  strokeDelayMs?: number
}

function StrokeAnimation({
  strokes,
  strokeDelayMs,
  character,
  meaning
}: {
  strokes: Stroke[]
  strokeDelayMs: number
  character?: string
  meaning?: string
}) {
  const [visibleCount, setVisibleCount] = useState(0)
  // Bumped on Replay so the animated paths remount at "undrawn" instead of
  // visibly un-drawing themselves in reverse.
  const [run, setRun] = useState(0)
  const total = strokes.length
  const done = total > 0 && visibleCount >= total
  // Each stroke takes most of the slot to draw, leaving a short pause before the next.
  const drawMs = Math.max(1, Math.round(strokeDelayMs * 0.8))

  useEffect(() => {
    if (total === 0) return
    // Start the first stroke right away (after the undrawn state has painted),
    // then start one more stroke every strokeDelayMs.
    const first = setTimeout(() => setVisibleCount(1), 30)
    const id = setInterval(() => {
      setVisibleCount((prev) => (prev >= total || prev === 0 ? prev : prev + 1))
    }, strokeDelayMs)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [total, strokeDelayMs, run])

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox="0 0 109 109"
        className="w-44 h-44"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Faint guide: the full character, so the learner sees what is coming. */}
        {strokes.map((s, i) => (
          <path
            key={`ghost-${i}`}
            d={s.d}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Ink: each stroke is traced along its path via stroke-dashoffset. */}
        {strokes.map((s, i) => {
          const started = i < visibleCount
          return (
            <path
              key={`ink-${run}-${i}`}
              d={s.d}
              fill="none"
              stroke="#f97316"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              // Normalise every path's length to 1 so the dash maths is the
              // same for all strokes. The gap is longer than the path so the
              // round cap can't leave a dot at the end while undrawn.
              pathLength={1}
              strokeDasharray="1 2"
              strokeDashoffset={started ? 0 : 1}
              style={{
                transition: `stroke-dashoffset ${drawMs}ms linear`
              }}
            />
          )
        })}
      </svg>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setVisibleCount(0)
            setRun((r) => r + 1)
          }}
          disabled={total === 0}
          className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline disabled:opacity-40"
        >
          Replay
        </button>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {done ? "Complete" : `Stroke ${Math.min(visibleCount, total)} / ${total}`}
        </span>
      </div>

      {meaning && (
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
            Character meaning
          </span>
          <div className="flex items-center justify-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
            >
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{character}</span>
              <span>{meaning}</span>
            </span>
          </div>
        </div>
      )}

      <KanjiVGAttribution />
    </div>
  )
}

export function StrokePreview({
  characters,
  characterMeanings,
  strokeDelayMs = 700
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const { strokesByChar } = useKanjiStrokes(characters)

  const safeIndex = Math.min(activeIndex, Math.max(0, characters.length - 1))
  const activeChar = characters[safeIndex]

  // Go back to the first character when the word changes. Done during render
  // (React's "adjust state when a prop changes" pattern) rather than in an
  // effect. Compared by content so a new array with the same characters
  // doesn't reset the user's position.
  const charsKey = characters.join("")
  const [prevCharsKey, setPrevCharsKey] = useState(charsKey)
  if (prevCharsKey !== charsKey) {
    setPrevCharsKey(charsKey)
    setActiveIndex(0)
  }

  const strokes = activeChar ? strokesByChar[activeChar] ?? null : null

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
          disabled={safeIndex <= 0}
          aria-label="Prev character"
          className="w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="size-3" />
        </button>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {characters.length === 0
            ? "No characters"
            : `Character ${safeIndex + 1} of ${characters.length}`}
        </span>
        <button
          type="button"
          onClick={() =>
            setActiveIndex((i) => Math.min(characters.length - 1, i + 1))
          }
          disabled={safeIndex >= characters.length - 1}
          aria-label="Next character"
          className="w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowRight className="size-3" />
        </button>
      </div>

      {strokes && strokes.length > 0 ? (
        // key = fresh state + fresh <path> elements per character, so the new
        // kanji starts undrawn instead of animating back from the previous one.
        <StrokeAnimation
          key={`${safeIndex}-${activeChar}`}
          strokes={strokes}
          strokeDelayMs={strokeDelayMs}
          character={activeChar}
          meaning={characterMeanings?.[safeIndex]}
        />
      ) : (
        <>
          <div className="w-44 h-44 flex items-center justify-center text-6xl text-zinc-400 dark:text-zinc-500">
            {activeChar ?? ""}
          </div>
          {characterMeanings?.[safeIndex] && (
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                Character meaning
              </span>
              <div className="flex items-center justify-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                >
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeChar}</span>
                  <span>{characterMeanings[safeIndex]}</span>
                </span>
              </div>
            </div>
          )}
        </>
      )}

      <p className="max-w-xs text-center text-xs text-zinc-500 dark:text-zinc-400">
        Printed fonts can look a little different from handwriting. That&apos;s normal.
      </p>
    </div>
  )
}

export default StrokePreview