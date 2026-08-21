"use client"

import { useRef, useState } from "react"
import { Undo2, Trash2 } from "lucide-react"
import { useKanjiStrokes } from "@/hooks/useKanjiStrokes"
import { startDirection, toViewBoxPoint, type Point } from "@/lib/draw/geometry"
import { KanjiVGAttribution } from "@/components/StrokePreview/KanjiVGAttribution"

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
  }

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing) return
    const point = toViewBoxPoint(event, svgRef.current)
    if (!point) return
    setTrace((prev) => [...prev, point])
  }

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    setIsDrawing(false)
    svgRef.current?.releasePointerCapture?.(event.pointerId)
  }

  const handlePointerCancel = (event: React.PointerEvent<SVGSVGElement>) => {
    setIsDrawing(false)
    svgRef.current?.releasePointerCapture?.(event.pointerId)
  }

  const handleClear = () => {
    setIsDrawing(false)
    setTrace([])
  }

  const handleUndo = () => {
    setTrace((prev) => prev.slice(0, -1))
  }

  const traceD =
    trace.length > 0
      ? trace.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ")
      : ""

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
            ref={svgRef}
            viewBox="0 0 109 109"
            className="w-44 h-44 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 touch-none"
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
            {currentStroke && (
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
            {arrowProps && (
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
        </>
      )}

      <KanjiVGAttribution />
    </div>
  )
}

export default StrokeDrawing
