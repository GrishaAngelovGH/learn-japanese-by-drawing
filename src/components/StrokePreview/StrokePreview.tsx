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
  const total = strokes.length
  const done = total > 0 && visibleCount >= total

  useEffect(() => {
    if (total === 0) return
    const id = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= total) return prev
        return prev + 1
      })
    }, strokeDelayMs)
    return () => clearInterval(id)
  }, [total, strokeDelayMs])

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 109 109"
        className="w-40 h-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        {strokes.map((s, i) => {
          const visible = i < visibleCount
          return (
            <path
              key={s.strokeNumber}
              d={s.d}
              fill="none"
              stroke={visible ? "#f97316" : "#e5e7eb"}
              strokeWidth={visible ? 5 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: "stroke 250ms, stroke-width 250ms" }}
            />
          )
        })}
      </svg>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setVisibleCount(0)}
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
  const [loaded, setLoaded] = useState<Record<string, Stroke[]>>({})
  // Tracks which characters have already been requested, so the load
  // effect's deps stay clean (no object identity in the dependency array).
  const loadedRef = useRef(new Set<string>())

  // Load stroke data for each character (lazy, cached).
  useEffect(() => {
    let cancelled = false
    characters.forEach((char) => {
      if (loadedRef.current.has(char)) return
      loadedRef.current.add(char)
      getStrokePaths(char).then((r) => {
        if (cancelled) return
        if (r.ok) setLoaded((prev) => ({ ...prev, [char]: r.strokes }))
      })
    })
    return () => {
      cancelled = true
    }
  }, [characters])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-end gap-6">
        {characters.map((char) => {
          const strokes = loaded[char] ?? null
          if (!strokes || strokes.length === 0) {
            return (
              <div
                key={char}
                className="w-24 h-24 flex items-center justify-center text-4xl text-zinc-400 dark:text-zinc-500"
              >
                {char}
              </div>
            )
          }
          return (
            <StrokeAnimation
              key={char}
              strokes={strokes}
              strokeDelayMs={strokeDelayMs}
            />
          )
        })}
      </div>
    </div>
  )
}

export default StrokePreview
