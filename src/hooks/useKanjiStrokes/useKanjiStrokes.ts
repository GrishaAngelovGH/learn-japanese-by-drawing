import { useEffect, useRef, useState } from "react"
import { getStrokePaths, type Stroke } from "@/lib/kanjivg"

export type KanjiStrokesStatus = "loading" | "ready" | "missing" | "error"

export type UseKanjiStrokesResult = {
  strokesByChar: Record<string, Stroke[]>
  statusByChar: Record<string, KanjiStrokesStatus>
}

/**
 * Lazily loads and caches KanjiVG stroke data per character.
 *
 * Extracted from StrokePreview. Behaviour is identical, including the
 * Strict Mode note below.
 *
 * NOTE: no "cancelled" flag here. React Strict Mode (dev) runs effects twice:
 * run #1 starts the fetch, run #2 skips the char because it is already in
 * loadedRef -> the fetch from run #1 is the only one. Writing into state
 * after unmount is harmless.
 */
export function useKanjiStrokes(
  characters: string[]
): UseKanjiStrokesResult {
  const [strokesByChar, setStrokesByChar] = useState<Record<string, Stroke[]>>({})
  const [statusByChar, setStatusByChar] = useState<Record<string, KanjiStrokesStatus>>(
    {}
  )
  // Characters that have been requested at least once. Successfully loaded
  // and merely "missing" characters stay here (they are not retried).
  // Characters that hit a real error are removed so they get retried on the
  // next effect run.
  const loadedRef = useRef(new Set<string>())

  useEffect(() => {
    characters.forEach((char) => {
      if (loadedRef.current.has(char)) return
      loadedRef.current.add(char)
      setStatusByChar((prev) => ({ ...prev, [char]: "loading" }))
      getStrokePaths(char).then((r) => {
        if (r.ok) {
          setStrokesByChar((prev) => ({ ...prev, [char]: r.strokes }))
          setStatusByChar((prev) => ({ ...prev, [char]: "ready" }))
        } else if (r.reason === "error") {
          // Real failure (network/HTTP): say so, and allow a retry on the
          // next render. A merely "missing" character is expected and silent.
          console.warn(`useKanjiStrokes: failed to load strokes for "${char}"`, r)
          loadedRef.current.delete(char)
          setStatusByChar((prev) => ({ ...prev, [char]: "error" }))
        } else {
          setStatusByChar((prev) => ({ ...prev, [char]: "missing" }))
        }
      })
    })
  }, [characters])

  return { strokesByChar, statusByChar }
}
