"use client"

import { useRef, useState } from "react"
import { Undo2, Trash2, RotateCcw } from "lucide-react"
import { useKanjiStrokes } from "@/hooks/useKanjiStrokes"
import { useConfetti } from "@/hooks/useConfetti"
import { startDirection, toViewBoxPoint, type Point } from "@/lib/draw/geometry"
import { scoreStroke } from "@/lib/draw/score"
import { DEFAULT_THRESHOLD } from "@/lib/draw/config"
import { KanjiVGAttribution } from "@/components/StrokePreview/KanjiVGAttribution"
import { playStrokeSuccess, playStrokeFailure, playCharacterComplete, playWordComplete } from "@/lib/audio"

type Props = {
  characters: string[]
}

const ARROW_OFFSET = 4

export function StrokeDrawing({ characters }: Props) {
  const { strokesByChar, statusByChar } = useKanjiStrokes(characters)
  const [characterIndex, setCharacterIndex] = useState(0)
  const [strokeIndex, setStrokeIndex] = useState(0)
  const [trace, setTrace] = useState<Point[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [score, setScore] = useState(0)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [characterComplete, setCharacterComplete] = useState(false)
  const [wordComplete, setWordComplete] = useState(false)
  const [showTryAgain, setShowTryAgain] = useState(false)
  const [showAcceptFlash, setShowAcceptFlash] = useState(false)
  const { triggerConfetti } = useConfetti()
  const svgRef = useRef<SVGSVGElement>(null)

  const safeCharIndex = Math.min(
    characterIndex,
    Math.max(0, characters.length - 1)
  )
  const activeChar = characters[safeCharIndex]

  // Go back to the first character when the word changes.
  const charsKey = characters.join("")
  const [prevCharsKey, setPrevCharsKey] = useState(charsKey)
  if (prevCharsKey !== charsKey) {
    setPrevCharsKey(charsKey)
    setCharacterIndex(0)
    setStrokeIndex(0)
    setTrace([])
    setWordComplete(false)
  }

  const status = activeChar ? statusByChar[activeChar] : undefined
  const strokes = activeChar ? strokesByChar[activeChar] ?? null : null
  const strokeList = strokes ?? []
  const total = strokeList.length
  const safeStrokeIndex = Math.min(strokeIndex, Math.max(0, total - 1))
  const currentStroke = total > 0 ? strokeList[safeStrokeIndex] : null

  let arrowProps: { x: number; y: number; angle: number } | null = null
  if (currentStroke) {
    const { point, angleDeg } = startDirection(currentStroke.d)
    const angleRad = (angleDeg * Math.PI) / 180
    arrowProps = {
      x: point.x - ARROW_OFFSET * Math.cos(angleRad),
      y: point.y - ARROW_OFFSET * Math.sin(angleRad),
      angle: angleDeg,
    }
  }

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    const point = toViewBoxPoint(event, svgRef.current)
    if (!point) return
    svgRef.current?.setPointerCapture?.(event.pointerId)
    setIsDrawing(true)
    setTrace([point])
    setScore(0)
  }

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing) return
    const point = toViewBoxPoint(event, svgRef.current)
    if (!point) return
    const newTrace = [...trace, point]
    setTrace(newTrace)
    if (currentStroke) {
      const result = scoreStroke(currentStroke.d, newTrace)
      setScore(result.score)
    }
  }

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    setIsDrawing(false)
    svgRef.current?.releasePointerCapture?.(event.pointerId)

    if (!currentStroke || trace.length === 0) return

    const result = scoreStroke(currentStroke.d, trace)
    if (!result.judgeable) {
      return
    }

    if (result.score >= DEFAULT_THRESHOLD) {
      // Accept the stroke
      playStrokeSuccess()
      setScore(0)
      setTrace([])
      setFailedAttempts(0)
      setShowAcceptFlash(true)
      setTimeout(() => setShowAcceptFlash(false), 300)

      const nextStrokeIndex = strokeIndex + 1
      setStrokeIndex(nextStrokeIndex)
      if (nextStrokeIndex >= total) {
        // Check if this is the last character of the word
        if (characterIndex === characters.length - 1) {
          setCharacterComplete(true)
          setWordComplete(true)
          playWordComplete()
          triggerConfetti()
        } else {
          setCharacterComplete(true)
          playCharacterComplete()
        }
      }
    } else {
      // Reject the stroke
      playStrokeFailure()
      setScore(0)
      setTrace([])
      setFailedAttempts((prev) => prev + 1)
      setShowTryAgain(true)
      setTimeout(() => setShowTryAgain(false), 1500)
    }
  }

  const handlePointerCancel = (event: React.PointerEvent<SVGSVGElement>) => {
    setIsDrawing(false)
    svgRef.current?.releasePointerCapture?.(event.pointerId)
  }

  const handleClear = () => {
    setIsDrawing(false)
    setTrace([])
    setScore(0)
  }

  const handleUndo = () => {
    const nextTrace = trace.slice(0, -1)
    setTrace(nextTrace)
    if (currentStroke && nextTrace.length > 0) {
      const result = scoreStroke(currentStroke.d, nextTrace)
      setScore(result.score)
    } else {
      setScore(0)
    }
  }

  const handleRedraw = () => {
    setStrokeIndex(0)
    setTrace([])
    setScore(0)
    setFailedAttempts(0)
    setCharacterComplete(false)
    setWordComplete(false)
    setShowTryAgain(false)
  }

  const resetCharacterProgress = () => {
    setStrokeIndex(0)
    setTrace([])
    setScore(0)
    setFailedAttempts(0)
    setCharacterComplete(false)
    setWordComplete(false)
    setShowTryAgain(false)
  }

  const handleNextCharacter = () => {
    if (characterIndex < characters.length - 1) {
      setCharacterIndex((prev) => prev + 1)
      resetCharacterProgress()
    } else {
      // Last character - mark word as complete
      setWordComplete(true)
      playWordComplete()
    }
  }

  const handlePrevCharacter = () => {
    if (characterIndex > 0) {
      setCharacterIndex((prev) => prev - 1)
      resetCharacterProgress()
    }
  }

  const handleSkipCharacter = () => {
    handleNextCharacter()
  }

  const traceD =
    trace.length > 0
      ? trace.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ")
      : ""

  return (
    <div className="flex flex-col items-center gap-4">
      {wordComplete ? (
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Word complete!
          </span>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Press Next to practice the next word.
          </p>
        </div>
      ) : status === "loading" ? (
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
          <button
            type="button"
            onClick={handleSkipCharacter}
            aria-label="Skip this character"
            className="text-xs text-orange-600 dark:text-orange-400 hover:underline"
          >
            Skip
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevCharacter}
              disabled={characterIndex === 0}
              className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-40"
            >
              ‹ Prev
            </button>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Character {characterIndex + 1} of {characters.length}
            </span>
            <button
              type="button"
              onClick={handleNextCharacter}
              disabled={characterIndex >= characters.length - 1 && !characterComplete}
              className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-40"
            >
              Next ›
            </button>
          </div>
          {currentStroke && arrowProps && (
            <div className="flex flex-col items-center gap-1 h-17">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Draw direction
              </span>
              <svg
                width="48"
                height="48"
                viewBox="0 12 48 24"
                overflow="visible"
                className="shrink-0"
                style={{
                  transform: `rotate(${arrowProps.angle}deg)`,
                  transformOrigin: "center center",
                }}
              >
                <defs>
                  <marker
                    id="direction-arrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="5"
                    orient="auto"
                  >
                    <path d="M0,0 L0,10 L9,5 Z" fill="#f97316" />
                  </marker>
                </defs>
                <line
                  x1="6"
                  y1="12"
                  x2="42"
                  y2="12"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeLinecap="round"
                  markerEnd="url(#direction-arrow)"
                />
              </svg>
            </div>
          )}
          <svg
            ref={svgRef}
            viewBox="0 0 109 109"
            className="w-44 h-44 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 touch-none"
            style={{
              cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%238B4513' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08'/%3E%3Cpath d='M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02Z'/%3E%3C/svg%3E") 0 32, auto`
            }}
            data-testid="draw-canvas"
            aria-label="Draw the current stroke here"
            xmlns="http://www.w3.org/2000/svg"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            {/* Accepted strokes (before current): dark ink. */}
            {strokeList.map((s, i) =>
              i < strokeIndex ? (
                <path
                  key={`ink-${i}`}
                  d={s.d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null
            )}
            {/* Current stroke: dashed orange border (wide orange underlay + narrow guide on top). */}
            {currentStroke && !characterComplete && (
              <>
                <path
                  key="current-ink"
                  d={currentStroke.d}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6 4"
                />
                <path
                  key="current-guide"
                  d={currentStroke.d}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6 4"
                />
              </>
            )}
            {/* Not-yet-reached strokes: solid ghost grey. */}
            {strokeList.map((s, i) =>
              i > strokeIndex ? (
                <path
                  key={`ghost-${i}`}
                  d={s.d}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null
            )}
            {/* Start arrow for the current stroke. */}
            {arrowProps && !characterComplete && (
              <path
                key="start-arrow"
                d="M-4,0 L4,-4 L4,4 Z"
                transform={`translate(${arrowProps.x},${arrowProps.y}) rotate(${arrowProps.angle})`}
                fill="#f97316"
              />
            )}
            {/* User's live trace. */}
            {trace.length > 0 && (
              <path
                key="trace"
                d={traceD}
                fill="none"
                stroke="#2563eb"
                className="dark:stroke-[#60a5fa]"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
          {characterComplete ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Character complete!
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRedraw}
                  aria-label="Redraw character"
                  className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
                >
                  <RotateCcw className="size-4" />
                </button>
                {characterIndex < characters.length - 1 && (
                  <button
                    type="button"
                    onClick={handleNextCharacter}
                    aria-label="Next character"
                    className="px-3 py-1 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
                  >
                    Next character
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Stroke {strokeIndex + 1} / {total}
                </span>
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={trace.length === 0}
                  aria-label="Undo last point"
                  className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Undo2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={trace.length === 0}
                  aria-label="Clear all"
                  className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {currentStroke && (
                <div className="relative flex flex-col items-center gap-1">
                  {/* Overlaid in the gap above the score, so it takes no layout space. */}
                  <div className="absolute -top-4 inset-x-0 h-4 flex items-center justify-center pointer-events-none">
                    {showTryAgain ? (
                      <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                        Try again ({failedAttempts})
                      </span>
                    ) : showAcceptFlash ? (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        Great!
                      </span>
                    ) : null}
                  </div>
                  <span
                    className="text-3xl font-mono tabular-nums text-zinc-900 dark:text-zinc-100"
                    aria-live="polite"
                  >
                    {score}%
                  </span>
                  <div
                    className="w-32 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden relative"
                  >
                    <div
                      className="h-full bg-orange-500 transition-all duration-100"
                      style={{ width: `${Math.min(score, 100)}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-orange-300 dark:bg-orange-700"
                      style={{ left: `${DEFAULT_THRESHOLD}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      <div className="max-w-55 text-center">
        <KanjiVGAttribution />
      </div>
    </div>
  )
}

export default StrokeDrawing
