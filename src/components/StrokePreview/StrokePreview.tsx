"use client"

import { useEffect, useRef, useState } from "react"
import { getStrokePaths, type Stroke } from "@/lib/kanjivg"
import { KanjiVGAttribution } from "./KanjiVGAttribution"

type Props = {
  characters: string[]
  strokeDelayMs?: number
}

function StrokeAnimation({
  strokes,
  strokeDelayMs
}: {
  strokes: Stroke[]
  strokeDelayMs: number
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
    <div className="flex flex-col items-center gap-4">
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

      <KanjiVGAttribution />
    </div>
  )
}

export function StrokePreview({
  characters,
  strokeDelayMs = 700
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [loaded, setLoaded] = useState<Record<string, Stroke[]>>({})
  // Tracks which characters have already been requested, so the load
  // effect's deps stay clean (no object identity in the dependency array).
  const loadedRef = useRef(new Set<string>())

  const safeIndex = Math.min(activeIndex, Math.max(0, characters.length - 1))
  const activeChar = characters[safeIndex]

  // Load stroke data for each character (lazy, cached).
  // NOTE: no "cancelled" flag here. React Strict Mode (dev) runs effects twice:
  // run #1 starts the fetch, cleanup cancels it, run #2 skips it because the
  // char is already in loadedRef -> the result was dropped and the plain-text
  // fallback showed forever. Writing into state after unmount is harmless.
  useEffect(() => {
    characters.forEach((char) => {
      if (loadedRef.current.has(char)) return
      loadedRef.current.add(char)
      getStrokePaths(char).then((r) => {
        if (r.ok) {
          setLoaded((prev) => ({ ...prev, [char]: r.strokes }))
        } else if (r.reason === "error") {
          // Real failure (network/HTTP): say so, and allow a retry on the
          // next render. A merely "missing" character is expected and silent.
          console.warn(`StrokePreview: failed to load strokes for "${char}"`, r)
          loadedRef.current.delete(char)
        }
      })
    })
  }, [characters])

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

  const strokes = activeChar ? loaded[activeChar] ?? null : null

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
          disabled={safeIndex <= 0}
          className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-40"
        >
          ‹ Prev
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
          className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-40"
        >
          Next ›
        </button>
      </div>

      {strokes && strokes.length > 0 ? (
        // key = fresh state + fresh <path> elements per character, so the new
        // kanji starts undrawn instead of animating back from the previous one.
        <StrokeAnimation
          key={`${safeIndex}-${activeChar}`}
          strokes={strokes}
          strokeDelayMs={strokeDelayMs}
        />
      ) : (
        <div className="w-44 h-44 flex items-center justify-center text-6xl text-zinc-400 dark:text-zinc-500">
          {activeChar ?? ""}
        </div>
      )}

      <p className="max-w-xs text-center text-xs text-zinc-500 dark:text-zinc-400">
        Printed fonts can look a little different from handwriting. That&apos;s normal.
      </p>
    </div>
  )
}

export default StrokePreview