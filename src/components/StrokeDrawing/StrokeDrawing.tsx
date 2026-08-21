"use client"

import { useState } from "react"
import { useKanjiStrokes } from "@/hooks/useKanjiStrokes"
import { KanjiVGAttribution } from "@/components/StrokePreview/KanjiVGAttribution"

type Props = {
  characters: string[]
}

export function StrokeDrawing({ characters }: Props) {
  const { strokesByChar, statusByChar } = useKanjiStrokes(characters)
  const [activeIndex, setActiveIndex] = useState(0)

  const safeIndex = Math.min(activeIndex, Math.max(0, characters.length - 1))
  const activeChar = characters[safeIndex]

  // Go back to the first character when the word changes.
  const charsKey = characters.join("")
  const [prevCharsKey, setPrevCharsKey] = useState(charsKey)
  if (prevCharsKey !== charsKey) {
    setPrevCharsKey(charsKey)
    setActiveIndex(0)
  }

  const status = activeChar ? statusByChar[activeChar] : undefined
  const strokes = activeChar ? strokesByChar[activeChar] ?? null : null

  return (
    <div className="flex flex-col items-center gap-4">
      {status === "loading" ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading…</p>
      ) : status === "error" ? (
        <p className="text-xs text-orange-600 dark:text-orange-400">
          Failed to load stroke data for {activeChar}. Try again later.
        </p>
      ) : status === "missing" || !strokes || strokes.length === 0 ? (
        <>
          <div
            className="w-44 h-44 flex items-center justify-center text-6xl text-zinc-400 dark:text-zinc-500"
          >
            {activeChar ?? ""}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
            No stroke data for this character.
          </p>
        </>
      ) : (
        <>
          <svg
            viewBox="0 0 109 109"
            className="w-44 h-44 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
            data-testid="draw-canvas"
            aria-label="Draw the current stroke here"
            xmlns="http://www.w3.org/2000/svg"
          >
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
          </svg>
        </>
      )}

      <KanjiVGAttribution />
    </div>
  )
}

export default StrokeDrawing
